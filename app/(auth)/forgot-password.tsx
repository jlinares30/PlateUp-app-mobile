import { COLORS, FONTS, SHADOWS, SPACING } from "@/src/constants/theme";
import api from "@/src/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useTranslation } from "@/src/lib/i18n";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", newPassword: "", confirmPassword: "" });

  const validate = (field: string, value: string) => {
    let newErrors = { ...errors };

    if (field === "email") {
      newErrors.email = value.trim() ? "" : "Email is required";
    }
    if (field === "newPassword") {
      newErrors.newPassword = value.length >= 6 ? "" : "Password must be at least 6 characters";
      if (confirmPassword && value !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      } else if (confirmPassword) {
        newErrors.confirmPassword = "";
      }
    }
    if (field === "confirmPassword") {
      newErrors.confirmPassword = value === newPassword ? "" : "Passwords do not match";
    }

    setErrors(newErrors);
  };

  const handleResetPassword = async () => {
    if (!email || !newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      Alert.alert(
        language === 'es' ? 'Error' : 'Error',
        language === 'es' ? 'Las contraseñas no coinciden' : 'Passwords do not match'
      );
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email: email.trim(),
        newPassword,
      });

      Alert.alert(
        language === 'es' ? '¡Éxito!' : 'Success',
        language === 'es' ? '¡Contraseña restablecida con éxito! Inicia sesión con tu nueva contraseña.' : 'Password reset successfully! Please log in with your new password.',
        [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/login"),
          },
        ]
      );
    } catch (error: any) {
      const message = error.response?.data?.message || (language === 'es' ? 'No se pudo restablecer la contraseña. Verifica tu correo.' : 'Could not reset password. Please check your email.');
      Alert.alert(
        language === 'es' ? 'Error al Restablecer' : 'Reset Failed',
        message
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    email &&
    newPassword &&
    confirmPassword &&
    !errors.email &&
    !errors.newPassword &&
    !errors.confirmPassword;

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.card}>
          {/* Back Button */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>Enter your email address and your new password to reset it.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                placeholder="hello@example.com"
                placeholderTextColor={COLORS.text.light}
                style={[styles.input, errors.email ? styles.inputError : null]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  validate("email", text);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor={COLORS.text.light}
                secureTextEntry
                style={[styles.input, errors.newPassword ? styles.inputError : null]}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  validate("newPassword", text);
                }}
              />
              {errors.newPassword ? <Text style={styles.errorText}>{errors.newPassword}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor={COLORS.text.light}
                secureTextEntry
                style={[styles.input, errors.confirmPassword ? styles.inputError : null]}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  validate("confirmPassword", text);
                }}
              />
              {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
            </View>

            <TouchableOpacity
              style={[styles.button, (!isFormValid || loading) && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={!isFormValid || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
    padding: SPACING.l,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.l,
    padding: SPACING.l,
    ...SHADOWS.large,
  },
  backButton: {
    marginBottom: SPACING.m,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONTS.sizes.h1,
    fontWeight: "800",
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sizes.body,
    color: COLORS.text.secondary,
    textAlign: "center",
  },
  form: {
    gap: SPACING.m,
  },
  inputGroup: {
    gap: SPACING.xs,
  },
  label: {
    fontSize: FONTS.sizes.small,
    fontWeight: "600",
    color: COLORS.text.secondary,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SPACING.m,
    padding: SPACING.m,
    fontSize: FONTS.sizes.body,
    color: COLORS.text.primary,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.m,
    borderRadius: SPACING.m,
    alignItems: "center",
    marginTop: SPACING.s,
    ...SHADOWS.medium,
  },
  buttonText: {
    color: "#fff",
    fontSize: FONTS.sizes.h3,
    fontWeight: "700",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    fontSize: FONTS.sizes.small,
    marginTop: 2,
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: "#ccc",
  },
});
