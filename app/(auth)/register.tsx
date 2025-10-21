import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuthStore } from "../../src/store/useAuth.js";

export default function LoginScreen() {
  const router = useRouter();
  const { register, error, loading } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    const success = await register(name, email, password);
    console.log(name, email, password);
    if (success !== null) {
      router.push("./login");
        console.log("Login successful");
    } else {
        console.log(success);
      console.log("Login failedas");
    }
  };

  const handleLogin = async () => {
    router.replace("./login");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput 
        placeholder="Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
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
{/*       <TextInput
        placeholder="Confirm Password"
        secureTextEntry
        style={styles.input}
      /> */}

      <View style={styles.buttonContainer}>
        <Button title="Sign up" onPress={handleSignup}/>
      </View>
      <View style={styles.redirectContainer}>
        <Text style={styles.redirectText}>Already have an account? </Text>
        <TouchableOpacity onPress={handleLogin}>
          <Text style={styles.redirectLink}>Log In</Text>
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
    backgroundColor: '#fff',
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

