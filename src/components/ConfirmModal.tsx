import { COLORS, FONTS, SHADOWS, SPACING, useThemeColors } from "@/src/constants/theme";
import { useTranslation } from "@/src/lib/i18n";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";

export interface ModalAction {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface ConfirmModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    message?: string;
    actions?: ModalAction[];
}

export default function ConfirmModal({
    visible,
    onClose,
    title,
    message,
    actions = []
}: ConfirmModalProps) {
    const { t } = useTranslation();
    const { colors } = useThemeColors();

    if (!visible) return null;

    const displayActions = actions.length > 0 ? actions : [
        { text: t('common.cancel'), style: 'cancel', onPress: onClose }
    ];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View entering={ZoomIn.duration(200)} style={[styles.modalContainer, { backgroundColor: colors.card }]}>
                    <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
                    {message ? <Text style={[styles.message, { color: colors.text.secondary }]}>{message}</Text> : null}

                    <View style={[styles.buttonContainer, displayActions.length > 2 && styles.verticalButtons]}>
                        {displayActions.map((action, index) => {
                            const isCancel = action.style === 'cancel';
                            const isDestructive = action.style === 'destructive';

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.button,
                                        displayActions.length > 2 ? styles.fullWidthButton : null,
                                        isCancel ? [styles.cancelButton, { borderColor: colors.border }] :
                                            isDestructive ? styles.destructiveButton : [styles.defaultButton, { backgroundColor: colors.primary }]
                                    ]}
                                    onPress={() => {
                                        if (action.onPress) action.onPress();
                                        onClose();
                                    }}
                                >
                                    <Text style={[
                                        styles.buttonText,
                                        isCancel ? [styles.cancelText, { color: colors.text.primary }] :
                                            isDestructive ? styles.destructiveText : styles.defaultText
                                    ]}>
                                        {action.text}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: SPACING.m
    },
    modalContainer: {
        width: '100%',
        maxWidth: 320,
        backgroundColor: COLORS.card,
        borderRadius: SPACING.m,
        padding: SPACING.l,
        ...SHADOWS.medium,
    },
    title: {
        fontSize: FONTS.sizes.h3,
        fontWeight: "700",
        color: COLORS.text.primary,
        marginBottom: SPACING.s,
        textAlign: 'center'
    },
    message: {
        fontSize: FONTS.sizes.body,
        color: COLORS.text.secondary,
        textAlign: 'center',
        marginBottom: SPACING.l,
        lineHeight: 22
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: SPACING.m,
        flexWrap: 'wrap'
    },
    verticalButtons: {
        flexDirection: 'column',
        alignItems: 'stretch'
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: SPACING.s,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80
    },
    fullWidthButton: {
        width: '100%'
    },
    defaultButton: {
        backgroundColor: COLORS.primary
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.border
    },
    destructiveButton: {
        backgroundColor: COLORS.error
    },
    buttonText: {
        fontWeight: "600",
        fontSize: FONTS.sizes.body,
    },
    defaultText: {
        color: '#fff'
    },
    cancelText: {
        color: COLORS.text.secondary
    },
    destructiveText: {
        color: '#fff'
    }
});
