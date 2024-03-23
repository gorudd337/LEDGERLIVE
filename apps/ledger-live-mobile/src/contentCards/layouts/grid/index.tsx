import React, { useRef, useState } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";
import { ContentLayoutBuilder } from "~/contentCards/layouts/utils";
import { ContentCardItem } from "~/contentCards/cards/types";

type Props = {
  styles?: {
    gap?: number;
  };
};

const defaultStyles = {
  gap: 6,
};

const Grid = ContentLayoutBuilder<Props>(({ items, styles: _styles = defaultStyles }) => {
  // const styles = {
  //   gap: _styles.gap ?? defaultStyles.gap,
  // };

  // const separatorWidth = useTheme().space[styles.gap];

  // const carouselRef = useRef<FlatList>(null);
  // const [carouselIndex, setCarouselIndex] = useState(0);

  // const setIndexOnScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
  //   const contentOffsetX = e.nativeEvent.contentOffset.x;
  //   const newIndex = Math.round(contentOffsetX / (separatorWidth * 1.5));
  //   if (newIndex !== carouselIndex) setCarouselIndex(newIndex);
  // };

  return (
    <View style={{ flex: 1, gap: 8 }}>
      <FlatList
        data={items}
        renderItem={({ item }: ListRenderItemInfo<ContentCardItem>) => (
          <item.component {...item.props} />
        )}
        numColumns={3}
      />
      {/* <FlatList
        horizontal
        ref={carouselRef}
        showsHorizontalScrollIndicator={false}
        onScroll={setIndexOnScroll}
        disableIntervalMomentum
        scrollEventThrottle={16}
        bounces={false}
        snapToInterval={separatorWidth * 1.5}
        decelerationRate={0}
        contentContainerStyle={{ paddingHorizontal: separatorWidth }}
        data={items}
        ItemSeparatorComponent={() => <View style={{ width: separatorWidth / 2 }} />}
        renderItem={({ item }: ListRenderItemInfo<ContentCardItem>) => (
          <item.component {...item.props} />
        )}
      /> */}
    </View>
  );
});

export default Grid;
