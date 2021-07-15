import React from 'react';
import { FlatListProps } from 'react-native';
import { FlatList as RNFlatList } from 'react-native-gesture-handler';
/**
 * Use like a regular FlatList.
 */
export declare const FlatList: <T>(p: FlatListProps<T> & {
    ref?: ((instance: RNFlatList<T> | null) => void) | React.RefObject<RNFlatList<T>> | null | undefined;
}) => React.ReactElement;
