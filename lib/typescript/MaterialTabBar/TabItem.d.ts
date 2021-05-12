import React from 'react';
import { TabName } from '../types';
import { MaterialTabItemProps } from './types';
export declare const TABBAR_HEIGHT = 48;
/**
 * Any additional props are passed to the pressable component.
 */
export declare const MaterialTabItem: <T extends TabName = any>({ name, index, onPress, onLayout, scrollEnabled, indexDecimal, label, style, labelStyle, activeColor, inactiveColor, inactiveOpacity, pressColor, pressOpacity, ...rest }: MaterialTabItemProps<T>) => React.ReactElement;
