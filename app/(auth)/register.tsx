import { COLORS, FONTS, SHADOWS, SPACING } from "@/src/constants/theme";
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
import { useAuthStore } from "../../src/store/useAuth.js";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validate = (field: string, value: string) => {
    let newErrors = { ...errors };

    if (field === "name") {
      newErrors.name = value.trim() ? "" : "Name is required";
    }
    if (field === "email") {
      if (!value.trim()) newErrors.email = "Email is required";
      else if (!validateEmail(value)) newErrors.email = "Invalid email address";
      else newErrors.email = "";
    }
    if (field === "password") {
      newErrors.password = value.length >= 6 ? "" : "Password must be at least 6 characters";
    }

    setErrors(newErrors);
  };

  const handleSignup = async () => {
    if (errors.name || errors.email || errors.password || !name || !email || !password) {
      return;
    }

    const result = await register(name, email, password);
    if (result === true) {
      Alert.alert("Success", "Account created! Please log in.");
      router.push("./login");
    } else if (typeof result === 'string') {
      if (result.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: result }));
      } else {
        Alert.alert("Registration Failed", result);
      }
    }
  };

  const isFormValid = name && email && password && !errors.name && !errors.email && !errors.password;

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.card}>
          <View style={styles.headerContainer}>
            <Ionicons name="person-add" size={64} color={COLORS.secondary} />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us to track your nutrition</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                placeholder="John Wick"
                placeholderTextColor={COLORS.text.light}
                style={[styles.input, errors.name ? styles.inputError : null]}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  validate("name", text);
                }}
              />
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

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
              <Text style={styles.label}>Password</Text>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor={COLORS.text.light}
                secureTextEntry
                style={[styles.input, errors.password ? styles.inputError : null]}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  validate("password", text);
                }}
              />
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            <TouchableOpacity
              style={[styles.button, (!isFormValid || loading) && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={!isFormValid || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace("./login")}>
                <Text style={styles.link}>Log In</Text>
              </TouchableOpacity>
            </View>
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
    justifyContent: 'center',
    padding: SPACING.l,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.l,
    padding: SPACING.l,
    ...SHADOWS.large,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONTS.sizes.h1,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginTop: SPACING.m,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sizes.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  form: {
    gap: SPACING.m,
  },
  inputGroup: {
    gap: SPACING.xs,
  },
  label: {
    fontSize: FONTS.sizes.small,
    fontWeight: '600',
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
    backgroundColor: COLORS.secondary, // Different color for register to differentiate
    padding: SPACING.m,
    borderRadius: SPACING.m,
    alignItems: 'center',
    marginTop: SPACING.s,
    ...SHADOWS.medium,
  },
  buttonText: {
    color: '#fff',
    fontSize: FONTS.sizes.h3,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.l,
  },
  footerText: {
    color: COLORS.text.secondary,
    fontSize: FONTS.sizes.body,
  },
  link: {
    color: COLORS.secondary,
    fontWeight: '700',
    fontSize: FONTS.sizes.body,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: FONTS.sizes.small,
    marginTop: 2
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: '#ccc'
  }
});
