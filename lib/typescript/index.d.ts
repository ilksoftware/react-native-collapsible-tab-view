/// <reference types="react" />
import { Container } from './Container';
import { FlatList } from './FlatList';
import { Lazy } from './Lazy';
import { MaterialTabBarProps, MaterialTabItemProps } from './MaterialTabBar';
import { ScrollView } from './ScrollView';
import { Tab } from './Tab';
import { TabBarProps, CollapsibleProps, RefComponent, ContainerRef, CollapsibleRef, OnTabChangeCallback } from './types';
export type { TabBarProps, CollapsibleProps, RefComponent, ContainerRef, MaterialTabBarProps, MaterialTabItemProps, CollapsibleRef, OnTabChangeCallback, };
export declare const Tabs: {
    Container: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<CollapsibleProps & import("react").RefAttributes<CollapsibleRef<import("./types").TabName>>>>;
    Tab: typeof Tab;
    Lazy: import("react").FC<{
        startMounted?: boolean | undefined;
        cancelLazyFadeIn?: boolean | undefined;
        children: import("react").ReactElement<any, string | ((props: any) => import("react").ReactElement<any, string | any | (new (props: any) => import("react").Component<any, any, any>)> | null) | (new (props: any) => import("react").Component<any, any, any>)>;
    }>;
    FlatList: <T>(p: import("react-native").FlatListProps<T> & {
        ref?: ((instance: import("react-native").FlatList<T> | null) => void) | import("react").RefObject<import("react-native").FlatList<T>> | null | undefined;
    }) => import("react").ReactElement<any, string | ((props: any) => import("react").ReactElement<any, string | any | (new (props: any) => import("react").Component<any, any, any>)> | null) | (new (props: any) => import("react").Component<any, any, any>)>;
    ScrollView: import("react").ForwardRefExoticComponent<Pick<import("react-native").ScrollViewProps, "horizontal" | "pagingEnabled" | "showsHorizontalScrollIndicator" | "keyboardShouldPersistTaps" | "removeClippedSubviews" | "fadingEdgeLength" | "onLayout" | "contentContainerStyle" | "invertStickyHeaders" | "keyboardDismissMode" | "onContentSizeChange" | "onScrollBeginDrag" | "onScrollEndDrag" | "onMomentumScrollEnd" | "onMomentumScrollBegin" | "scrollEnabled" | "showsVerticalScrollIndicator" | "style" | "refreshControl" | "snapToAlignment" | "snapToInterval" | "snapToOffsets" | "snapToStart" | "snapToEnd" | "disableIntervalMomentum" | "disableScrollViewPanResponder" | "hitSlop" | "pointerEvents" | "testID" | "nativeID" | "collapsable" | "needsOffscreenAlphaCompositing" | "renderToHardwareTextureAndroid" | "focusable" | "shouldRasterizeIOS" | "isTVSelectable" | "hasTVPreferredFocus" | "tvParallaxProperties" | "tvParallaxShiftDistanceX" | "tvParallaxShiftDistanceY" | "tvParallaxTiltAngle" | "tvParallaxMagnification" | "onStartShouldSetResponder" | "onMoveShouldSetResponder" | "onResponderEnd" | "onResponderGrant" | "onResponderReject" | "onResponderMove" | "onResponderRelease" | "onResponderStart" | "onResponderTerminationRequest" | "onResponderTerminate" | "onStartShouldSetResponderCapture" | "onMoveShouldSetResponderCapture" | "onTouchStart" | "onTouchMove" | "onTouchEnd" | "onTouchCancel" | "onTouchEndCapture" | "accessible" | "accessibilityActions" | "accessibilityLabel" | "accessibilityRole" | "accessibilityState" | "accessibilityHint" | "accessibilityValue" | "onAccessibilityAction" | "accessibilityComponentType" | "accessibilityLiveRegion" | "importantForAccessibility" | "accessibilityElementsHidden" | "accessibilityTraits" | "accessibilityViewIsModal" | "onAccessibilityEscape" | "onAccessibilityTap" | "onMagicTap" | "accessibilityIgnoresInvertColors" | "alwaysBounceHorizontal" | "alwaysBounceVertical" | "automaticallyAdjustContentInsets" | "bounces" | "bouncesZoom" | "canCancelContentTouches" | "centerContent" | "contentInset" | "contentOffset" | "contentInsetAdjustmentBehavior" | "decelerationRate" | "directionalLockEnabled" | "indicatorStyle" | "maximumZoomScale" | "minimumZoomScale" | "onScrollAnimationEnd" | "pinchGestureEnabled" | "scrollEventThrottle" | "scrollIndicatorInsets" | "scrollToOverflowEnabled" | "scrollsToTop" | "onScrollToTop" | "stickyHeaderIndices" | "zoomScale" | "endFillColor" | "scrollPerfTag" | "overScrollMode" | "nestedScrollEnabled" | "persistentScrollbar"> & {
        children?: import("react").ReactNode;
    } & import("react").RefAttributes<import("react-native").ScrollView>>;
};
export { Container, Tab, Lazy, FlatList, ScrollView };
export { useHeaderMeasurements, useFocusedTab, useAnimatedTabIndex, useCollapsibleStyle, } from './hooks';
export { MaterialTabBar } from './MaterialTabBar/TabBar';
export { MaterialTabItem } from './MaterialTabBar/TabItem';
