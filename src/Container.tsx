import React from 'react'
import {
  LayoutChangeEvent,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native'
import Animated, {
  runOnJS,
  runOnUI,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'

import { Context, TabNameContext } from './Context'
import { Lazy } from './Lazy'
import { MaterialTabBar, TABBAR_HEIGHT } from './MaterialTabBar'
import { Tab } from './Tab'
import { AnimatedFlatList, IS_IOS, ONE_FRAME_MS, scrollToImpl } from './helpers'
import { useAnimatedDynamicRefs, useContainerRef, useTabProps } from './hooks'
import {
  CollapsibleProps,
  CollapsibleRef,
  ContextType,
  IndexChangeEventData,
  TabName,
} from './types'

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
export const Container = React.memo(
  React.forwardRef<CollapsibleRef, CollapsibleProps>(
    (
      {
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
        onTabChange,
      },
      ref
    ) => {
      const containerRef = useContainerRef()

      const [tabProps, tabNamesArray] = useTabProps(children, Tab)

      const [refMap, setRef] = useAnimatedDynamicRefs()

      const windowWidth = useWindowDimensions().width
      const firstRender = React.useRef(true)

      const [containerWidth, setContainerWidth] = React.useState<number>(
        windowWidth
      )
      const [containerHeight, setContainerHeight] = React.useState<
        number | undefined
      >(undefined)
      const [tabBarHeight, setTabBarHeight] = React.useState<
        number | undefined
      >(initialTabBarHeight)
      const [headerHeight, setHeaderHeight] = React.useState<
        number | undefined
      >(!HeaderComponent ? 0 : initialHeaderHeight)

      const contentInset = React.useMemo(
        () => (IS_IOS ? (headerHeight || 0) + (tabBarHeight || 0) : 0),
        [headerHeight, tabBarHeight]
      )

      const isSwiping = useSharedValue(false)
      const isSnapping: ContextType['isSnapping'] = useSharedValue(false)
      const snappingTo: ContextType['snappingTo'] = useSharedValue(0)
      const isGliding: ContextType['isGliding'] = useSharedValue(false)
      const offset: ContextType['offset'] = useSharedValue(0)
      const accScrollY: ContextType['accScrollY'] = useSharedValue(0)
      const oldAccScrollY: ContextType['oldAccScrollY'] = useSharedValue(0)
      const accDiffClamp: ContextType['accDiffClamp'] = useSharedValue(0)
      const isScrolling: ContextType['isScrolling'] = useSharedValue(0)
      const scrollYCurrent: ContextType['scrollYCurrent'] = useSharedValue(0)
      const scrollY: ContextType['scrollY'] = useSharedValue(
        tabNamesArray.map(() => 0),
        false
      )

      const contentHeights: ContextType['contentHeights'] = useSharedValue(
        tabNamesArray.map(() => 0),
        false
      )

      const tabNames: ContextType['tabNames'] = useDerivedValue<TabName[]>(
        () => tabNamesArray,
        [tabNamesArray]
      )
      const index: ContextType['index'] = useSharedValue(
        initialTabName
          ? tabNames.value.findIndex((n) => n === initialTabName)
          : 0
      )
      const scrollX: ContextType['scrollX'] = useSharedValue(
        index.value * windowWidth,
        false
      )
      const pagerOpacity = useSharedValue(
        initialHeaderHeight === undefined || index.value !== 0 ? 0 : 1,
        false
      )
      const [data, setData] = React.useState(tabNamesArray)

      React.useEffect(() => {
        setData(tabNamesArray)
      }, [tabNamesArray])

      const focusedTab: ContextType['focusedTab'] = useDerivedValue<TabName>(() => {
        return tabNames.value[index.value]
      }, [tabNames])
      const calculateNextOffset = useSharedValue(index.value)
      const headerScrollDistance: ContextType['headerScrollDistance'] = useDerivedValue(() => {
        return headerHeight !== undefined ? headerHeight - minHeaderHeight : 0
      }, [headerHeight, minHeaderHeight])

      const getItemLayout = React.useCallback(
        (_: unknown, index: number) => ({
          length: containerWidth,
          offset: containerWidth * index,
          index,
        }),
        [containerWidth]
      )

      const indexDecimal: ContextType['indexDecimal'] = useDerivedValue(() => {
        return scrollX.value / containerWidth
      }, [containerWidth])

      // handle window resize
      React.useEffect(() => {
        if (!firstRender.current) {
          containerRef.current?.scrollToIndex({
            index: index.value,
            animated: false,
          })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [windowWidth])

      const afterRender = useSharedValue(0)
      React.useEffect(() => {
        if (!firstRender.current) pagerOpacity.value = 0
        afterRender.value = withDelay(
          ONE_FRAME_MS * 5,
          withTiming(1, { duration: 0 })
        )
      }, [afterRender, pagerOpacity, tabNamesArray])

      React.useEffect(() => {
        if (firstRender.current) {
          if (initialTabName !== undefined && index.value !== 0) {
            containerRef.current?.scrollToIndex({
              index: index.value,
              animated: false,
            })
          }
          firstRender.current = false
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [containerRef, initialTabName, windowWidth])

      // the purpose of this is to scroll to the proper position if dynamic tabs are changing
      useAnimatedReaction(
        () => {
          return afterRender.value === 1
        },
        (trigger) => {
          if (trigger) {
            afterRender.value = 0
            tabNamesArray.forEach((name) => {
              'worklet'
              scrollToImpl(
                refMap[name],
                0,
                scrollY.value[index.value] - contentInset,
                false
              )
            })

            pagerOpacity.value = withTiming(1)
          }
        },
        [tabNamesArray, refMap, afterRender, contentInset]
      )

      // derived from scrollX
      // calculate the next offset and index if swiping
      // if scrollX changes from tab press,
      // the same logic must be done, but knowing
      // the next index in advance
      useAnimatedReaction(
        () => {
          const nextIndex = isSwiping.value
            ? Math.round(indexDecimal.value)
            : null
          return nextIndex
        },
        (nextIndex) => {
          if (nextIndex !== null && nextIndex !== index.value) {
            calculateNextOffset.value = nextIndex
          }
        },
        []
      )

      const propagateTabChange = React.useCallback(
        (change: IndexChangeEventData<TabName>) => {
          onTabChange?.(change)
          onIndexChange?.(change.index)
        },
        [onIndexChange, onTabChange]
      )

      useAnimatedReaction(
        () => {
          return calculateNextOffset.value
        },
        (i) => {
          if (i !== index.value) {
            offset.value =
              scrollY.value[index.value] - scrollY.value[i] + offset.value
            runOnJS(propagateTabChange)({
              prevIndex: index.value,
              index: i,
              prevTabName: tabNames.value[index.value],
              tabName: tabNames.value[i],
            })
            index.value = i
          }
        },
        []
      )

      const scrollHandlerX = useAnimatedScrollHandler(
        {
          onScroll: (event) => {
            const { x } = event.contentOffset
            scrollX.value = x
          },
          onBeginDrag: () => {
            isSwiping.value = true
          },
          onMomentumEnd: () => {
            isSwiping.value = false
          },
        },
        []
      )

      const renderItem = React.useCallback(
        ({ index: i }) => {
          if (!tabNames.value[i]) return null
          return (
            <TabNameContext.Provider value={tabNames.value[i]}>
              {lazy ? (
                <Lazy
                  startMounted={i === index.value}
                  cancelLazyFadeIn={cancelLazyFadeIn}
                >
                  {React.Children.toArray(children)[i] as React.ReactElement}
                </Lazy>
              ) : (
                React.Children.toArray(children)[i]
              )}
            </TabNameContext.Provider>
          )
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [children, lazy, tabNames.value, cancelLazyFadeIn]
      )

      const headerTranslateY = useDerivedValue(() => {
        return revealHeaderOnScroll
          ? -accDiffClamp.value
          : -Math.min(scrollYCurrent.value, headerScrollDistance.value)
      }, [revealHeaderOnScroll])

      const stylez = useAnimatedStyle(() => {
        return {
          transform: [
            {
              translateY: headerTranslateY.value,
            },
          ],
        }
      }, [revealHeaderOnScroll])

      const getHeaderHeight = React.useCallback(
        (event: LayoutChangeEvent) => {
          const height = event.nativeEvent.layout.height
          if (headerHeight !== height) {
            setHeaderHeight(height)
          }
        },
        [headerHeight]
      )

      const getTabBarHeight = React.useCallback(
        (event: LayoutChangeEvent) => {
          const height = event.nativeEvent.layout.height
          if (tabBarHeight !== height) setTabBarHeight(height)
        },
        [tabBarHeight]
      )

      const onLayout = React.useCallback(
        (event: LayoutChangeEvent) => {
          const height = event.nativeEvent.layout.height
          if (containerHeight !== height) setContainerHeight(height)

          const width = event.nativeEvent.layout.width
          if (containerWidth !== width) setContainerWidth(width)
        },
        [containerHeight, containerWidth]
      )

      // fade in the pager if the headerHeight is not defined
      useAnimatedReaction(
        () => {
          return (
            (initialHeaderHeight === undefined ||
              initialTabName !== undefined) &&
            headerHeight !== undefined &&
            pagerOpacity.value === 0
          )
        },
        (update) => {
          if (update) {
            pagerOpacity.value = withTiming(1)
          }
        },
        [headerHeight]
      )

      const pagerStylez = useAnimatedStyle(() => {
        return {
          opacity: pagerOpacity.value,
        }
      }, [])

      const onTabPress = React.useCallback(
        (name: TabName) => {
          // simplify logic by preventing index change
          // when is scrolling or gliding.
          if (!isScrolling.value && !isGliding.value) {
            const i = tabNames.value.findIndex((n) => n === name)
            calculateNextOffset.value = i
            if (name === focusedTab.value) {
              const ref = refMap[name]
              runOnUI(scrollToImpl)(
                ref,
                0,
                headerScrollDistance.value - contentInset,
                true
              )
            } else {
              containerRef.current?.scrollToIndex({ animated: true, index: i })
            }
          }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [containerRef, refMap, contentInset]
      )

      React.useEffect(() => {
        if (index.value >= tabNamesArray.length) {
          onTabPress(tabNamesArray[tabNamesArray.length - 1])
        }
      }, [index.value, onTabPress, tabNamesArray])

      const keyExtractor = React.useCallback((name) => name, [])

      React.useImperativeHandle(
        ref,
        () => ({
          setIndex: (index) => {
            if (isScrolling.value || isGliding.value) return false
            const name = tabNames.value[index]
            onTabPress(name)
            return true
          },
          jumpToTab: (name) => {
            if (isScrolling.value || isGliding.value) return false
            onTabPress(name)
            return true
          },
          getFocusedTab: () => {
            return tabNames.value[index.value]
          },
          getCurrentIndex: () => {
            return index.value
          },
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [onTabPress]
      )

      return (
        <Context.Provider
          value={{
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
            headerTranslateY,
          }}
        >
          <Animated.View
            style={[styles.container, containerStyle]}
            onLayout={onLayout}
            pointerEvents="box-none"
          >
            <Animated.View
              pointerEvents="box-none"
              style={[
                styles.topContainer,
                headerContainerStyle,
                !cancelTranslation && stylez,
              ]}
            >
              <View
                style={[styles.container, styles.headerContainer]}
                onLayout={getHeaderHeight}
                pointerEvents="box-none"
              >
                {HeaderComponent && (
                  <HeaderComponent
                    containerRef={containerRef}
                    index={index}
                    tabNames={tabNamesArray}
                    focusedTab={focusedTab}
                    indexDecimal={indexDecimal}
                    onTabPress={onTabPress}
                    tabProps={tabProps}
                  />
                )}
              </View>
              <View
                style={[styles.container, styles.tabBarContainer]}
                onLayout={getTabBarHeight}
                pointerEvents="box-none"
              >
                {TabBarComponent && (
                  <TabBarComponent
                    containerRef={containerRef}
                    index={index}
                    tabNames={tabNamesArray}
                    focusedTab={focusedTab}
                    indexDecimal={indexDecimal}
                    onTabPress={onTabPress}
                    tabProps={tabProps}
                  />
                )}
              </View>
            </Animated.View>
            {headerHeight !== undefined && (
              <AnimatedFlatList
                // @ts-expect-error problem with reanimated types, they're missing `ref`
                ref={containerRef}
                initialScrollIndex={index.value}
                data={data}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                onScroll={scrollHandlerX}
                showsHorizontalScrollIndicator={false}
                getItemLayout={getItemLayout}
                scrollEventThrottle={16}
                bounces={false}
                {...pagerProps}
                style={[pagerStylez, pagerProps?.style]}
              />
            )}
          </Animated.View>
        </Context.Provider>
      )
    }
  )
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topContainer: {
    position: 'absolute',
    zIndex: 100,
    width: '100%',
    backgroundColor: 'white',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  tabBarContainer: {
    zIndex: 1,
  },
  headerContainer: {
    zIndex: 2,
  },
})
