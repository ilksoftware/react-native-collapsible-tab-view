import React from 'react';
import { TabName } from '../types';
import { MaterialTabBarProps } from './types';
export declare const TABBAR_HEIGHT = 48;
declare const MemoizedTabBar: React.MemoExoticComponent<(<T extends TabName = any>({ tabNames, indexDecimal, scrollEnabled, indicatorStyle, index, TabItemComponent, getLabelText, onTabPress, style, tabProps, contentContainerStyle, labelStyle, inactiveColor, activeColor, tabStyle, }: MaterialTabBarProps<T>) => React.ReactElement)>;
export { MemoizedTabBar as MaterialTabBar };
