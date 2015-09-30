'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var cx = require('classnames');
// var React = require('react');
var ReactDOM = require('react-dom');

var Node = (function (_React$Component) {
  _inherits(Node, _React$Component);

  function Node(props) {
    _classCallCheck(this, Node);

    _get(Object.getPrototypeOf(Node.prototype), 'constructor', this).call(this, props);
    this.state = {};

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleCollapse = this.handleCollapse.bind(this);
  }

  _createClass(Node, [{
    key: 'renderCollapse',
    value: function renderCollapse() {
      var index = this.props.index;

      if (index.children && index.children.length) {
        var collapsed = index.node.collapsed;

        return React.createElement('span', {
          className: cx('collapse', collapsed ? 'caret-right' : 'caret-down'),
          onMouseDown: function (e) {
            e.stopPropagation();
          },
          onClick: this.handleCollapse });
      }

      return null;
    }
  }, {
    key: 'renderChildren',
    value: function renderChildren() {
      var _this = this;

      var index = this.props.index;
      var tree = this.props.tree;
      var dragging = this.props.dragging;

      if (index.children && index.children.length) {
        var childrenStyles = {};
        if (index.node.collapsed) childrenStyles.display = 'none';
        childrenStyles['paddingLeft'] = this.props.paddingLeft + 'px';

        return React.createElement(
          'div',
          { className: 'children', style: childrenStyles },
          index.children.map(function (child) {
            var childIndex = tree.getIndex(child);
            return React.createElement(Node, {
              tree: tree,
              index: childIndex,
              key: childIndex.id,
              dragging: dragging,
              paddingLeft: _this.props.paddingLeft,
              onCollapse: _this.props.onCollapse,
              onDragStart: _this.props.onDragStart
            });
          })
        );
      }

      return null;
    }
  }, {
    key: 'render',
    value: function render() {
      var tree = this.props.tree;
      var index = this.props.index;
      var dragging = this.props.dragging;
      var node = index.node;
      var styles = {};

      return React.createElement(
        'div',
        { className: cx('m-node', {
            'placeholder': index.id === dragging
          }), style: styles },
        React.createElement(
          'div',
          { className: 'inner', ref: 'inner', onMouseDown: this.handleMouseDown },
          this.renderCollapse(),
          tree.renderNode(node)
        ),
        this.renderChildren()
      );
    }
  }, {
    key: 'handleCollapse',
    value: function handleCollapse(e) {
      e.stopPropagation();
      var nodeId = this.props.index.id;
      if (this.props.onCollapse) this.props.onCollapse(nodeId);
    }
  }, {
    key: 'handleMouseDown',
    value: function handleMouseDown(e) {
      var nodeId = this.props.index.id;
      var dom = this.refs.inner;
      if (this.props.onDragStart) {
        this.props.onDragStart(nodeId, dom, e);
      }
    }
  }]);

  return Node;
})(React.Component);

;

module.exports = Node;