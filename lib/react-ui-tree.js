var React = require('react');
var Tree = require('./tree');
var Node = require('./node');

module.exports = React.createClass({
  displayName: 'UITree',

  propTypes: {
    tree: React.PropTypes.object.isRequired,
    paddingLeft: React.PropTypes.number,
    renderNode: React.PropTypes.func.isRequired,
    onMove: React.PropTypes.func
  },

  getDefaultProps() {
    return {
      paddingLeft: 20
    };
  },

  getInitialState() {
    return this.init(this.props);
  },

  componentWillReceiveProps(nextProps) {
    if(!this._updated) this.setState(this.init(nextProps));
    else this._updated = false;
  },

  init(props) {
    var tree = new Tree(props.tree);
    tree.isNodeCollapsed = props.isNodeCollapsed;
    tree.renderNode = props.renderNode;
    tree.changeNodeCollapsed = props.changeNodeCollapsed;
    tree.updateNodesPosition();

    return {
      tree: tree,
      dragging: {
        id: null,
        x: null,
        y: null,
        w: null,
        h: null
      }
    };
  },

  getDraggingDom() {
    var tree = this.state.tree;
    var dragging = this.state.dragging;

    if(dragging && dragging.id) {
      var draggingIndex = tree.getIndex(dragging.id);
      var draggingStyles = {
        top: dragging.y,
        left: dragging.x,
        width: dragging.w
      };

      return (
        <div className="m-draggable" style={draggingStyles}>
          <Node
            tree={tree}
            index={draggingIndex}
            paddingLeft={this.props.paddingLeft}
          />
        </div>
      );
    }

    return null;
  },

  render() {
    var tree = this.state.tree;
    var dragging = this.state.dragging;
    var draggingDom = this.getDraggingDom();

    return (
      <div className="m-tree">
        {draggingDom}
        <Node
          tree={tree}
          index={tree.getIndex(1)}
          key={1}
          paddingLeft={this.props.paddingLeft}
          onDragStart={this.dragStart}
          onCollapse={this.toggleCollapse}
          dragging={dragging && dragging.id}
        />
      </div>
    );
  },

  dragStart(id, dom, e) {
    this.dragging = {
      id: id,
      w: dom.offsetWidth,
      h: dom.offsetHeight,
      x: dom.offsetLeft,
      y: dom.offsetTop
    };

    this._startX = dom.offsetLeft;
    this._startY = dom.offsetTop;
    this._offsetX = e.clientX;
    this._offsetY = e.clientY;
    this._start = true;

    window.addEventListener('mousemove', this.drag);
    window.addEventListener('mouseup', this.dragEnd);
  },

  // oh
  drag(e) {
    if(this._start) {
      this.setState({
        dragging: this.dragging
      });
      this._start = false;
    }

    var tree = this.state.tree;
    var dragging = this.state.dragging;
    var paddingLeft = this.props.paddingLeft;
    var newIndex = null;
    var index = tree.getIndex(dragging.id);
    var collapsed = index.node.collapsed;

    var _startX = this._startX;
    var _startY = this._startY;
    var _offsetX = this._offsetX;
    var _offsetY = this._offsetY;

    var pos = {
      x: _startX + e.clientX - _offsetX,
      y: _startY + e.clientY - _offsetY
    };
    dragging.x = pos.x;
    dragging.y = pos.y;

    var diffX = dragging.x - paddingLeft/2 - (index.left-2) * paddingLeft;
    var diffY = dragging.y - dragging.h/2 - (index.top-2) * dragging.h;

    var getNodePosition = function (index) {
      var parent = tree.getIndex(index.parent);
      var n = 0;
      while (index.prev) {
        index = tree.getIndex(index.prev);
        n++;
      }
      return {
        parent: parent.node,
        index: n
      }
    }

    var _this = this;
    var move = function (id, referenceId, placement, index) {
      if(!_this._from) {
        _this._from = getNodePosition(index);
      }
      newIndex = tree.move(id, referenceId, placement);
      if (newIndex) {
        _this._to = getNodePosition(newIndex);
      }
      return newIndex;
    };

    if(diffX < 0) { // left
      if(index.parent && !index.next) {
        newIndex = move(index.id, index.parent, 'after', index);
      }
    } else if(diffX > paddingLeft) { // right
      if(index.prev && !tree.getIndex(index.prev).node.collapsed) {
        newIndex = move(index.id, index.prev, 'append', index);
      }
    }

    if(newIndex) {
      index = newIndex;
      newIndex.node.collapsed = collapsed;
      dragging.id = newIndex.id;
    }

    if(diffY < 0) { // up
      var above = tree.getNodeByTop(index.top-1);
      newIndex = move(index.id, above.id, 'before', index);
    } else if(diffY > dragging.h) { // down
      if(index.next) {
        var below = tree.getIndex(index.next);
        if(below.children && below.children.length && !below.node.collapsed) {
          newIndex = move(index.id, index.next, 'prepend', index);
        } else {
          newIndex = move(index.id, index.next, 'after', index);
        }
      } else {
        var below = tree.getNodeByTop(index.top+index.height);
        if(below && below.parent !== index.id) {
          if(below.children && below.children.length) {
            newIndex = move(index.id, below.id, 'prepend', index);
          } else {
            newIndex = move(index.id, below.id, 'after', index);
          }
        }
      }
    }

    if(newIndex) {
      newIndex.node.collapsed = collapsed;
      dragging.id = newIndex.id;
    }

    this.setState({
      tree: tree,
      dragging: dragging
    });
  },

  dragEnd() {
    this.setState({
      dragging: {
        id: null,
        x: null,
        y: null,
        w: null,
        h: null
      }
    });

    var moveInfo = null;
    if (this._from && this._to &&
        ! (this._from.parent === this._to.parent && this._from.index === this._to.index)) {
      moveInfo = {
        from: this._from,
        to: this._to
      };
    }

    this.change(this.state.tree, moveInfo);

    this._from = null;
    this._to = null;

    window.removeEventListener('mousemove', this.drag);
    window.removeEventListener('mouseup', this.dragEnd);
  },

  change(tree, moveInfo) {
    this._updated = true;
    if(this.props.onChange) this.props.onChange(tree.obj);
    if(this.props.onMove && moveInfo) this.props.onMove(moveInfo);
  },

  toggleCollapse(nodeId) {
    var tree = this.state.tree;
    var index = tree.getIndex(nodeId);
    var node = index.node;
    node.collapsed = !node.collapsed;
    tree.updateNodesPosition();

    this.setState({
      tree: tree
    });

    this.change(tree);
  }
});
