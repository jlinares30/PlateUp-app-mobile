import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { MealPlan } from "../types";


interface Props {
    item: MealPlan;
    onPress: () => void;
    onAction?: () => void;
    actionIcon?: keyof typeof Ionicons.glyphMap;
    actionLabel?: string;
    actionColor?: string;
    onDelete?: () => void;
}

export default function MealPlanCard({
    item,
    onPress,
    onAction,
    actionIcon,
    actionLabel,
    actionColor = "#2980b9",
    onDelete
}: Props) {
    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={onPress}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                    {Array.isArray(item.days) ? (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{item.days.length} días</Text>
                        </View>
                    ) : null}
                </View>

                {item.description ? (
                    <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                ) : null}

                {/* Action Bar (Footer) */}
                <View style={styles.footer}>
                    {onAction && (
                        <TouchableOpacity
                            style={[styles.actionButton, { borderColor: actionColor }]}
                            onPress={onAction}
                            activeOpacity={0.7}
                        >
                            {actionIcon && <Ionicons name={actionIcon} size={16} color={actionColor} style={{ marginRight: 6 }} />}
                            <Text style={[styles.actionText, { color: actionColor }]}>{actionLabel}</Text>
                        </TouchableOpacity>
                    )}

                    {/* Delete Button */}
                    {onDelete && (
                        <TouchableOpacity
                            style={[styles.actionButton, { borderColor: '#e74c3c', marginLeft: 10 }]}
                            onPress={onDelete}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="trash-outline" size={16} color="#e74c3c" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 14,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: '#f0f0f0'
    },
    content: {
        padding: 16
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#2c3e50",
        flex: 1,
        marginRight: 8
    },
    badge: {
        backgroundColor: "#e8f4fd",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12
    },
    badgeText: {
        color: "#2980b9",
        fontWeight: "600",
        fontSize: 12
    },
    description: {
        color: "#7f8c8d",
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#f5f5f5',
        paddingTop: 12,
        marginTop: 4,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
    }
});
