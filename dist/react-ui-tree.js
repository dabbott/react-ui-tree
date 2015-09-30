// var React = require('react');
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Tree = require('./tree');
var Node = require('./node');

var UITree = (function (_React$Component) {
  _inherits(UITree, _React$Component);

  // displayName: 'UITree'

  function UITree(props) {
    _classCallCheck(this, UITree);

    _get(Object.getPrototypeOf(UITree.prototype), 'constructor', this).call(this, props);
    this.state = this.init(props);

    this.getDraggingDom = this.getDraggingDom.bind(this);
    this.render = this.render.bind(this);
    this.dragEnd = this.dragEnd.bind(this);
    this.dragStart = this.dragStart.bind(this);
    this.drag = this.drag.bind(this);
    this.change = this.change.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
  }

  _createClass(UITree, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      // if(!this._updated)
      //   this.setState(this.init(nextProps));
      // else
      //   this._updated = false;
      if (!this._updated && !this._isDragging) this.setState(this.init(nextProps));else this._updated = false;
    }
  }, {
    key: 'init',
    value: function init(props) {
      var tree = new Tree(props.tree);
      tree.isNodeCollapsed = props.isNodeCollapsed;
      tree.renderNode = props.renderNode;
      tree.changeNodeCollapsed = props.changeNodeCollapsed;
      tree.updateNodesPosition();

      return {
        tree: tree,
        dragging: this.dragging || {
          id: null,
          x: null,
          y: null,
          w: null,
          h: null
        }
      };
    }
  }, {
    key: 'getDraggingDom',
    value: function getDraggingDom() {
      var tree = this.state.tree;
      var dragging = this.state.dragging;
      // debugger

      if (dragging && dragging.id) {
        var draggingIndex = tree.getIndex(dragging.id);
        var draggingStyles = {
          top: dragging.y,
          left: dragging.x,
          width: dragging.w
        };

        // if (! draggingIndex) {
        //   debugger
        // }

        return React.createElement(
          'div',
          { className: 'm-draggable', style: draggingStyles },
          React.createElement(Node, {
            tree: tree,
            index: draggingIndex,
            paddingLeft: this.props.paddingLeft
          })
        );
      }

      return null;
    }
  }, {
    key: 'render',
    value: function render() {
      // console.log('render');
      var tree = this.state.tree;
      var dragging = this.state.dragging;
      var draggingDom = this.getDraggingDom();

      return React.createElement(
        'div',
        { className: 'm-tree' },
        draggingDom,
        React.createElement(Node, {
          tree: tree,
          index: tree.getIndex(1),
          key: 1,
          paddingLeft: this.props.paddingLeft,
          onDragStart: this.dragStart,
          onCollapse: this.toggleCollapse,
          dragging: dragging && dragging.id
        })
      );
    }
  }, {
    key: 'dragStart',
    value: function dragStart(id, dom, e) {
      this._isDragging = true;

      // debugger
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

      if (this.props.onDragStart) this.props.onDragStart(e);

      window.addEventListener('mousemove', this.drag);
      window.addEventListener('mouseup', this.dragEnd);
    }
  }, {
    key: 'nodeWillAcceptChild',
    value: function nodeWillAcceptChild(id, childId) {
      if (this.props.nodeWillAcceptChild) {
        var tree = this.state.tree;
        var index = tree.getIndex(id);
        var child = tree.getIndex(childId);
        return this.props.nodeWillAcceptChild(index.node, child.node);
      } else {
        return true;
      }
    }

    // oh
  }, {
    key: 'drag',
    value: function drag(e) {
      // console.log('on drag')
      // debugger
      if (this._start) {
        // console.log('is start');
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

      var diffX = dragging.x - paddingLeft / 2 - (index.left - 2) * paddingLeft;
      var diffY = dragging.y - dragging.h / 2 - (index.top - 2) * dragging.h;

      var getNodePosition = function getNodePosition(index) {
        var parent = tree.getIndex(index.parent);
        var n = 0;
        while (index.prev) {
          index = tree.getIndex(index.prev);
          n++;
        }
        return {
          parent: parent.node,
          index: n
        };
      };

      var _this = this;
      var move = function move(id, referenceId, placement, index) {
        if (!_this._from) {
          _this._from = getNodePosition(index);
          _this._node = index.node;
        }
        newIndex = tree.move(id, referenceId, placement);
        if (newIndex) {
          _this._to = getNodePosition(newIndex);
        }
        return newIndex;
      };

      if (diffX < 0) {
        // left
        if (index.parent && !index.next) {
          newIndex = move(index.id, index.parent, 'after', index);
        }
      } else if (diffX > paddingLeft) {
        // right
        if (index.prev && !tree.getIndex(index.prev).node.collapsed) {
          if (this.nodeWillAcceptChild(index.prev, index.id)) {
            newIndex = move(index.id, index.prev, 'append', index);
          }
        }
      }

      if (newIndex) {
        index = newIndex;
        newIndex.node.collapsed = collapsed;
        this.dragging.id = dragging.id = newIndex.id;
      }

      if (diffY < 0) {
        // up
        var above = tree.getNodeByTop(index.top - 1);
        newIndex = move(index.id, above.id, 'before', index);
      } else if (diffY > dragging.h) {
        // down
        // debugger
        if (index.next) {
          var below = tree.getIndex(index.next);
          if (below.children && below.children.length && !below.node.collapsed) {
            newIndex = move(index.id, index.next, 'prepend', index);
          } else {
            newIndex = move(index.id, index.next, 'after', index);
          }
        } else {
          var below = tree.getNodeByTop(index.top + index.height);
          if (below && below.parent !== index.id) {
            if (below.children && below.children.length) {
              newIndex = move(index.id, below.id, 'prepend', index);
            } else {
              newIndex = move(index.id, below.id, 'after', index);
            }
          }
        }
      }

      if (newIndex) {
        newIndex.node.collapsed = collapsed;
        this.dragging.id = dragging.id = newIndex.id;
      }

      // console.log('new index', newIndex);
      if (this.props.onDragMove) this.props.onDragMove(e);

      this.setState({
        tree: tree,
        dragging: _.cloneDeep(dragging)
      });
    }
  }, {
    key: 'dragEnd',
    value: function dragEnd(e) {
      this._isDragging = false;

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
      if (this._from && this._to && !(this._from.parent === this._to.parent && this._from.index === this._to.index)) {
        moveInfo = {
          from: this._from,
          to: this._to,
          node: this._node
        };
      }

      this.change(this.state.tree, moveInfo);
      if (this.props.onDragEnd) this.props.onDragEnd(e);

      this._from = null;
      this._to = null;

      window.removeEventListener('mousemove', this.drag);
      window.removeEventListener('mouseup', this.dragEnd);
    }
  }, {
    key: 'change',
    value: function change(tree, moveInfo) {
      this._updated = true;
      this.dragging = null;
      if (this.props.onChange) this.props.onChange(tree.obj);
      if (this.props.onMove && moveInfo) this.props.onMove(moveInfo);
    }
  }, {
    key: 'toggleCollapse',
    value: function toggleCollapse(nodeId) {
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
  }]);

  return UITree;
})(React.Component);

;

UITree.propTypes = {
  tree: React.PropTypes.object.isRequired,
  paddingLeft: React.PropTypes.number,
  renderNode: React.PropTypes.func.isRequired,
  onMove: React.PropTypes.func
};

UITree.defaultProps = {
  paddingLeft: 20
};

module.exports = UITree;