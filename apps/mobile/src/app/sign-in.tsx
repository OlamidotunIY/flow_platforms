import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/lib/auth-client";
import { Spacing } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function signIn() {
    setError(undefined);
    setIsSubmitting(true);

    const result = await authClient.signIn.email({
      email,
      password,
      rememberMe: true,
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message ?? "Unable to sign in.");
      return;
    }

    router.replace("/");
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.panel}>
          <ThemedText type="title">Flow</ThemedText>
          <ThemedText themeColor="textSecondary">Sign in to continue.</ThemedText>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email"
            style={styles.input}
            value={email}
          />
          <TextInput
            autoComplete="current-password"
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            style={styles.input}
            value={password}
          />
          {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
          <Pressable disabled={isSubmitting} onPress={signIn} style={styles.button}>
            <ThemedText type="smallBold" style={styles.buttonText}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </ThemedText>
          </Pressable>
          <Link href="/sign-up">
            <ThemedText type="linkPrimary">Create an account</ThemedText>
          </Link>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: "center",
    padding: Spacing.four,
  },
  panel: {
    gap: Spacing.three,
  },
  input: {
    borderRadius: Spacing.two,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  button: {
    alignItems: "center",
    borderRadius: Spacing.two,
    backgroundColor: "#208AEF",
    paddingVertical: Spacing.three,
  },
  buttonText: {
    color: "#FFFFFF",
  },
  error: {
    color: "#D92D20",
  },
});
