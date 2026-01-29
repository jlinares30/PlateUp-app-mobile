import RecipePicker from "@/src/components/RecipePicker";
import { COLORS, FONTS, SHADOWS, SPACING } from "@/src/constants/theme";
import api from "@/src/lib/api";
import { DayPlan, Meal } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { SlideInRight, SlideOutRight } from "react-native-reanimated";

import Toast from 'react-native-toast-message';



export default function CreateMealPlanScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [isActive, setIsActive] = useState(true);
    const [isPublic, setIsPublic] = useState(false);
    const [days, setDays] = useState<DayPlan[]>([]);

    // Picker State
    const [pickerVisible, setPickerVisible] = useState(false);
    const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images' as any,
            allowsEditing: true, // Allow cropping for better cover photos
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const addDay = () => {
        setDays([...days, { day: `Day ${days.length + 1}`, meals: [] }]);
    };

    const removeDay = (index: number) => {
        const newDays = [...days];
        newDays.splice(index, 1);
        setDays(newDays);
    };

    const updateDayTitle = (text: string, index: number) => {
        const newDays = [...days];
        newDays[index].day = text;
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
        const recipeTitle = recipe.title || "Recipe";

        // Auto-categorize based on recipe category
        let mealType: Meal['type'] = 'almuerzo';
        const category = recipe.category?.toLowerCase() || "";

        if (category.includes('breakfast') || category.includes('desayuno')) mealType = 'desayuno';
        else if (category.includes('dinner') || category.includes('cena')) mealType = 'cena';
        else if (category.includes('snack') || category.includes('merienda')) mealType = 'snack';

        day.meals.push({
            type: mealType,
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

    const createMutation = useMutation({
        mutationFn: async () => {
            // Format days for backend (only IDs needed for recipes)
            const formattedDays = days.map(d => ({
                day: d.day,
                meals: d.meals.map(m => ({
                    type: m.type,
                    recipe: m.recipe._id
                }))
            }));

            if (image) {
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

                const res = await api.post("/meal-plans", formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                return res.data;
            } else {
                // Send as regular JSON if no image
                const payload = {
                    title,
                    description,
                    isActive,
                    isPublic,
                    days: formattedDays
                };
                const res = await api.post("/meal-plans", payload);
                return res.data;
            }
        },


        // ...

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mealPlans"] });
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Meal Plan created!'
            });
            router.back();
        },
        onError: (error: any) => {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: "Failed to create meal plan. " + (error.response?.data?.message || error.message)
            });
        },
    });

    const handleSubmit = () => {
        if (!title) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: "Please fill in the Title field"
            });
            return;
        }
        createMutation.mutate();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Meal Plan</Text>
                <TouchableOpacity onPress={handleSubmit} disabled={createMutation.isPending} style={styles.saveButton}>
                    {createMutation.isPending ? (
                        <ActivityIndicator size="small" color={COLORS.card} />
                    ) : (
                        <Text style={styles.saveButtonText}>Create</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Image Picker */}
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.imagePreview} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Ionicons name="camera" size={40} color={COLORS.text.light} />
                            <Text style={styles.imagePlaceholderText}>Add Cover Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.section}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Title *</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g. Weekly Healthy Mix"
                            placeholderTextColor={COLORS.text.light}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Descriptiouyjg</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="What's this plan about?"
                            placeholderTextColor={COLORS.text.light}
                            multiline
                        />
                    </View>

                    {/* Switches */}
                    <View style={styles.switchRow}>
                        <View>
                            <Text style={styles.switchLabel}>Active Plan</Text>
                            <Text style={styles.switchSubLabel}>Set as your current plan</Text>
                        </View>
                        <Switch
                            value={isActive}
                            onValueChange={setIsActive}
                            trackColor={{ false: COLORS.border, true: COLORS.primary }}
                        />
                    </View>

                    <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
                        <View>
                            <Text style={styles.switchLabel}>Public Plan</Text>
                            <Text style={styles.switchSubLabel}>Allow others to see this plan</Text>
                        </View>
                        <Switch
                            value={isPublic}
                            onValueChange={setIsPublic}
                            trackColor={{ false: COLORS.border, true: COLORS.primary }}
                        />
                    </View>
                </View>

                {/* Days Section */}
                <Text style={styles.sectionTitle}>Days & Meals</Text>

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
                            <View key={mealIndex} style={styles.mealRow}>
                                <View style={styles.mealInfo}>
                                    <View style={styles.mealBadge}>
                                        <Text style={styles.mealBadgeText}>{meal.type}</Text>
                                    </View>
                                    <Text style={styles.mealRecipe} numberOfLines={1}>
                                        {meal.recipe.title}
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.m,
        paddingTop: SPACING.xs,
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
    content: {
        padding: SPACING.m,
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
        backgroundColor: COLORS.card,
        borderRadius: SPACING.m,
        padding: SPACING.m,
        marginBottom: SPACING.l,
        ...SHADOWS.small,
    },
    formGroup: {
        marginBottom: SPACING.m,
    },
    label: {
        fontSize: FONTS.sizes.body,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: SPACING.xs,
    },
    input: {
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: SPACING.s,
        padding: SPACING.m,
        fontSize: FONTS.sizes.body,
        color: COLORS.text.primary,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.s,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    switchLabel: {
        fontSize: FONTS.sizes.body,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    switchSubLabel: {
        fontSize: FONTS.sizes.small,
        color: COLORS.text.secondary,
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: FONTS.sizes.h3,
        fontWeight: '700',
        color: COLORS.text.primary,
        marginBottom: SPACING.m,
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
    mealBadge: {
        backgroundColor: COLORS.primary + '20',
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
        marginRight: SPACING.s,
    },
    mealBadgeText: {
        fontSize: 10,
        color: COLORS.primary,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    mealRecipe: {
        fontSize: FONTS.sizes.body,
        color: COLORS.text.primary,
        flex: 1,
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
        marginBottom: SPACING.xl
    },
    addDayText: {
        color: COLORS.primary,
        fontWeight: '700',
        fontSize: FONTS.sizes.body
    },
});
