import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuthStore } from "../../src/store/useAuth.js";

export default function LoginScreen() {
  const router = useRouter();
  const { login, error, loading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const success = await login(email, password);
    console.log(email, password);
    if (success) {
      router.replace("/(app)");
      console.log("Login successful");
    } else {
      console.log(success);
      console.log("Login failedas");
    }
  };

  const handleSignup = async () => {
    router.replace("./register");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      <View style={styles.buttonContainer}>
        <Button title="Log in" onPress={handleLogin} />
      </View>

      <View style={styles.redirectContainer}>
        <Text style={styles.redirectText}>Dont have an account? </Text>
        <TouchableOpacity onPress={handleSignup}>
          <Text style={styles.redirectLink}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#3e6f38ff',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: '#ffffffff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: '50%',
    marginTop: 10,
  },
  redirectContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  redirectText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  redirectLink: {
    color: '#abbef3ff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
});

