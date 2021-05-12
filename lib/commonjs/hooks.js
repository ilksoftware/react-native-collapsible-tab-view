"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useContainerRef = useContainerRef;
exports.useAnimatedDynamicRefs = useAnimatedDynamicRefs;
exports.useTabProps = useTabProps;
exports.useTabsContext = useTabsContext;
exports.useTabNameContext = useTabNameContext;
exports.useCollapsibleStyle = useCollapsibleStyle;
exports.useUpdateScrollViewContentSize = useUpdateScrollViewContentSize;
exports.useChainCallback = useChainCallback;
exports.useScroller = useScroller;
exports.useSharedAnimatedRef = useSharedAnimatedRef;
exports.useAfterMountEffect = useAfterMountEffect;
exports.useConvertAnimatedToValue = useConvertAnimatedToValue;
exports.useHeaderMeasurements = useHeaderMeasurements;
exports.useFocusedTab = useFocusedTab;
exports.useAnimatedTabIndex = useAnimatedTabIndex;
exports.useScrollHandlerY = void 0;

var _react = require("react");

var _reactNativeReanimated = require("react-native-reanimated");

var _useDeepCompare = require("use-deep-compare");

var _Context = require("./Context");

var _helpers = require("./helpers");

function useContainerRef() {
  return (0, _reactNativeReanimated.useAnimatedRef)();
}

function useAnimatedDynamicRefs() {
  const [map, setMap] = (0, _react.useState)({});
  const setRef = (0, _react.useCallback)(function (key, ref) {
    setMap(map => ({ ...map,
      [key]: ref
    }));
    return ref;
  }, []);
  return [map, setRef];
}

function useTabProps(children, tabType) {
  const options = (0, _react.useMemo)(() => {
    const tabOptions = new Map();

    if (children) {
      _react.Children.forEach(children, (element, index) => {
        if (!element) return;
        if (element.type !== tabType) throw new Error('Container children must be wrapped in a <Tabs.Tab ... /> component'); // make sure children is excluded otherwise our props will mutate too much

        const {
          name,
          children,
          ...options
        } = element.props;
        if (tabOptions.has(name)) throw new Error("Tab names must be unique, ".concat(name, " already exists"));
        tabOptions.set(name, {
          index,
          name,
          ...options
        });
      });
    }

    return tabOptions;
  }, [children, tabType]);
  const optionEntries = Array.from(options.entries());
  const optionKeys = Array.from(options.keys());
  const memoizedOptions = (0, _useDeepCompare.useDeepCompareMemo)(() => options, [optionEntries]);
  const memoizedTabNames = (0, _useDeepCompare.useDeepCompareMemo)(() => optionKeys, [optionKeys]);
  return [memoizedOptions, memoizedTabNames];
}
/**
 * Hook exposing some useful variables.
 *
 * ```tsx
 * const { focusedTab, ...rest } = useTabsContext()
 * ```
 */


function useTabsContext() {
  const c = (0, _react.useContext)(_Context.Context);
  if (!c) throw new Error('useTabsContext must be inside a Tabs.Container');
  return c;
}
/**
 * Access the parent tab screen from any deep component.
 *
 * ```tsx
 * const tabName = useTabNameContext()
 * ```
 */


function useTabNameContext() {
  const c = (0, _react.useContext)(_Context.TabNameContext);
  if (!c) throw new Error('useTabNameContext must be inside a TabNameContext');
  return c;
}
/**
 * Hook to access some key styles that make the whole thing work.
 *
 * You can use this to get the progessViewOffset and pass to the refresh control of scroll view.
 */


function useCollapsibleStyle() {
  const {
    headerHeight,
    tabBarHeight,
    containerHeight,
    tabBarWidth
  } = useTabsContext(); // const windowWidth = useWindowDimensions().width

  return {
    style: {
      width: tabBarWidth
    },
    contentContainerStyle: {
      minHeight: _helpers.IS_IOS ? (containerHeight || 0) - tabBarHeight : (containerHeight || 0) + headerHeight,
      paddingTop: _helpers.IS_IOS ? 0 : headerHeight + tabBarHeight
    },
    progressViewOffset: headerHeight + tabBarHeight
  };
}

function useUpdateScrollViewContentSize({
  name
}) {
  const {
    tabNames,
    contentHeights
  } = useTabsContext();
  const setContentHeights = (0, _react.useCallback)((name, height) => {
    const tabIndex = tabNames.value.indexOf(name);
    contentHeights.value[tabIndex] = height;
    contentHeights.value = [...contentHeights.value];
  }, [contentHeights, tabNames.value]);
  const scrollContentSizeChange = (0, _react.useCallback)((_, h) => {
    (0, _reactNativeReanimated.runOnUI)(setContentHeights)(name, h);
  }, [setContentHeights, name]);
  return scrollContentSizeChange;
}
/**
 * Allows specifying multiple functions to be called in a sequence with the same parameters
 * Useful because we handle some events and need to pass them forward so that the caller can handle them as well
 * @param fns array of functions to call
 * @returns a function that once called will call all passed functions
 */


function useChainCallback(...fns) {
  const callAll = (0, _react.useCallback)((...args) => {
    fns.forEach(fn => {
      if (typeof fn === 'function') {
        fn(...args);
      }
    });
  }, [fns]);
  return callAll;
}

function useScroller() {
  const {
    contentInset
  } = useTabsContext();
  const scroller = (0, _react.useCallback)((ref, x, y, animated, _debugKey) => {
    'worklet';

    if (!ref) return; // console.log(`${_debugKey}, y: ${y}, y adjusted: ${y - contentInset}`)

    (0, _helpers.scrollToImpl)(ref, x, y - contentInset, animated);
  }, [contentInset]);
  return scroller;
}

const useScrollHandlerY = (name, {
  enabled
}) => {
  const {
    accDiffClamp,
    focusedTab,
    snapThreshold,
    revealHeaderOnScroll,
    refMap,
    tabNames,
    index,
    headerHeight,
    contentInset,
    containerHeight,
    scrollYCurrent,
    scrollY,
    isScrolling,
    isGliding,
    oldAccScrollY,
    accScrollY,
    offset,
    headerScrollDistance,
    isSnapping,
    snappingTo,
    contentHeights
  } = useTabsContext();
  /**
   * Helper value to track if user is dragging on iOS, because iOS calls
   * onMomentumEnd only after a vigorous swipe. If the user has finished the
   * drag, but the onMomentumEnd has never triggered, we need to manually
   * call it to sync the scenes.
   */

  const afterDrag = (0, _reactNativeReanimated.useSharedValue)(0);
  const tabIndex = (0, _react.useMemo)(() => tabNames.value.findIndex(n => n === name), [tabNames, name]);
  const scrollTo = useScroller();

  const onMomentumEnd = () => {
    'worklet';

    if (!enabled) return;

    if (typeof snapThreshold === 'number') {
      if (revealHeaderOnScroll) {
        if (accDiffClamp.value > 0) {
          if (scrollYCurrent.value > headerScrollDistance.value * snapThreshold) {
            if (accDiffClamp.value <= headerScrollDistance.value * snapThreshold) {
              // snap down
              isSnapping.value = true;
              accDiffClamp.value = (0, _reactNativeReanimated.withTiming)(0, undefined, () => {
                isSnapping.value = false;
              });
            } else if (accDiffClamp.value < headerScrollDistance.value) {
              // snap up
              isSnapping.value = true;
              accDiffClamp.value = (0, _reactNativeReanimated.withTiming)(headerScrollDistance.value, undefined, () => {
                isSnapping.value = false;
              });

              if (scrollYCurrent.value < headerScrollDistance.value) {
                scrollTo(refMap[name], 0, headerScrollDistance.value, true, "[".concat(name, "] sticky snap up"));
              }
            }
          } else {
            isSnapping.value = true;
            accDiffClamp.value = (0, _reactNativeReanimated.withTiming)(0, undefined, () => {
              isSnapping.value = false;
            });
          }
        }
      } else {
        if (scrollYCurrent.value <= headerScrollDistance.value * snapThreshold) {
          // snap down
          snappingTo.value = 0;
          scrollTo(refMap[name], 0, 0, true, "[".concat(name, "] snap down"));
        } else if (scrollYCurrent.value <= headerScrollDistance.value) {
          // snap up
          snappingTo.value = headerScrollDistance.value;
          scrollTo(refMap[name], 0, headerScrollDistance.value, true, "[".concat(name, "] snap up"));
        }

        isSnapping.value = false;
      }
    }

    isGliding.value = false;
  };

  const contentHeight = (0, _reactNativeReanimated.useDerivedValue)(() => {
    const tabIndex = tabNames.value.indexOf(name);
    return contentHeights.value[tabIndex] || Number.MAX_VALUE;
  }, []);
  const scrollHandler = (0, _reactNativeReanimated.useAnimatedScrollHandler)({
    onScroll: event => {
      if (!enabled) return;

      if (focusedTab.value === name) {
        if (_helpers.IS_IOS) {
          let {
            y
          } = event.contentOffset; // normalize the value so it starts at 0

          y = y + contentInset;
          const clampMax = contentHeight.value - (containerHeight || 0) + contentInset; // make sure the y value is clamped to the scrollable size (clamps overscrolling)

          scrollYCurrent.value = (0, _reactNativeReanimated.interpolate)(y, [0, clampMax], [0, clampMax], _reactNativeReanimated.Extrapolate.CLAMP);
        } else {
          const {
            y
          } = event.contentOffset;
          scrollYCurrent.value = y;
        }

        scrollY.value[index.value] = scrollYCurrent.value;
        oldAccScrollY.value = accScrollY.value;
        accScrollY.value = scrollY.value[index.value] + offset.value;

        if (!isSnapping.value && revealHeaderOnScroll) {
          const delta = accScrollY.value - oldAccScrollY.value;
          const nextValue = accDiffClamp.value + delta;

          if (delta > 0) {
            // scrolling down
            accDiffClamp.value = Math.min(headerScrollDistance.value, nextValue);
          } else if (delta < 0) {
            // scrolling up
            accDiffClamp.value = Math.max(0, nextValue);
          }
        }

        isScrolling.value = 1; // cancel the animation that is setting this back to 0 if we're still scrolling

        (0, _reactNativeReanimated.cancelAnimation)(isScrolling); // set it back to 0 after a few frames without active scrolling

        isScrolling.value = (0, _reactNativeReanimated.withDelay)(_helpers.ONE_FRAME_MS * 3, (0, _reactNativeReanimated.withTiming)(0, {
          duration: 0
        }));
      }
    },
    onBeginDrag: () => {
      if (!enabled) return; // ensure the header stops snapping

      (0, _reactNativeReanimated.cancelAnimation)(accDiffClamp);
      isSnapping.value = false;
      isScrolling.value = 0;
      isGliding.value = false;
      if (_helpers.IS_IOS) (0, _reactNativeReanimated.cancelAnimation)(afterDrag);
    },
    onEndDrag: () => {
      if (!enabled) return;
      isGliding.value = true;

      if (_helpers.IS_IOS) {
        // we delay this by one frame so that onMomentumBegin may fire on iOS
        afterDrag.value = (0, _reactNativeReanimated.withDelay)(_helpers.ONE_FRAME_MS, (0, _reactNativeReanimated.withTiming)(0, {
          duration: 0
        }, isFinished => {
          // if the animation is finished, the onMomentumBegin has
          // never started, so we need to manually trigger the onMomentumEnd
          // to make sure we snap
          if (isFinished) {
            isGliding.value = false;
            onMomentumEnd();
          }
        }));
      }
    },
    onMomentumBegin: () => {
      if (!enabled) return;

      if (_helpers.IS_IOS) {
        (0, _reactNativeReanimated.cancelAnimation)(afterDrag);
      }
    },
    onMomentumEnd
  }, [refMap, name, revealHeaderOnScroll, containerHeight, contentInset, snapThreshold, enabled, scrollTo]); // sync unfocused scenes

  (0, _reactNativeReanimated.useAnimatedReaction)(() => {
    return !isSnapping.value && !isScrolling.value && !isGliding.value && enabled;
  }, sync => {
    if (sync && focusedTab.value !== name) {
      let nextPosition = null;
      const focusedScrollY = scrollY.value[index.value];
      const tabScrollY = scrollY.value[tabIndex];
      const areEqual = focusedScrollY === tabScrollY;

      if (!areEqual) {
        const currIsOnTop = tabScrollY <= headerScrollDistance.value + 1;
        const focusedIsOnTop = focusedScrollY <= headerScrollDistance.value + 1;

        if (revealHeaderOnScroll) {
          const hasGap = accDiffClamp.value > tabScrollY;

          if (hasGap || currIsOnTop) {
            nextPosition = accDiffClamp.value;
          }
        } else if (typeof snapThreshold === 'number') {
          if (focusedIsOnTop) {
            nextPosition = snappingTo.value;
          } else if (currIsOnTop) {
            nextPosition = headerHeight;
          }
        } else if (currIsOnTop || focusedIsOnTop) {
          nextPosition = Math.min(focusedScrollY, headerScrollDistance.value);
        }
      }

      if (nextPosition !== null) {
        scrollY.value[tabIndex] = nextPosition;
        scrollTo(refMap[name], 0, nextPosition, false, "[".concat(name, "] sync pane"));
      }
    }
  }, [revealHeaderOnScroll, refMap, snapThreshold, tabIndex, enabled, scrollTo]);
  return scrollHandler;
};

exports.useScrollHandlerY = useScrollHandlerY;

/**
 * Magic hook that creates a multicast ref. Useful so that we can both capture the ref, and forward it to callers.
 * Accepts a parameter for an outer ref that will also be updated to the same ref
 * @param outerRef the outer ref that needs to be updated
 * @returns an animated ref
 */
function useSharedAnimatedRef(outerRef) {
  const ref = (0, _reactNativeReanimated.useAnimatedRef)(); // this executes on every render

  (0, _react.useEffect)(() => {
    if (!outerRef) {
      return;
    }

    if (typeof outerRef === 'function') {
      outerRef(ref.current);
    } else {
      outerRef.current = ref.current;
    }
  });
  return ref;
}

function useAfterMountEffect(effect) {
  const [didExecute, setDidExecute] = (0, _react.useState)(false);
  const result = (0, _react.useEffect)(() => {
    if (didExecute) return;
    const timeout = setTimeout(() => {
      effect();
      setDidExecute(true);
    }, 0);
    return () => {
      clearTimeout(timeout);
    };
  }, [didExecute, effect]);
  return result;
}

function useConvertAnimatedToValue(animatedValue) {
  const [value, setValue] = (0, _react.useState)(animatedValue.value);
  (0, _reactNativeReanimated.useAnimatedReaction)(() => {
    return animatedValue.value;
  }, animValue => {
    if (animValue !== value) {
      (0, _reactNativeReanimated.runOnJS)(setValue)(animValue);
    }
  }, [value]);
  return value;
}

function useHeaderMeasurements() {
  const {
    headerTranslateY,
    headerHeight
  } = useTabsContext();
  return {
    top: headerTranslateY,
    height: headerHeight
  };
}
/**
 * Returns the currently focused tab name
 */


function useFocusedTab() {
  const {
    focusedTab
  } = useTabsContext();
  const focusedTabValue = useConvertAnimatedToValue(focusedTab);
  return focusedTabValue;
}
/**
 * Returns an animated value representing the current tab index, as a floating point number
 */


function useAnimatedTabIndex() {
  const {
    indexDecimal
  } = useTabsContext();
  return indexDecimal;
}
//# sourceMappingURL=hooks.js.map