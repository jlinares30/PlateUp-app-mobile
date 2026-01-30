import ConfirmModal, { ModalAction } from '@/src/components/ConfirmModal';
import { COLORS, FONTS, SHADOWS, SPACING } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { FadeInDown, SlideInRight, SlideOutRight } from "react-native-reanimated";
import Toast from 'react-native-toast-message';
import RecipePicker from "../../../../src/components/RecipePicker";
import api from "../../../../src/lib/api";
import { DayPlan } from "../../../../src/types";

import * as ImagePicker from 'expo-image-picker';

export default function EditMealPlanScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [days, setDays] = useState<DayPlan[]>([]);
    const [isActive, setIsActive] = useState(false);
    const [isPublic, setIsPublic] = useState(false);
    const queryClient = useQueryClient();

    // Picker State
    const [pickerVisible, setPickerVisible] = useState(false);
    const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);

    useEffect(() => {
        if (id) fetchPlan();
    }, [id]);

    const fetchPlan = async () => {
        try {
            const res = await api.get(`/meal-plans/${id}`);
            const data = res.data?.data ?? res.data;
            if (data) {
                setTitle(data.title);
                setDescription(data.description || "");
                setIsActive(!!data.isActive);
                setIsPublic(!!data.isPublic);
                setImage(data.image || null); // Load existing image
                if (Array.isArray(data.days)) {
                    setDays(data.days);
                } else {
                    setDays([]);
                }
            }
        } catch (e) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: "No se pudo cargar el plan."
            });
        } finally {
            setLoading(false);
        }
    };

    const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();
    const [libraryPermission, requestLibraryPermission] = ImagePicker.useMediaLibraryPermissions();

    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: "",
        message: "",
        actions: [] as ModalAction[]
    });

    const showAlert = (title: string, message: string, actions: ModalAction[] = []) => {
        setModalConfig({ title, message, actions });
        setModalVisible(true);
    };

    const handleImageSelection = async () => {
        showAlert(
            "Meal Plan Photo",
            "Choose an option",
            [
                { text: "Camera", onPress: openCamera },
                { text: "Gallery", onPress: pickImage },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const openCamera = async () => {
        if (!cameraPermission?.granted) {
            const permission = await requestCameraPermission();
            if (!permission.granted) {
                showAlert("Permission required", "Camera access is required to take photos.", [{ text: "OK" }]);
                return;
            }
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const pickImage = async () => {
        if (!libraryPermission?.granted) {
            const permission = await requestLibraryPermission();
            if (!permission.granted) {
                showAlert("Permission required", "You need to allow access to your photos to select an image.", [{ text: "OK" }]);
                return;
            }
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true, // Allow cropping for better cover photos
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const updateMutation = useMutation({
        mutationFn: async () => {
            const formattedDays = days.map(d => ({
                day: d.day,
                meals: d.meals.map(m => ({
                    type: ["breakfast", "lunch", "dinner", "snack"].includes(m.type.toLowerCase()) ? m.type.toLowerCase() : "lunch",
                    recipe: m.recipe._id
                }))
            }));

            // Check if image is a local file (needing upload)
            const isNewImage = image && !image.startsWith('http');

            if (isNewImage) {
                const formData = new FormData();
                formData.append("title", title);
                formData.append("description", description);
                formData.append("isActive", String(isActive));
                formData.append("isPublic", String(isPublic));
                formData.append("days", JSON.stringify(formattedDays));

                const filename = image.split('/').pop();
                const match = /\.(\w+)$/.exec(filename ?? "");
                const type = match ? `image/${match[1]}` : `image`;
                formData.append('image', { uri: image, name: filename, type } as any);

                const res = await api.put(`/meal-plans/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                return res.data;
            } else {
                const payload = {
                    title,
                    description,
                    isActive,
                    isPublic,
                    days: formattedDays
                };
                const res = await api.put(`/meal-plans/${id}`, payload);
                return res.data;
            }
        },


        // ...

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: "Plan updated successfully."
            });
            setTimeout(() => router.back(), 500);
        },
        onError: (error) => {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: "Could not save changes."
            });
        }
    });

    const handleSave = () => {
        if (!title.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: "Title is required."
            });
            return;
        }
        updateMutation.mutate();
    };

    const addDay = () => {
        setDays([...days, { _id: Date.now().toString(), day: `Day ${days.length + 1}`, meals: [] }]);
    };

    const removeDay = (index: number) => {
        const newDays = [...days];
        newDays.splice(index, 1);
        setDays(newDays);
    };

    const openPicker = (dayIndex: number) => {
        setActiveDayIndex(dayIndex);
        setPickerVisible(true);
    };

    const handleSelectRecipe = (recipe: any) => {
        if (activeDayIndex === null) return;

        const newDays = [...days];
        const day = newDays[activeDayIndex];
        const recipeTitle = typeof recipe.title === 'string' ? recipe.title : "Recipe";

        day.meals.push({
            _id: Date.now().toString(),
            type: 'lunch',
            recipe: { _id: recipe._id, title: recipeTitle }
        });
        setDays(newDays);
        setPickerVisible(false);
        setActiveDayIndex(null);
    };

    const removeMeal = (dayIndex: number, mealIndex: number) => {
        const newDays = [...days];
        newDays[dayIndex].meals.splice(mealIndex, 1);
        setDays(newDays);
    };

    const updateDayTitle = (text: string, index: number) => {
        const newDays = [...days];
        newDays[index].day = text;
        setDays(newDays);
    };

    if (loading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Plan</Text>
                    <TouchableOpacity onPress={() => handleSave()} disabled={updateMutation.isPending} style={styles.saveButton}>
                        {updateMutation.isPending ? (
                            <ActivityIndicator size="small" color={COLORS.card} />
                        ) : (
                            <Text style={styles.saveButtonText}>Save</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                    {/* Image Picker */}
                    <TouchableOpacity style={styles.imagePicker} onPress={handleImageSelection}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.imagePreview} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Ionicons name="camera" size={40} color={COLORS.text.light} />
                                <Text style={styles.imagePlaceholderText}>Change Cover Photo</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Metadata Section */}
                    <Animated.View entering={FadeInDown.springify()} style={styles.section}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Title</Text>
                            <TextInput
                                style={styles.input}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="My Weekly Plan"
                                placeholderTextColor={COLORS.text.light}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="A healthy plan for this week..."
                                placeholderTextColor={COLORS.text.light}
                                multiline
                            />
                        </View>

                        {/* Active Switch */}
                        <View style={styles.switchContainer}>
                            <View>
                                <Text style={styles.switchLabel}>Active Plan</Text>
                                <Text style={styles.switchSubLabel}>Make this your current plan</Text>
                            </View>
                            <Switch
                                value={isActive}
                                onValueChange={setIsActive}
                                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                                thumbColor={COLORS.card}
                            />
                        </View>

                        {/* Public Switch */}
                        <View style={styles.switchContainer}>
                            <View>
                                <Text style={styles.switchLabel}>Public Plan</Text>
                                <Text style={styles.switchSubLabel}>Allow others to see this plan</Text>
                            </View>
                            <Switch
                                value={isPublic}
                                onValueChange={setIsPublic}
                                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                                thumbColor={COLORS.card}
                            />
                        </View>
                    </Animated.View>

                    {/* Days Section */}
                    <Text style={styles.sectionTitle}>Days and Meals</Text>
                    {days.map((day, dayIndex) => (
                        <Animated.View
                            key={day._id || dayIndex}
                            entering={SlideInRight.delay(dayIndex * 100).springify()}
                            exiting={SlideOutRight}
                            style={styles.dayCard}
                        >
                            <View style={styles.dayHeader}>
                                <View style={styles.dayTitleContainer}>
                                    <Ionicons name="calendar-outline" size={20} color={COLORS.primary} style={{ marginRight: SPACING.s }} />
                                    <TextInput
                                        value={day.day}
                                        onChangeText={(t) => updateDayTitle(t, dayIndex)}
                                        style={styles.dayTitleInput}
                                        placeholder="Day Name"
                                        placeholderTextColor={COLORS.text.light}
                                    />
                                </View>
                                <TouchableOpacity onPress={() => removeDay(dayIndex)} style={styles.iconButton}>
                                    <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                                </TouchableOpacity>
                            </View>

                            {/* Meals List */}
                            {day.meals.map((meal, mealIndex) => (
                                <View key={meal._id || mealIndex} style={styles.mealRow}>
                                    <View style={styles.mealInfo}>
                                        <Ionicons name="restaurant-outline" size={16} color={COLORS.text.secondary} style={{ marginRight: SPACING.s }} />
                                        <Text style={styles.mealRecipe}>
                                            {typeof meal.recipe === 'string' ? "Recipe" : meal.recipe.title}
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => removeMeal(dayIndex, mealIndex)} style={styles.iconButton}>
                                        <Ionicons name="close-circle" size={20} color={COLORS.text.light} />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <TouchableOpacity style={styles.addMealButton} onPress={() => openPicker(dayIndex)}>
                                <Ionicons name="add" size={16} color={COLORS.primary} />
                                <Text style={styles.addMealText}>Add Meal</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}

                    <TouchableOpacity style={styles.addDayButton} onPress={addDay}>
                        <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} style={{ marginRight: SPACING.s }} />
                        <Text style={styles.addDayText}>Add Day</Text>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>

                <RecipePicker
                    visible={pickerVisible}
                    onClose={() => setPickerVisible(false)}
                    onSelect={handleSelectRecipe}
                />

                <ConfirmModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    title={modalConfig.title}
                    message={modalConfig.message}
                    actions={modalConfig.actions}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { padding: SPACING.m },
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.m,
        paddingTop: SPACING.s,
        paddingBottom: SPACING.m,
        backgroundColor: COLORS.card,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        ...SHADOWS.small,
        zIndex: 10,
    },
    backButton: {
        padding: SPACING.xs,
    },
    headerTitle: {
        fontSize: FONTS.sizes.h3,
        fontWeight: '700',
        color: COLORS.text.primary,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: SPACING.s,
    },
    saveButtonText: {
        color: COLORS.card,
        fontWeight: '600',
        fontSize: FONTS.sizes.body,
    },
    imagePicker: {
        width: '100%',
        height: 200,
        backgroundColor: COLORS.card,
        borderRadius: SPACING.m,
        marginBottom: SPACING.m,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        alignItems: 'center',
    },
    imagePlaceholderText: {
        marginTop: SPACING.s,
        color: COLORS.text.light,
        fontSize: FONTS.sizes.body,
    },
    section: {
        marginBottom: SPACING.l,
        backgroundColor: COLORS.card,
        padding: SPACING.m,
        borderRadius: SPACING.m,
        ...SHADOWS.small
    },
    inputGroup: {
        marginBottom: SPACING.m,
    },
    label: {
        fontSize: FONTS.sizes.small,
        fontWeight: "600",
        color: COLORS.text.secondary,
        marginBottom: SPACING.xs
    },
    input: {
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: SPACING.s,
        padding: SPACING.s,
        fontSize: FONTS.sizes.body,
        color: COLORS.text.primary,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: SPACING.s,
        paddingTop: SPACING.s,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    switchLabel: {
        fontSize: FONTS.sizes.body,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    switchSubLabel: {
        fontSize: FONTS.sizes.small,
        color: COLORS.text.secondary,
    },
    sectionTitle: {
        fontSize: FONTS.sizes.h3,
        fontWeight: "700",
        color: COLORS.text.primary,
        marginBottom: SPACING.m
    },
    dayCard: {
        backgroundColor: COLORS.card,
        borderRadius: SPACING.m,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        ...SHADOWS.small,
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingBottom: SPACING.s,
    },
    dayTitleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    dayTitleInput: {
        fontSize: FONTS.sizes.body,
        fontWeight: '700',
        color: COLORS.text.primary,
        flex: 1,
    },
    mealRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.background,
        padding: SPACING.s,
        borderRadius: SPACING.s,
        marginBottom: SPACING.s,
    },
    mealInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    mealRecipe: {
        fontSize: FONTS.sizes.body,
        color: COLORS.text.primary
    },
    iconButton: {
        padding: 4,
    },
    addMealButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.s,
        paddingVertical: SPACING.s,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: SPACING.s,
        borderStyle: 'dashed',
    },
    addMealText: {
        color: COLORS.primary,
        marginLeft: 6,
        fontWeight: '600',
        fontSize: FONTS.sizes.body
    },
    addDayButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.card,
        padding: SPACING.m,
        borderRadius: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
    },
    addDayText: {
        color: COLORS.primary,
        fontWeight: '700',
        fontSize: FONTS.sizes.body
    },
});
