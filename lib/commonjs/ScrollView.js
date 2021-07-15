"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ScrollView = void 0;

var _react = _interopRequireDefault(require("react"));

var _reactNativeReanimated = _interopRequireDefault(require("react-native-reanimated"));

var _helpers = require("./helpers");

var _hooks = require("./hooks");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

/**
 * Use like a regular ScrollView.
 */
const ScrollView = /*#__PURE__*/_react.default.forwardRef(({
  contentContainerStyle,
  style,
  onContentSizeChange,
  children,
  refreshControl,
  ...rest
}, passRef) => {
  const name = (0, _hooks.useTabNameContext)();
  const ref = (0, _hooks.useSharedAnimatedRef)(passRef);
  const {
    setRef,
    contentInset,
    scrollYCurrent
  } = (0, _hooks.useTabsContext)();
  const {
    style: _style,
    contentContainerStyle: _contentContainerStyle,
    progressViewOffset
  } = (0, _hooks.useCollapsibleStyle)();

  const [canBindScrollEvent, setCanBindScrollEvent] = _react.default.useState(false);

  (0, _hooks.useAfterMountEffect)(() => {
    // we enable the scroll event after mounting
    // otherwise we get an `onScroll` call with the initial scroll position which can break things
    setCanBindScrollEvent(true);
  });
  const scrollHandler = (0, _hooks.useScrollHandlerY)(name, {
    enabled: canBindScrollEvent
  });

  _react.default.useEffect(() => {
    setRef(name, ref);
  }, [name, ref, setRef]);

  const scrollContentSizeChange = (0, _hooks.useUpdateScrollViewContentSize)({
    name
  });
  const scrollContentSizeChangeHandlers = (0, _hooks.useChainCallback)(scrollContentSizeChange, onContentSizeChange);
  return /*#__PURE__*/_react.default.createElement(_reactNativeReanimated.default.ScrollView, _extends({}, rest, {
    ref: ref,
    bouncesZoom: false,
    style: [_style, style],
    contentContainerStyle: [_contentContainerStyle, // TODO: investigate types
    contentContainerStyle],
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
  }), children);
});

exports.ScrollView = ScrollView;
//# sourceMappingURL=ScrollView.js.map