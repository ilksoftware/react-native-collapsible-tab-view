/// <reference types="react" />
import Animated from 'react-native-reanimated';
import { Ref, RefComponent } from './types';
/** The time one frame takes at 60 fps (16 ms) */
export declare const ONE_FRAME_MS = 16;
export declare const IS_IOS: boolean;
export declare const AnimatedFlatList: import("react").ComponentType<Animated.AnimateProps<object, import("react-native").FlatListProps<unknown>>>;
export declare function scrollToImpl<T extends RefComponent>(ref: Ref<T> | undefined, x: number, y: number, animated: boolean): void;
