import { useAuthStore } from '@/src/store/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#2c3e50" />
                </TouchableOpacity>
                <Text style={styles.title}>My Profile</Text>
                {isEditing ? (
                    <TouchableOpacity onPress={handleSave} disabled={loading}>
                        {loading ? <ActivityIndicator color="#8e44ad" /> : <Text style={styles.saveText}>Save</Text>}
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={() => setIsEditing(true)}>
                        <Ionicons name="create-outline" size={24} color="#8e44ad" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.content}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
                    </View>
                    <Text style={styles.userName}>{user?.name}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={[styles.input, !isEditing && styles.disabledInput]}
                            value={name}
                            onChangeText={setName}
                            editable={isEditing}
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
                        />
                    </View>

                    {isEditing && (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>New Password (Optional)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    placeholder="Leave blank to keep current"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Confirm New Password</Text>
                                <TextInput
                                    style={styles.input}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                    placeholder="Confirm new password"
                                />
                            </View>
                        </>
                    )}
                </View>

                {isEditing && (
                    <TouchableOpacity style={styles.cancelButton} onPress={() => {
                        setIsEditing(false);
                        setName(user?.name || '');
                        setEmail(user?.email || '');
                        setPassword('');
                        setConfirmPassword('');
                    }}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingTop: 50,
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    saveText: {
        color: '#8e44ad',
        fontWeight: '600',
        fontSize: 16,
    },
    content: {
        padding: 20,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#8e44ad',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 40,
        color: '#fff',
        fontWeight: 'bold',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    userEmail: {
        fontSize: 16,
        color: '#7f8c8d',
        marginTop: 4,
    },
    form: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#2c3e50',
        backgroundColor: '#f8f9fa',
    },
    disabledInput: {
        backgroundColor: '#fff',
        borderColor: 'transparent',
        paddingHorizontal: 0,
        color: '#2c3e50',
    },
    cancelButton: {
        marginTop: 20,
        alignItems: 'center',
        padding: 15,
    },
    cancelText: {
        color: '#e74c3c',
        fontSize: 16,
        fontWeight: '600',
    }

});
