import { COLORS, FONTS, SHADOWS, SPACING } from "@/src/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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

export default function LoginScreen() {
  const router = useRouter();
  const { login, error, loading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });

  const validate = (field: string, value: string) => {
    let newErrors = { ...errors };

    if (field === "email") {
      newErrors.email = value.trim() ? "" : "Email is required";
    }
    if (field === "password") {
      newErrors.password = value ? "" : "Password is required";
    }

    setErrors(newErrors);
  };
  useEffect(() => {
  const checkStorage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      console.log("📦 AsyncStorage keys:", keys);
      
      const authData = await AsyncStorage.getItem('auth-storage');
      console.log("📦 Auth data:", authData);
    } catch (error) {
      console.error("Error reading storage:", error);
    }
  };
  
  checkStorage();
}, []);

  const handleLogin = async () => {
    if (!email || !password) return;

    const success = await login(email, password);
    console.log(email, password);
    if (success) {
      router.replace("/(app)");
      console.log("Login successful");
    } else {
      Alert.alert("Login Failed", "Invalid credentials");
    }
  };

  const isFormValid = email && password && !errors.email && !errors.password;

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.card}>
          <View style={styles.headerContainer}>
            <Image
              source={require("@/assets/images/logo_plateup-removebg.png")}
              style={{ width: 150, height: 150, resizeMode: 'contain', marginBottom: SPACING.s }}
            />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your healthy journey</Text>
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
              onPress={handleLogin}
              disabled={!isFormValid || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Log In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.replace("./register")}>
                <Text style={styles.link}>Sign Up</Text>
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
    justifyContent: "center",
    padding: SPACING.l,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.l,
    padding: SPACING.l,
    ...SHADOWS.large,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONTS.sizes.h1,
    fontWeight: "800",
    color: COLORS.text.primary,
    marginTop: SPACING.m,
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.l,
  },
  footerText: {
    color: COLORS.text.secondary,
    fontSize: FONTS.sizes.body,
  },
  link: {
    color: COLORS.primary,
    fontWeight: "700",
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
