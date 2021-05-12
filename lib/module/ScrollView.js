function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React from 'react';
import Animated from 'react-native-reanimated';
import { IS_IOS } from './helpers';
import { useAfterMountEffect, useChainCallback, useCollapsibleStyle, useScrollHandlerY, useSharedAnimatedRef, useTabNameContext, useTabsContext, useUpdateScrollViewContentSize } from './hooks';
/**
 * Use like a regular ScrollView.
 */

export const ScrollView = /*#__PURE__*/React.forwardRef(({
  contentContainerStyle,
  style,
  onContentSizeChange,
  children,
  refreshControl,
  ...rest
}, passRef) => {
  const name = useTabNameContext();
  const ref = useSharedAnimatedRef(passRef);
  const {
    setRef,
    contentInset,
    scrollYCurrent
  } = useTabsContext();
  const {
    style: _style,
    contentContainerStyle: _contentContainerStyle,
    progressViewOffset
  } = useCollapsibleStyle();
  const [canBindScrollEvent, setCanBindScrollEvent] = React.useState(false);
  useAfterMountEffect(() => {
    // we enable the scroll event after mounting
    // otherwise we get an `onScroll` call with the initial scroll position which can break things
    setCanBindScrollEvent(true);
  });
  const scrollHandler = useScrollHandlerY(name, {
    enabled: canBindScrollEvent
  });
  React.useEffect(() => {
    setRef(name, ref);
  }, [name, ref, setRef]);
  const scrollContentSizeChange = useUpdateScrollViewContentSize({
    name
  });
  const scrollContentSizeChangeHandlers = useChainCallback(scrollContentSizeChange, onContentSizeChange);
  return /*#__PURE__*/React.createElement(Animated.ScrollView, _extends({}, rest, {
    // @ts-expect-error reanimated types are broken on ref
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
      y: IS_IOS ? -contentInset + scrollYCurrent.value : 0,
      x: 0
    },
    automaticallyAdjustContentInsets: false,
    refreshControl: refreshControl && /*#__PURE__*/React.cloneElement(refreshControl, {
      progressViewOffset,
      ...refreshControl.props
    })
  }), children);
});
//# sourceMappingURL=ScrollView.js.map