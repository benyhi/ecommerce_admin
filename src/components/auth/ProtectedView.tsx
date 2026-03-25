"use client";

import { Button, Stack, Text, Title } from "@mantine/core";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export function ProtectedView({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Stack gap="sm" align="flex-start" p="md">
        <Title order={3}>Sesión requerida</Title>
        <Text c="dimmed">
          Inicia sesión para continuar.
        </Text>
        <Button onClick={() => router.push("/signin")}>
          Ir a inicio de sesión
        </Button>
      </Stack>
    );
  }

  return <>{children}</>;
}
