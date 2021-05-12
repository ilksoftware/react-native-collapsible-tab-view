import React from 'react';
import { CollapsibleProps, CollapsibleRef, TabName } from './types';
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
export declare const Container: React.MemoExoticComponent<React.ForwardRefExoticComponent<CollapsibleProps & React.RefAttributes<CollapsibleRef<TabName>>>>;
