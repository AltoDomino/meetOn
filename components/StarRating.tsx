// components/StarRating.tsx
import React from "react";
import { View, TouchableOpacity, Text } from "react-native";

type Props = {
  value: number;
  onChange: (v: number) => void;
};

export const StarRating: React.FC<Props> = ({ value, onChange }) => {
  return (
    <View style={{ flexDirection: "row" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onChange(star)}
          style={{ padding: 4 }}
        >
          <Text
            style={{
              fontSize: 22,
              color: star <= value ? "#FFD700" : "#888",
            }}
          >
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
