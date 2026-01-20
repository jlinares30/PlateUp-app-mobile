import { COLORS, FONTS, SHADOWS, SPACING } from "@/src/constants/theme";
import { useAuthStore } from '@/src/store/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, updateProfile, loading } = useAuthStore();
    console.log("user:", user);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = async () => {
        if (password && password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        const data: any = {};
        if (name !== user?.name) data.name = name;
        if (email !== user?.email) data.email = email;
        if (password) data.password = password;

        if (Object.keys(data).length === 0) {
            setIsEditing(false);
            return;
        }

        const success = await updateProfile(data);
        if (success) {
            Alert.alert('Success', 'Profile updated successfully');
            setIsEditing(false);
            setPassword('');
            setConfirmPassword('');
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <Animated.View entering={FadeInDown.springify()} style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
                            {!isEditing && (
                                <TouchableOpacity
                                    style={styles.editIconBadge}
                                    onPress={() => setIsEditing(true)}
                                >
                                    <Ionicons name="pencil" size={16} color={COLORS.card} />
                                </TouchableOpacity>
                            )}
                        </View>
                        <Text style={styles.userName}>{user?.name}</Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                style={[styles.input, !isEditing && styles.disabledInput]}
                                value={name}
                                onChangeText={setName}
                                editable={isEditing}
                                placeholder="Your Name"
                                placeholderTextColor={COLORS.text.light}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={[styles.input, !isEditing && styles.disabledInput]}
                                value={email}
                                onChangeText={setEmail}
                                editable={isEditing}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholder="Your Email"
                                placeholderTextColor={COLORS.text.light}
                            />
                        </View>

                        {isEditing && (
                            <>
                                <Animated.View entering={FadeInDown.springify()} style={styles.inputGroup}>
                                    <Text style={styles.label}>New Password (Optional)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                        placeholder="Leave blank to keep current"
                                        placeholderTextColor={COLORS.text.light}
                                    />
                                </Animated.View>
                                <Animated.View entering={FadeInDown.springify()} style={styles.inputGroup}>
                                    <Text style={styles.label}>Confirm New Password</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry
                                        placeholder="Confirm new password"
                                        placeholderTextColor={COLORS.text.light}
                                    />
                                </Animated.View>
                            </>
                        )}
                    </Animated.View>

                    {isEditing && (
                        <Animated.View entering={FadeInDown.springify()}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => {
                                setIsEditing(false);
                                setName(user?.name || '');
                                setEmail(user?.email || '');
                                setPassword('');
                                setConfirmPassword('');
                            }}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                </View>
            </ScrollView>

            {isEditing && (
                <TouchableOpacity
                    style={styles.saveFab}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.card} />
                    ) : (
                        <Ionicons name="checkmark" size={32} color={COLORS.card} />
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingBottom: 100
    },

    backButton: {
        padding: SPACING.xs,
    },
    title: {
        fontSize: FONTS.sizes.h3,
        fontWeight: '700',
        color: COLORS.text.primary,
    },
    saveText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: FONTS.sizes.body,
    },
    content: {
        padding: SPACING.m,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.m,
        ...SHADOWS.medium
    },
    avatarText: {
        fontSize: 40,
        color: COLORS.card,
        fontWeight: 'bold',
    },
    userName: {
        fontSize: FONTS.sizes.h2,
        fontWeight: '700',
        color: COLORS.text.primary,
    },
    userEmail: {
        fontSize: FONTS.sizes.body,
        color: COLORS.text.secondary,
        marginTop: 4,
    },
    form: {
        backgroundColor: COLORS.card,
        borderRadius: SPACING.l,
        padding: SPACING.l,
        ...SHADOWS.small,
    },
    inputGroup: {
        marginBottom: SPACING.m,
    },
    label: {
        fontSize: FONTS.sizes.small,
        color: COLORS.text.secondary,
        marginBottom: SPACING.xs,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: SPACING.s,
        padding: SPACING.m,
        fontSize: FONTS.sizes.body,
        color: COLORS.text.primary,
        backgroundColor: COLORS.background,
    },
    disabledInput: {
        backgroundColor: COLORS.card,
        borderColor: 'transparent',
        paddingHorizontal: 0,
        color: COLORS.text.primary,
        padding: 0
    },
    cancelButton: {
        marginTop: SPACING.l,
        alignItems: 'center',
        padding: SPACING.m,
    },
    cancelText: {
        color: COLORS.error,
        fontSize: FONTS.sizes.body,
        fontWeight: '600',
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.card,
    },
    saveFab: {
        position: 'absolute',
        bottom: SPACING.l,
        right: SPACING.l,
        backgroundColor: COLORS.accent, // Green for save
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.medium,
        zIndex: 100,
        elevation: 5
    }
});
