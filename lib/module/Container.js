function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { runOnJS, runOnUI, useAnimatedReaction, useAnimatedScrollHandler, useAnimatedStyle, useDerivedValue, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { Context, TabNameContext } from './Context';
import { Lazy } from './Lazy';
import { MaterialTabBar, TABBAR_HEIGHT } from './MaterialTabBar';
import { Tab } from './Tab';
import { AnimatedFlatList, IS_IOS, ONE_FRAME_MS, scrollToImpl } from './helpers';
import { useAnimatedDynamicRefs, useContainerRef, useTabProps } from './hooks';

/**
 * Basic usage looks like this:
 *
 * ```tsx
 * import { Tabs } from 'react-native-collapsible-tab-view'
 *
 * const Example = () => {
 *   return (
 *     <Tabs.Container HeaderComponent={MyHeader}>
 *       <Tabs.Tab name="A">
 *         <ScreenA />
 *       </Tabs.Tab>
 *       <Tabs.Tab name="B">
 *         <ScreenB />
 *       </Tabs.Tab>
 *     </Tabs.Container>
 *   )
 * }
 * ```
 */
export const Container = /*#__PURE__*/React.memo( /*#__PURE__*/React.forwardRef(({
  initialTabName,
  headerHeight: initialHeaderHeight,
  minHeaderHeight = 0,
  tabBarHeight: initialTabBarHeight = TABBAR_HEIGHT,
  revealHeaderOnScroll = false,
  snapThreshold,
  children,
  HeaderComponent,
  TabBarComponent = MaterialTabBar,
  headerContainerStyle,
  cancelTranslation,
  containerStyle,
  lazy,
  cancelLazyFadeIn,
  pagerProps,
  onIndexChange,
  onTabChange
}, ref) => {
  const containerRef = useContainerRef();
  const [tabProps, tabNamesArray] = useTabProps(children, Tab);
  const [refMap, setRef] = useAnimatedDynamicRefs();
  const windowWidth = useWindowDimensions().width;
  const firstRender = React.useRef(true);
  const [containerWidth, setContainerWidth] = React.useState(windowWidth);
  const [containerHeight, setContainerHeight] = React.useState(undefined);
  const [tabBarHeight, setTabBarHeight] = React.useState(initialTabBarHeight);
  const [headerHeight, setHeaderHeight] = React.useState(!HeaderComponent ? 0 : initialHeaderHeight);
  const contentInset = React.useMemo(() => IS_IOS ? (headerHeight || 0) + (tabBarHeight || 0) : 0, [headerHeight, tabBarHeight]);
  const isSwiping = useSharedValue(false);
  const isSnapping = useSharedValue(false);
  const snappingTo = useSharedValue(0);
  const isGliding = useSharedValue(false);
  const offset = useSharedValue(0);
  const accScrollY = useSharedValue(0);
  const oldAccScrollY = useSharedValue(0);
  const accDiffClamp = useSharedValue(0);
  const isScrolling = useSharedValue(0);
  const scrollYCurrent = useSharedValue(0);
  const scrollY = useSharedValue(tabNamesArray.map(() => 0), false);
  const contentHeights = useSharedValue(tabNamesArray.map(() => 0), false);
  const tabNames = useDerivedValue(() => tabNamesArray, [tabNamesArray]);
  const index = useSharedValue(initialTabName ? tabNames.value.findIndex(n => n === initialTabName) : 0);
  const scrollX = useSharedValue(index.value * windowWidth, false);
  const pagerOpacity = useSharedValue(initialHeaderHeight === undefined || index.value !== 0 ? 0 : 1, false);
  const [data, setData] = React.useState(tabNamesArray);
  React.useEffect(() => {
    setData(tabNamesArray);
  }, [tabNamesArray]);
  const focusedTab = useDerivedValue(() => {
    return tabNames.value[index.value];
  }, [tabNames]);
  const calculateNextOffset = useSharedValue(index.value);
  const headerScrollDistance = useDerivedValue(() => {
    return headerHeight !== undefined ? headerHeight - minHeaderHeight : 0;
  }, [headerHeight, minHeaderHeight]);
  const getItemLayout = React.useCallback((_, index) => ({
    length: containerWidth,
    offset: containerWidth * index,
    index
  }), [containerWidth]);
  const indexDecimal = useDerivedValue(() => {
    return scrollX.value / containerWidth;
  }, [containerWidth]); // handle window resize

  React.useEffect(() => {
    if (!firstRender.current) {
      var _containerRef$current;

      (_containerRef$current = containerRef.current) === null || _containerRef$current === void 0 ? void 0 : _containerRef$current.scrollToIndex({
        index: index.value,
        animated: false
      });
    } // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [windowWidth]);
  const afterRender = useSharedValue(0);
  React.useEffect(() => {
    if (!firstRender.current) pagerOpacity.value = 0;
    afterRender.value = withDelay(ONE_FRAME_MS * 5, withTiming(1, {
      duration: 0
    }));
  }, [afterRender, pagerOpacity, tabNamesArray]);
  React.useEffect(() => {
    if (firstRender.current) {
      if (initialTabName !== undefined && index.value !== 0) {
        var _containerRef$current2;

        (_containerRef$current2 = containerRef.current) === null || _containerRef$current2 === void 0 ? void 0 : _containerRef$current2.scrollToIndex({
          index: index.value,
          animated: false
        });
      }

      firstRender.current = false;
    } // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [containerRef, initialTabName, windowWidth]); // the purpose of this is to scroll to the proper position if dynamic tabs are changing

  useAnimatedReaction(() => {
    return afterRender.value === 1;
  }, trigger => {
    if (trigger) {
      afterRender.value = 0;
      tabNamesArray.forEach(name => {
        'worklet';

        scrollToImpl(refMap[name], 0, scrollY.value[index.value] - contentInset, false);
      });
      pagerOpacity.value = withTiming(1);
    }
  }, [tabNamesArray, refMap, afterRender, contentInset]); // derived from scrollX
  // calculate the next offset and index if swiping
  // if scrollX changes from tab press,
  // the same logic must be done, but knowing
  // the next index in advance

  useAnimatedReaction(() => {
    const nextIndex = isSwiping.value ? Math.round(indexDecimal.value) : null;
    return nextIndex;
  }, nextIndex => {
    if (nextIndex !== null && nextIndex !== index.value) {
      calculateNextOffset.value = nextIndex;
    }
  }, []);
  const propagateTabChange = React.useCallback(change => {
    onTabChange === null || onTabChange === void 0 ? void 0 : onTabChange(change);
    onIndexChange === null || onIndexChange === void 0 ? void 0 : onIndexChange(change.index);
  }, [onIndexChange, onTabChange]);
  useAnimatedReaction(() => {
    return calculateNextOffset.value;
  }, i => {
    if (i !== index.value) {
      offset.value = scrollY.value[index.value] - scrollY.value[i] + offset.value;
      runOnJS(propagateTabChange)({
        prevIndex: index.value,
        index: i,
        prevTabName: tabNames.value[index.value],
        tabName: tabNames.value[i]
      });
      index.value = i;
    }
  }, []);
  const scrollHandlerX = useAnimatedScrollHandler({
    onScroll: event => {
      const {
        x
      } = event.contentOffset;
      scrollX.value = x;
    },
    onBeginDrag: () => {
      isSwiping.value = true;
    },
    onMomentumEnd: () => {
      isSwiping.value = false;
    }
  }, []);
  const renderItem = React.useCallback(({
    index: i
  }) => {
    if (!tabNames.value[i]) return null;
    return /*#__PURE__*/React.createElement(TabNameContext.Provider, {
      value: tabNames.value[i]
    }, lazy ? /*#__PURE__*/React.createElement(Lazy, {
      startMounted: i === index.value,
      cancelLazyFadeIn: cancelLazyFadeIn
    }, React.Children.toArray(children)[i]) : React.Children.toArray(children)[i]);
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  [children, lazy, tabNames.value, cancelLazyFadeIn]);
  const headerTranslateY = useDerivedValue(() => {
    return revealHeaderOnScroll ? -accDiffClamp.value : -Math.min(scrollYCurrent.value, headerScrollDistance.value);
  }, [revealHeaderOnScroll]);
  const stylez = useAnimatedStyle(() => {
    return {
      transform: [{
        translateY: headerTranslateY.value
      }]
    };
  }, [revealHeaderOnScroll]);
  const getHeaderHeight = React.useCallback(event => {
    const height = event.nativeEvent.layout.height;

    if (headerHeight !== height) {
      setHeaderHeight(height);
    }
  }, [headerHeight]);
  const getTabBarHeight = React.useCallback(event => {
    const height = event.nativeEvent.layout.height;
    if (tabBarHeight !== height) setTabBarHeight(height);
  }, [tabBarHeight]);
  const onLayout = React.useCallback(event => {
    const height = event.nativeEvent.layout.height;
    if (containerHeight !== height) setContainerHeight(height);
    const width = event.nativeEvent.layout.width;
    if (containerWidth !== width) setContainerWidth(width);
  }, [containerHeight, containerWidth]); // fade in the pager if the headerHeight is not defined

  useAnimatedReaction(() => {
    return (initialHeaderHeight === undefined || initialTabName !== undefined) && headerHeight !== undefined && pagerOpacity.value === 0;
  }, update => {
    if (update) {
      pagerOpacity.value = withTiming(1);
    }
  }, [headerHeight]);
  const pagerStylez = useAnimatedStyle(() => {
    return {
      opacity: pagerOpacity.value
    };
  }, []);
  const onTabPress = React.useCallback(name => {
    // simplify logic by preventing index change
    // when is scrolling or gliding.
    if (!isScrolling.value && !isGliding.value) {
      const i = tabNames.value.findIndex(n => n === name);
      calculateNextOffset.value = i;

      if (name === focusedTab.value) {
        const ref = refMap[name];
        runOnUI(scrollToImpl)(ref, 0, headerScrollDistance.value - contentInset, true);
      } else {
        var _containerRef$current3;

        (_containerRef$current3 = containerRef.current) === null || _containerRef$current3 === void 0 ? void 0 : _containerRef$current3.scrollToIndex({
          animated: true,
          index: i
        });
      }
    }
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  [containerRef, refMap, contentInset]);
  React.useEffect(() => {
    if (index.value >= tabNamesArray.length) {
      onTabPress(tabNamesArray[tabNamesArray.length - 1]);
    }
  }, [index.value, onTabPress, tabNamesArray]);
  const keyExtractor = React.useCallback(name => name, []);
  React.useImperativeHandle(ref, () => ({
    setIndex: index => {
      if (isScrolling.value || isGliding.value) return false;
      const name = tabNames.value[index];
      onTabPress(name);
      return true;
    },
    jumpToTab: name => {
      if (isScrolling.value || isGliding.value) return false;
      onTabPress(name);
      return true;
    },
    getFocusedTab: () => {
      return tabNames.value[index.value];
    },
    getCurrentIndex: () => {
      return index.value;
    }
  }), // eslint-disable-next-line react-hooks/exhaustive-deps
  [onTabPress]);
  return /*#__PURE__*/React.createElement(Context.Provider, {
    value: {
      contentInset,
      tabBarWidth: containerWidth || 0,
      tabBarHeight: tabBarHeight || 0,
      headerHeight: headerHeight || 0,
      refMap,
      tabNames,
      index,
      snapThreshold,
      revealHeaderOnScroll,
      focusedTab,
      accDiffClamp,
      indexDecimal,
      containerHeight,
      scrollYCurrent,
      scrollY,
      setRef,
      headerScrollDistance,
      accScrollY,
      oldAccScrollY,
      offset,
      isScrolling,
      scrollX,
      isGliding,
      isSnapping,
      snappingTo,
      contentHeights,
      headerTranslateY
    }
  }, /*#__PURE__*/React.createElement(Animated.View, {
    style: [styles.container, containerStyle],
    onLayout: onLayout,
    pointerEvents: "box-none"
  }, /*#__PURE__*/React.createElement(Animated.View, {
    pointerEvents: "box-none",
    style: [styles.topContainer, headerContainerStyle, !cancelTranslation && stylez]
  }, /*#__PURE__*/React.createElement(View, {
    style: [styles.container, styles.headerContainer],
    onLayout: getHeaderHeight,
    pointerEvents: "box-none"
  }, HeaderComponent && /*#__PURE__*/React.createElement(HeaderComponent, {
    containerRef: containerRef,
    index: index,
    tabNames: tabNamesArray,
    focusedTab: focusedTab,
    indexDecimal: indexDecimal,
    onTabPress: onTabPress,
    tabProps: tabProps
  })), /*#__PURE__*/React.createElement(View, {
    style: [styles.container, styles.tabBarContainer],
    onLayout: getTabBarHeight,
    pointerEvents: "box-none"
  }, TabBarComponent && /*#__PURE__*/React.createElement(TabBarComponent, {
    containerRef: containerRef,
    index: index,
    tabNames: tabNamesArray,
    focusedTab: focusedTab,
    indexDecimal: indexDecimal,
    onTabPress: onTabPress,
    tabProps: tabProps
  }))), headerHeight !== undefined && /*#__PURE__*/React.createElement(AnimatedFlatList // @ts-expect-error problem with reanimated types, they're missing `ref`
  , _extends({
    ref: containerRef,
    initialScrollIndex: index.value,
    data: data,
    keyExtractor: keyExtractor,
    renderItem: renderItem,
    horizontal: true,
    pagingEnabled: true,
    onScroll: scrollHandlerX,
    showsHorizontalScrollIndicator: false,
    getItemLayout: getItemLayout,
    scrollEventThrottle: 16,
    bounces: false
  }, pagerProps, {
    style: [pagerStylez, pagerProps === null || pagerProps === void 0 ? void 0 : pagerProps.style]
  }))));
}));
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  topContainer: {
    position: 'absolute',
    zIndex: 100,
    width: '100%',
    backgroundColor: 'white',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4
  },
  tabBarContainer: {
    zIndex: 1
  },
  headerContainer: {
    zIndex: 2
  }
});
//# sourceMappingURL=Container.js.map