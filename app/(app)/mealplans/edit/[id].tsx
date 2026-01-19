import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
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
    const [isActive, setIsActive] = useState(false); // Add isActive state
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
                setIsActive(!!data.isActive); // Set initial isActive
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
            Alert.alert("Éxito", "Plan actualizado correctamente.", [
                { text: "OK", onPress: () => router.back() }
            ]);
        },
        onError: (error) => {
            console.error(error);
            Alert.alert("Error", "No se pudieron guardar los cambios.");
        }
    });

    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert("Error", "El título es obligatorio.");
            return;
        }

        const payload = {
            title,
            description,
            isActive,
            days: days.map(d => ({
                day: d.day,
                meals: d.meals.map(m => ({
                    // Validar enum: si no es válido, usar 'almuerzo' por defecto
                    type: ["desayuno", "almuerzo", "cena", "snack"].includes(m.type.toLowerCase()) ? m.type.toLowerCase() : "almuerzo",
                    recipe: m.recipe._id // Enviar solo el ID
                }))
            })),
        };

        updateMutation.mutate(payload);
    };

    const addDay = () => {
        setDays([...days, { _id: Date.now().toString(), day: `Día ${days.length + 1}`, meals: [] }]);
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
        // Check if title is string or object (api inconsistency handling)
        const recipeTitle = typeof recipe.title === 'string' ? recipe.title : "Receta";

        day.meals.push({
            _id: Date.now().toString(),
            type: 'almuerzo',
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

    if (loading) return <ActivityIndicator size="large" style={styles.center} />;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1, backgroundColor: "#fff" }}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.rowHeader}>
                    <Text style={styles.header}>Edit Plan</Text>
                    <TouchableOpacity onPress={() => handleSave()} disabled={updateMutation.isPending}>
                        <Text style={styles.saveLink}>{updateMutation.isPending ? "Saving..." : "Save"}</Text>
                    </TouchableOpacity>
                </View>

                {/* Metadata Section */}
                <View style={styles.section}>
                    <Text style={styles.label}>Title</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Plan name"
                    />
                    <TextInput
                        style={styles.input}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Short description"
                    />

                    {/* Active Switch */}
                    <View style={styles.switchContainer}>
                        <Text style={styles.label}>Active</Text>
                        <Switch
                            value={isActive}
                            onValueChange={setIsActive}
                            trackColor={{ false: "#767577", true: "#81b0ff" }}
                            thumbColor={isActive ? "#2980b9" : "#f4f3f4"}
                        />
                    </View>
                </View>

                {/* Days Section */}
                <Text style={styles.sectionTitle}>Days and Meals</Text>
                {days.map((day, dayIndex) => (
                    <View key={day._id || dayIndex} style={styles.dayCard}>
                        <View style={styles.dayHeader}>
                            <TextInput
                                value={day.day}
                                onChangeText={(t) => updateDayTitle(t, dayIndex)}
                                style={styles.dayTitleInput}
                            />
                            <TouchableOpacity onPress={() => removeDay(dayIndex)}>
                                <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                            </TouchableOpacity>
                        </View>

                        {/* Meals List */}
                        {day.meals.map((meal, mealIndex) => (
                            <View key={meal._id || mealIndex} style={styles.mealRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.mealRecipe}>
                                        {typeof meal.recipe === 'string' ? "Recipe" : meal.recipe.title}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => removeMeal(dayIndex, mealIndex)}>
                                    <Ionicons name="close-circle" size={20} color="#bdc3c7" />
                                </TouchableOpacity>
                            </View>
                        ))}

                        <TouchableOpacity style={styles.addMealButton} onPress={() => openPicker(dayIndex)}>
                            <Ionicons name="add" size={16} color="#2980b9" />
                            <Text style={styles.addMealText}>Add Meal</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                <TouchableOpacity style={styles.addDayButton} onPress={addDay}>
                    <Text style={styles.addDayText}>+ Add Day</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            <RecipePicker
                visible={pickerVisible}
                onClose={() => setPickerVisible(false)}
                onSelect={handleSelectRecipe}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    header: { fontSize: 24, fontWeight: "700", color: "#2c3e50" },
    saveLink: { fontSize: 18, color: "#2980b9", fontWeight: '600' },
    section: { marginBottom: 24 },
    label: { fontSize: 13, fontWeight: "600", color: "#7f8c8d", marginBottom: 6, marginTop: 12 },
    input: {
        backgroundColor: "#f8f9fa",
        borderBottomWidth: 1,
        borderBottomColor: "#bdc3c7",
        paddingVertical: 8,
        fontSize: 16,
        color: "#2c3e50"
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    sectionTitle: { fontSize: 18, fontWeight: "600", color: "#2c3e50", marginBottom: 12 },

    dayCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#eef6fb',
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 8,
    },
    dayTitleInput: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2c3e50',
        flex: 1,
    },
    mealRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
    },
    mealRecipe: { fontSize: 15, color: '#34495e' },

    addMealButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#eef6fb', // dashed?
        borderRadius: 8,
        borderStyle: 'dashed',
    },
    addMealText: { color: '#2980b9', marginLeft: 6, fontWeight: '500' },

    addDayButton: {
        backgroundColor: '#e8f4fd',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    addDayText: { color: '#2980b9', fontWeight: '700', fontSize: 16 },

    saveButton: {
        backgroundColor: "#2980b9",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10
    },
    disabled: { opacity: 0.7 },
    saveText: { color: "#fff", fontSize: 16, fontWeight: "600" }
});
