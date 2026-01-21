import { COLORS, FONTS, SHADOWS, SPACING } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
import RecipePicker from "../../../../src/components/RecipePicker";
import api from "../../../../src/lib/api";
import { DayPlan } from "../../../../src/types";

export default function EditMealPlanScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [days, setDays] = useState<DayPlan[]>([]);
    const [isActive, setIsActive] = useState(false);
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
                if (Array.isArray(data.days)) {
                    setDays(data.days);
                } else {
                    setDays([]);
                }
            }
        } catch (e) {
            Alert.alert("Error", "No se pudo cargar el plan.");
        } finally {
            setLoading(false);
        }
    };

    const updateMutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await api.put(`/meal-plans/${id}`, payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
            Alert.alert("Success", "Plan updated successfully.", [
                { text: "OK", onPress: () => router.back() }
            ]);
        },
        onError: (error) => {
            console.error(error);
            Alert.alert("Error", "Could not save changes.");
        }
    });

    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert("Error", "Title is required.");
            return;
        }

        const payload = {
            title,
            description,
            isActive,
            days: days.map(d => ({
                day: d.day,
                meals: d.meals.map(m => ({
                    // Validar enum: si no es válido, usar 'lunch' por defecto
                    type: ["breakfast", "lunch", "dinner", "snack"].includes(m.type.toLowerCase()) ? m.type.toLowerCase() : "lunch",
                    recipe: m.recipe._id // Enviar solo el ID
                }))
            })),
        };

        updateMutation.mutate(payload);
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
