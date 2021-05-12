import { FlatList, Platform } from 'react-native';
import Animated, { scrollTo } from 'react-native-reanimated';

/** The time one frame takes at 60 fps (16 ms) */
export const ONE_FRAME_MS = 16;
export const IS_IOS = Platform.OS === 'ios';
export const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
export function scrollToImpl(ref, x, y, animated) {
  'worklet';

  if (!ref) return; // ensure we don't scroll on NaN

  if (!Number.isFinite(x) || !Number.isFinite(y)) return; //@ts-expect-error: reanimated typescript types do not accept FlatList for `scrollTo`, but it does work

  scrollTo(ref, x, y, animated);
}
//# sourceMappingURL=helpers.js.map