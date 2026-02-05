import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SwipeableRow from "./SwipeableRow";

export interface Ingredient {
  _id: string;
  name: string;
  category?: string;
  unit?: string;
}

type Props = {
  item: Ingredient;
  onPress?: () => void;
  onAdd?: (item: Ingredient) => void;
  shouldAnimate?: boolean;
};

export default function SwipeableIngredientItem({ item, onPress, onAdd, shouldAnimate }: Props) {
  return (
    <SwipeableRow onSwipe={() => onAdd?.(item)} style={styles.container} shouldAnimate={shouldAnimate}>
      <TouchableOpacity style={styles.row} onPress={() => onPress?.()} activeOpacity={0.8}>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>
            {item.category ?? "Sin categoría"} · {item.unit ?? "unidad"}
          </Text>
        </View>
        <Ionicons name="arrow-forward-circle-outline" size={24} color="#cbd5e1" style={styles.arrow} />
      </TouchableOpacity>
    </SwipeableRow>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  row: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eef6fb",
    shadowColor: "#e6eef8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  info: {
    flexDirection: "column"
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    color: "#2c3e50"
  },
  meta: {
    marginTop: 4,
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: '500'
  },
  arrow: {
    marginLeft: 10
  }
});