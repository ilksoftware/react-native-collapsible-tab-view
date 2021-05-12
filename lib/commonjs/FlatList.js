"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlatList = void 0;

var _react = _interopRequireDefault(require("react"));

var _helpers = require("./helpers");

var _hooks = require("./hooks");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function FlatListImpl({
  contentContainerStyle,
  style,
  onContentSizeChange,
  refreshControl,
  ...rest
}, passRef) {
  const name = (0, _hooks.useTabNameContext)();
  const {
    setRef,
    contentInset,
    scrollYCurrent
  } = (0, _hooks.useTabsContext)();
  const ref = (0, _hooks.useSharedAnimatedRef)(passRef);

  const [canBindScrollEvent, setCanBindScrollEvent] = _react.default.useState(false);

  (0, _hooks.useAfterMountEffect)(() => {
    // we enable the scroll event after mounting
    // otherwise we get an `onScroll` call with the initial scroll position which can break things
    setCanBindScrollEvent(true);
  });
  const scrollHandler = (0, _hooks.useScrollHandlerY)(name, {
    enabled: canBindScrollEvent
  });
  const {
    style: _style,
    contentContainerStyle: _contentContainerStyle,
    progressViewOffset
  } = (0, _hooks.useCollapsibleStyle)();

  _react.default.useEffect(() => {
    setRef(name, ref);
  }, [name, ref, setRef]);

  const scrollContentSizeChange = (0, _hooks.useUpdateScrollViewContentSize)({
    name
  });
  const scrollContentSizeChangeHandlers = (0, _hooks.useChainCallback)(scrollContentSizeChange, onContentSizeChange);
  return /*#__PURE__*/_react.default.createElement(_helpers.AnimatedFlatList, _extends({}, rest, {
    // @ts-expect-error problem with reanimated types, they're missing `ref`
    ref: ref,
    bouncesZoom: false,
    style: [_style, style],
    contentContainerStyle: [_contentContainerStyle, contentContainerStyle],
    progressViewOffset: progressViewOffset,
    onScroll: scrollHandler,
    onContentSizeChange: scrollContentSizeChangeHandlers,
    scrollEventThrottle: 16,
    contentInset: {
      top: contentInset
    },
    contentOffset: {
      y: _helpers.IS_IOS ? -contentInset + scrollYCurrent.value : 0,
      x: 0
    },
    automaticallyAdjustContentInsets: false,
    refreshControl: refreshControl && /*#__PURE__*/_react.default.cloneElement(refreshControl, {
      progressViewOffset,
      ...refreshControl.props
    })
  }));
}
/**
 * Use like a regular FlatList.
 */


const FlatList = /*#__PURE__*/_react.default.forwardRef(FlatListImpl);

exports.FlatList = FlatList;
//# sourceMappingURL=FlatList.js.map