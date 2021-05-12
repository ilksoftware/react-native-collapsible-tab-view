function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React from 'react';
import { AnimatedFlatList, IS_IOS } from './helpers';
import { useAfterMountEffect, useChainCallback, useCollapsibleStyle, useScrollHandlerY, useSharedAnimatedRef, useTabNameContext, useTabsContext, useUpdateScrollViewContentSize } from './hooks';

function FlatListImpl({
  contentContainerStyle,
  style,
  onContentSizeChange,
  refreshControl,
  ...rest
}, passRef) {
  const name = useTabNameContext();
  const {
    setRef,
    contentInset,
    scrollYCurrent
  } = useTabsContext();
  const ref = useSharedAnimatedRef(passRef);
  const [canBindScrollEvent, setCanBindScrollEvent] = React.useState(false);
  useAfterMountEffect(() => {
    // we enable the scroll event after mounting
    // otherwise we get an `onScroll` call with the initial scroll position which can break things
    setCanBindScrollEvent(true);
  });
  const scrollHandler = useScrollHandlerY(name, {
    enabled: canBindScrollEvent
  });
  const {
    style: _style,
    contentContainerStyle: _contentContainerStyle,
    progressViewOffset
  } = useCollapsibleStyle();
  React.useEffect(() => {
    setRef(name, ref);
  }, [name, ref, setRef]);
  const scrollContentSizeChange = useUpdateScrollViewContentSize({
    name
  });
  const scrollContentSizeChangeHandlers = useChainCallback(scrollContentSizeChange, onContentSizeChange);
  return /*#__PURE__*/React.createElement(AnimatedFlatList, _extends({}, rest, {
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
      y: IS_IOS ? -contentInset + scrollYCurrent.value : 0,
      x: 0
    },
    automaticallyAdjustContentInsets: false,
    refreshControl: refreshControl && /*#__PURE__*/React.cloneElement(refreshControl, {
      progressViewOffset,
      ...refreshControl.props
    })
  }));
}
/**
 * Use like a regular FlatList.
 */


export const FlatList = /*#__PURE__*/React.forwardRef(FlatListImpl);
//# sourceMappingURL=FlatList.js.map