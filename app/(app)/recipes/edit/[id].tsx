import ConfirmModal, { ModalAction } from '@/src/components/ConfirmModal';
import IngredientSelector from "@/src/components/IngredientSelector";
import { COLORS, FONTS, SHADOWS, SPACING } from "@/src/constants/theme";
import api from "@/src/lib/api";
import { Ingredient } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Toast from 'react-native-toast-message';

export default function EditRecipeScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [ingredients, setIngredients] = useState<{ ingredient: Ingredient, quantity: string, unit: string }[]>([]);
    const [showIngredientSelector, setShowIngredientSelector] = useState(false);
    const [steps, setSteps] = useState("");
    const [time, setTime] = useState("");
    const [category, setCategory] = useState("");
    const [difficulty, setDifficulty] = useState("Medium");
    const [image, setImage] = useState<string | null>(null);
    const [isPublic, setIsPublic] = useState(false);
    const [tags, setTags] = useState("");
    const [newImagePicked, setNewImagePicked] = useState(false); // Track if user picked a new image

    // Fetch existing recipe
    const { data: recipe, isLoading } = useQuery({
        queryKey: ['recipe', id],
        queryFn: async () => {
            const res = await api.get(`/recipes/${id}`);
            return res.data?.data ?? res.data;
        },
        enabled: !!id,
    });

    // Populate form when data loads
    useEffect(() => {
        if (recipe) {
            setTitle(recipe.title || "");
            setDescription(recipe.description || "");
            setTime(recipe.time || "");
            setCategory(recipe.category || "");
            setDifficulty(recipe.difficulty || "Medium");
            setImage(recipe.imageUrl || null);
            setIsPublic(recipe.isPublic || false);

            if (recipe.steps && Array.isArray(recipe.steps)) {
                setSteps(recipe.steps.join('\n'));
            }

            if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
                const formatted = recipe.ingredients.map((item: any) => ({
                    ingredient: item.ingredient, // Assuming full object populated
                    quantity: String(item.quantity) || "",
                    unit: item.unit || ""
                }));
                setIngredients(formatted);
            }
            if (recipe.tags && Array.isArray(recipe.tags)) {
                setTags(recipe.tags.join(', '));
            }
        }
    }, [recipe]);

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

    const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();
    const [libraryPermission, requestLibraryPermission] = ImagePicker.useMediaLibraryPermissions();

    const handleImageSelection = async () => {
        showAlert(
            "Recipe Photo",
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
            setNewImagePicked(true);
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
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setNewImagePicked(true);
        }
    };

    const updateMutation = useMutation({
        mutationFn: async () => {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            const stepsArray = steps.split('\n').filter(s => s.trim());
            formData.append("steps", JSON.stringify(stepsArray));

            const formattedIngredients = ingredients.map(item => ({
                ingredient: item.ingredient._id,
                quantity: parseFloat(item.quantity) || 0,
                unit: item.unit
            }));
            formData.append("ingredients", JSON.stringify(formattedIngredients));

            formData.append("time", time);
            formData.append("category", category);
            formData.append("difficulty", difficulty);
            formData.append("isPublic", String(isPublic));

            const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
            formData.append("tags", JSON.stringify(tagsArray));

            // Only append image if it's a new one (local URI)
            // Backend should keep existing image if 'image' field is not sent (or handle logic)
            // But updateRecipe logic we just wrote checks req.file. 
            // If we don't send file, it keeps existing.
            if (newImagePicked && image) {
                const uriParts = image.split('.');
                const fileType = uriParts[uriParts.length - 1];

                formData.append('image', {
                    uri: image,
                    name: `photo.${fileType}`,
                    type: `image/${fileType}`,
                } as any);
            } else if (image && !newImagePicked) {
                // Explicitly send the existing URL if needed, but robust backend usually ignores if null/undefined
                // Our backend: "if (req.file) updateData.image = ...". So safe to omit if not changing.
            }

            const res = await api.put(`/recipes/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recipes"] });
            queryClient.invalidateQueries({ queryKey: ["recipe", id] });
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Recipe updated!'
            });
            router.back();
        },
        onError: (error: any) => {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: "Failed to update recipe. " + (error.response?.data?.message || error.message)
            });
        },
    });

    const handleSubmit = () => {
        if (!title || !time || !category) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: "Please fill in required fields (Title, Time, Category)"
            });
            return;
        }
        updateMutation.mutate();
    };

    const addIngredient = (ingredient: Ingredient) => {
        if (ingredients.find(i => i.ingredient._id === ingredient._id)) {
            Toast.show({
                type: 'info',
                text1: 'Info',
                text2: "Ingredient already added"
            });
            return;
        }
        setIngredients([...ingredients, { ingredient, quantity: "", unit: ingredient.unit || "" }]);
    };

    const removeIngredient = (index: number) => {
        const newIngredients = [...ingredients];
        newIngredients.splice(index, 1);
        setIngredients(newIngredients);
    };

    const updateIngredient = (index: number, field: 'quantity' | 'unit', value: string) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = { ...newIngredients[index], [field]: value };
        setIngredients(newIngredients);
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Recipe</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Image Picker */}
                <TouchableOpacity style={styles.imagePicker} onPress={handleImageSelection}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.imagePreview} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Ionicons name="camera" size={40} color={COLORS.text.light} />
                            <Text style={styles.imagePlaceholderText}>Add Photo</Text>
                        </View>
                    )}
                    {/* Overlay to indicate edit */}
                    <View style={{ position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 6 }}>
                        <Ionicons name="pencil" size={16} color="white" />
                    </View>
                </TouchableOpacity>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Title *</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="e.g. Pasta Carbonara"
                        placeholderTextColor={COLORS.text.light}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Brief description..."
                        placeholderTextColor={COLORS.text.light}
                        multiline
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.formGroup, { flex: 1, marginRight: SPACING.s }]}>
                        <Text style={styles.label}>Time *</Text>
                        <TextInput
                            style={styles.input}
                            value={time}
                            onChangeText={setTime}
                            placeholder="e.g. 30 min"
                            placeholderTextColor={COLORS.text.light}
                        />
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Category *</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.difficultyChip,
                                        category === cat && styles.difficultyChipActive
                                    ]}
                                    onPress={() => setCategory(cat)}
                                >
                                    <Text style={[
                                        styles.difficultyText,
                                        category === cat && styles.difficultyTextActive
                                    ]}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Difficulty</Text>
                    <View style={styles.difficultyContainer}>
                        {['Easy', 'Medium', 'Hard'].map((level) => (
                            <TouchableOpacity
                                key={level}
                                style={[
                                    styles.difficultyChip,
                                    difficulty === level && styles.difficultyChipActive
                                ]}
                                onPress={() => setDifficulty(level)}
                            >
                                <Text style={[
                                    styles.difficultyText,
                                    difficulty === level && styles.difficultyTextActive
                                ]}>{level}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Visibility</Text>
                        <Switch
                            value={isPublic}
                            onValueChange={setIsPublic}
                            trackColor={{ false: COLORS.border, true: COLORS.primary }}
                            thumbColor="#fff"
                        />
                    </View>
                    <Text style={{ color: COLORS.text.secondary, fontSize: FONTS.sizes.small }}>
                        {isPublic ? "Public: Everyone can see this recipe" : "Private: Only you can see this recipe"}
                    </Text>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Tags (comma separated)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Healthy, Italian, Quick"
                        placeholderTextColor={COLORS.text.light}
                        onChangeText={text => setTags(text)}
                        value={tags}
                    />
                </View>

                <View style={styles.formGroup}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Ingredients</Text>
                        <TouchableOpacity onPress={() => setShowIngredientSelector(true)}>
                            <Text style={styles.addText}>+ Add Ingredient</Text>
                        </TouchableOpacity>
                    </View>

                    {ingredients.map((item, index) => (
                        <View key={item.ingredient._id} style={styles.ingredientRow}>
                            <Text style={[styles.ingredientName, { flex: 2 }]}>{item.ingredient.name}</Text>
                            <TextInput
                                style={[styles.input, styles.smallInput, { flex: 1 }]}
                                placeholder="Qty"
                                keyboardType="numeric"
                                value={item.quantity}
                                onChangeText={(text) => updateIngredient(index, 'quantity', text)}
                            />
                            <TextInput
                                style={[styles.input, styles.smallInput, { flex: 1 }]}
                                placeholder="Unit"
                                value={item.unit}
                                onChangeText={(text) => updateIngredient(index, 'unit', text)}
                            />
                            <TouchableOpacity onPress={() => removeIngredient(index)} style={styles.removeButton}>
                                <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Simplified Steps Input */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Steps (one per line)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={steps}
                        onChangeText={setSteps}
                        placeholder="1. Boil water..."
                        placeholderTextColor={COLORS.text.light}
                        multiline
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, updateMutation.isPending && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={updateMutation.isPending}
                >
                    {updateMutation.isPending ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Update Recipe</Text>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            <IngredientSelector
                visible={showIngredientSelector}
                onClose={() => setShowIngredientSelector(false)}
                onSelect={addIngredient}
            />

            <ConfirmModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title={modalConfig.title}
                message={modalConfig.message}
                actions={modalConfig.actions}
            />
        </View>
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
        paddingTop: SPACING.s,
        paddingBottom: SPACING.m,
        backgroundColor: COLORS.card,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        padding: SPACING.xs,
    },
    headerTitle: {
        fontSize: FONTS.sizes.h3,
        fontWeight: '700',
        color: COLORS.text.primary,
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
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: SPACING.s,
        padding: SPACING.m,
        fontSize: FONTS.sizes.body,
        color: COLORS.text.primary,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        borderRadius: SPACING.m,
        padding: SPACING.m,
        alignItems: 'center',
        marginTop: SPACING.m,
        ...SHADOWS.medium,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: FONTS.sizes.h3,
        fontWeight: '700',
    },
    difficultyContainer: {
        flexDirection: 'row',
        gap: SPACING.s,
    },
    difficultyChip: {
        paddingVertical: SPACING.s,
        paddingHorizontal: SPACING.m,
        borderRadius: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.card,
    },
    difficultyChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    difficultyText: {
        color: COLORS.text.secondary,
        fontWeight: '600',
    },
    difficultyTextActive: {
        color: '#fff',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs
    },
    addText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: FONTS.sizes.body
    },
    ingredientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
        marginBottom: SPACING.s,
        backgroundColor: COLORS.card,
        padding: SPACING.s,
        borderRadius: SPACING.s,
        borderWidth: 1,
        borderColor: COLORS.border
    },
    ingredientName: {
        fontSize: FONTS.sizes.body,
        color: COLORS.text.primary,
    },
    smallInput: {
        padding: SPACING.s,
        height: 40
    },
    removeButton: {
        padding: SPACING.s
    },
    placeholderText: {
        color: COLORS.text.light,
        fontStyle: 'italic',
        marginBottom: SPACING.s
    }
});
