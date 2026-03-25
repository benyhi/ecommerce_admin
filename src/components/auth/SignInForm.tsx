"use client";

import {
  Alert,
  Anchor,
  Button,
  Checkbox,
  Divider,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconAlertCircle, IconChevronLeft } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api/types";

export default function SignInForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenant, setTenant] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password, tenant);
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Error de conexión. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack flex={1} maw={420} mx="auto" justify="center" py="xl" w="100%">
      <Anchor component={Link} href="/" size="sm" c="dimmed">
        <Group gap={4}>
          <IconChevronLeft size={16} />
          Back to dashboard
        </Group>
      </Anchor>

      <div>
        <Title order={2} mb={4}>Sign In</Title>
        <Text size="sm" c="dimmed">
          Enter your email and password to sign in!
        </Text>
      </div>

      <Divider />

      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          variant="light"
        >
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Tenant"
            placeholder="mi-tienda"
            value={tenant}
            onChange={(e) => setTenant(e.currentTarget.value)}
            withAsterisk
          />
          <TextInput
            label="Email"
            placeholder="admin@tienda.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            withAsterisk
          />
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            withAsterisk
          />
          <Group justify="space-between">
            <Checkbox
              label="Keep me logged in"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.currentTarget.checked)}
            />
            <Anchor component={Link} href="/reset-password" size="sm">
              Forgot password?
            </Anchor>
          </Group>
          <Button fullWidth type="submit" loading={loading}>
            Sign in
          </Button>
        </Stack>
      </form>

      <Text size="sm" c="dimmed">
        Don&apos;t have an account?{" "}
        <Anchor component={Link} href="/signup">Sign Up</Anchor>
      </Text>
    </Stack>
  );
}