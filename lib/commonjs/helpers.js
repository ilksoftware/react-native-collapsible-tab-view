"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scrollToImpl = scrollToImpl;
exports.AnimatedFlatList = exports.IS_IOS = exports.ONE_FRAME_MS = void 0;

var _reactNative = require("react-native");

var _reactNativeReanimated = _interopRequireWildcard(require("react-native-reanimated"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/** The time one frame takes at 60 fps (16 ms) */
const ONE_FRAME_MS = 16;
exports.ONE_FRAME_MS = ONE_FRAME_MS;
const IS_IOS = _reactNative.Platform.OS === 'ios';
exports.IS_IOS = IS_IOS;

const AnimatedFlatList = _reactNativeReanimated.default.createAnimatedComponent(_reactNative.FlatList);

exports.AnimatedFlatList = AnimatedFlatList;

function scrollToImpl(ref, x, y, animated) {
  'worklet';

  if (!ref) return; // ensure we don't scroll on NaN

  if (!Number.isFinite(x) || !Number.isFinite(y)) return; //@ts-expect-error: reanimated typescript types do not accept FlatList for `scrollTo`, but it does work

  (0, _reactNativeReanimated.scrollTo)(ref, x, y, animated);
}
//# sourceMappingURL=helpers.js.map