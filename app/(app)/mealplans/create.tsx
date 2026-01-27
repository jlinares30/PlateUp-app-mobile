import { COLORS, FONTS, SHADOWS, SPACING } from "@/src/constants/theme";
import api from "@/src/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

export default function CreateMealPlanScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<string | null>(null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images' as any,
            allowsEditing: false,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const createMutation = useMutation({
        mutationFn: async () => {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);

            // Note: We are not sending 'days' initially. 
            // The backend should default to an empty days array.
            // This avoids complexity with parsing JSON arrays in FormData 
            // if the backend controller doesn't explicitly parse it.

            if (image) {
                const filename = image.split('/').pop();
                const match = /\.(\w+)$/.exec(filename ?? "");
                const type = match ? `image/${match[1]}` : `image`;

                // @ts-ignore: FormData expects Blob but RN sends object with uri, name, type
                formData.append('image', { uri: image, name: filename, type } as any);
            }

            const res = await api.post("/meal-plans", formData);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mealPlans"] });
            Alert.alert("Success", "Meal Plan created!");
            router.back();
        },
        onError: (error: any) => {
            console.error(error);
            Alert.alert("Error", "Failed to create meal plan. " + (error.response?.data?.message || error.message));
        },
    });

    const handleSubmit = () => {
        if (!title) {
            Alert.alert("Error", "Please fill in the Title field");
            return;
        }
        createMutation.mutate();
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Meal Plan</Text>
                <View style={{ width: 24 }} />
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
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="What's this plan about?"
                        placeholderTextColor={COLORS.text.light}
                        multiline
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, createMutation.isPending && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={createMutation.isPending}
                >
                    {createMutation.isPending ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Create Plan</Text>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
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
        paddingTop: SPACING.xl * 1.5,
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
});
