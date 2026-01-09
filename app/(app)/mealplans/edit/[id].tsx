import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import RecipePicker from "../../../../src/components/RecipePicker";
import api from "../../../../src/lib/api";

interface RecipeRef {
    _id: string;
    title: string;
    time?: string;
}

interface Meal {
    _id: string; // Temp ID or real ID
    type: string;
    recipe: RecipeRef;
}

interface DayPlan {
    _id: string; // Temp ID or real ID
    day: string;
    meals: Meal[];
}

interface MealPlan {
    _id: string;
    title: string;
    description?: string;
    days: DayPlan[];
}

export default function EditMealPlanScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [days, setDays] = useState<DayPlan[]>([]);
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

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert("Error", "El título es obligatorio.");
            return;
        }
        setSaving(true);
        try {
            const payload = {
                title,
                description,
                days: days, // Send full structure
            };

            await api.put(`/meal-plans/${id}`, payload);
            queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
            Alert.alert("Éxito", "Plan actualizado correctamente.", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "No se pudieron guardar los cambios.");
        } finally {
            setSaving(false);
        }
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
            type: 'Comida',
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
                    <Text style={styles.header}>Editar Plan</Text>
                    <TouchableOpacity onPress={handleSave} disabled={saving}>
                        <Text style={styles.saveLink}>Guardar</Text>
                    </TouchableOpacity>
                </View>

                {/* Metadata Section */}
                <View style={styles.section}>
                    <Text style={styles.label}>Título</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Nombre del plan"
                    />
                    <Text style={styles.label}>Descripción</Text>
                    <TextInput
                        style={styles.input}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Descripción corta"
                    />
                </View>

                {/* Days Section */}
                <Text style={styles.sectionTitle}>Días y Comidas</Text>
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
                                    <Text style={styles.mealRecipe}>{meal.recipe?.title || "Receta"}</Text>
                                </View>
                                <TouchableOpacity onPress={() => removeMeal(dayIndex, mealIndex)}>
                                    <Ionicons name="close-circle" size={20} color="#bdc3c7" />
                                </TouchableOpacity>
                            </View>
                        ))}

                        <TouchableOpacity style={styles.addMealButton} onPress={() => openPicker(dayIndex)}>
                            <Ionicons name="add" size={16} color="#2980b9" />
                            <Text style={styles.addMealText}>Agregar Comida</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                <TouchableOpacity style={styles.addDayButton} onPress={addDay}>
                    <Text style={styles.addDayText}>+ Agregar Día</Text>
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
