import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { cancelAnimation, scrollTo, useAnimatedReaction, useAnimatedRef, useAnimatedScrollHandler, useSharedValue, withTiming } from 'react-native-reanimated';
import { Indicator } from './Indicator';
import { MaterialTabItem } from './TabItem';
export const TABBAR_HEIGHT = 48;
/**
 * Basic usage looks like this:
 *
 * ```tsx
 * <Tabs.Container
 *   ...
 *   TabBarComponent={(props) => (
 *     <MaterialTabBar
 *       {...props}
 *       activeColor="red"
 *       inactiveColor="yellow"
 *       inactiveOpacity={1}
 *       labelStyle={{ fontSize: 14 }}
 *     />
 *   )}
 * >
 *   {...}
 * </Tabs.Container>
 * ```
 */

const MaterialTabBar = ({
  tabNames,
  indexDecimal,
  scrollEnabled = false,
  indicatorStyle,
  index,
  TabItemComponent = MaterialTabItem,
  getLabelText = name => String(name).toUpperCase(),
  onTabPress,
  style,
  tabProps,
  contentContainerStyle,
  labelStyle,
  inactiveColor,
  activeColor,
  tabStyle
}) => {
  const tabBarRef = useAnimatedRef();
  const windowWidth = useWindowDimensions().width;
  const isFirstRender = React.useRef(true);
  const [itemsLayoutGathering, setItemsLayoutGathering] = React.useState(new Map());
  const [tabBarWidth, setTabBarWidth] = React.useState(windowWidth);
  const tabsOffset = useSharedValue(0);
  const isScrolling = useSharedValue(false);
  const nTabs = tabNames.length;
  const [itemsLayout, setItemsLayout] = React.useState(scrollEnabled ? [] : tabNames.map((_, i) => {
    const tabWidth = tabBarWidth / nTabs;
    return {
      width: tabWidth,
      x: i * tabWidth
    };
  }));
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else if (!scrollEnabled) {
      // update items width on window resizing
      const tabWidth = tabBarWidth / nTabs;
      setItemsLayout(tabNames.map((_, i) => {
        return {
          width: tabWidth,
          x: i * tabWidth
        };
      }));
    }
  }, [scrollEnabled, nTabs, tabNames, tabBarWidth]);
  const onTabItemLayout = React.useCallback((event, name) => {
    if (scrollEnabled) {
      var _event$nativeEvent;

      if (!((_event$nativeEvent = event.nativeEvent) !== null && _event$nativeEvent !== void 0 && _event$nativeEvent.layout)) return;
      const {
        width,
        x
      } = event.nativeEvent.layout;
      setItemsLayoutGathering(itemsLayoutGathering => {
        const update = new Map(itemsLayoutGathering);
        return update.set(name, {
          width,
          x
        });
      });
    }
  }, [scrollEnabled]);
  const onLayout = React.useCallback(event => {
    const width = event.nativeEvent.layout.width;
    if (tabBarWidth !== width) setTabBarWidth(width);
  }, [tabBarWidth]);
  React.useEffect(() => {
    // pick out the layouts for the tabs we know about (in case they changed dynamically)
    const layout = Array.from(itemsLayoutGathering.entries()).filter(([tabName]) => tabNames.includes(tabName)).map(([, layout]) => layout).sort((a, b) => a.x - b.x);

    if (layout.length === tabNames.length) {
      setItemsLayout(layout);
    }
  }, [itemsLayoutGathering, tabNames]);
  const cancelNextScrollSync = useSharedValue(index.value);
  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      tabsOffset.value = event.contentOffset.x;
    },
    onBeginDrag: () => {
      isScrolling.value = true;
      cancelNextScrollSync.value = index.value;
    },
    onMomentumEnd: () => {
      isScrolling.value = false;
    }
  }, []);
  const currentIndexToSync = useSharedValue(index.value);
  const targetIndexToSync = useSharedValue(index.value);
  useAnimatedReaction(() => {
    return index.value;
  }, nextIndex => {
    if (scrollEnabled) {
      cancelAnimation(currentIndexToSync);
      targetIndexToSync.value = nextIndex;
      currentIndexToSync.value = withTiming(nextIndex);
    }
  }, [scrollEnabled]);
  useAnimatedReaction(() => {
    return currentIndexToSync.value === targetIndexToSync.value;
  }, canSync => {
    if (canSync && scrollEnabled && itemsLayout.length === nTabs && itemsLayout[index.value]) {
      const halfTab = itemsLayout[index.value].width / 2;
      const offset = itemsLayout[index.value].x;

      if (offset < tabsOffset.value || offset > tabsOffset.value + tabBarWidth - 2 * halfTab) {
        scrollTo(tabBarRef, offset - tabBarWidth / 2 + halfTab, 0, true);
      }
    }
  }, [scrollEnabled, itemsLayout, nTabs]);
  return /*#__PURE__*/React.createElement(Animated.ScrollView, {
    ref: tabBarRef,
    horizontal: true,
    style: style,
    contentContainerStyle: [styles.contentContainer, !scrollEnabled && {
      width: tabBarWidth
    }, contentContainerStyle],
    keyboardShouldPersistTaps: "handled",
    bounces: false,
    alwaysBounceHorizontal: false,
    scrollsToTop: false,
    showsHorizontalScrollIndicator: false,
    automaticallyAdjustContentInsets: false,
    overScrollMode: "never",
    scrollEnabled: scrollEnabled,
    onScroll: scrollEnabled ? onScroll : undefined,
    scrollEventThrottle: 16,
    onLayout: onLayout
  }, tabNames.map((name, i) => {
    var _tabProps$get;

    return /*#__PURE__*/React.createElement(TabItemComponent, {
      key: name,
      index: i,
      name: name,
      label: ((_tabProps$get = tabProps.get(name)) === null || _tabProps$get === void 0 ? void 0 : _tabProps$get.label) || getLabelText(name),
      onPress: onTabPress,
      onLayout: scrollEnabled ? event => onTabItemLayout(event, name) : undefined,
      scrollEnabled: scrollEnabled,
      indexDecimal: indexDecimal,
      labelStyle: labelStyle,
      activeColor: activeColor,
      inactiveColor: inactiveColor,
      style: tabStyle
    });
  }), itemsLayout.length === nTabs && /*#__PURE__*/React.createElement(Indicator, {
    indexDecimal: indexDecimal,
    itemsLayout: itemsLayout,
    fadeIn: scrollEnabled,
    style: indicatorStyle
  }));
};

const MemoizedTabBar = /*#__PURE__*/React.memo(MaterialTabBar);
export { MemoizedTabBar as MaterialTabBar };
const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap'
  }
});
//# sourceMappingURL=TabBar.js.map