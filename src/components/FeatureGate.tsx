"use client";

import { Alert, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";

import { useAuth } from "@/context/AuthContext";

interface Props {
  featureKey: string;
  featureName: string;
  requiredPlan?: string;
  children: React.ReactNode;
}

export function FeatureGate({
  featureKey,
  featureName,
  requiredPlan = "Business",
  children,
}: Props) {
  const { hasFeature } = useAuth();

  if (!hasFeature(featureKey)) {
    return (
      <Stack gap="lg" align="center" py="xl">
        <ThemeIcon size={64} radius="xl" color="gray" variant="light">
          <IconLock size={32} />
        </ThemeIcon>
        <div style={{ textAlign: "center" }}>
          <Title order={4} c="dimmed">
            {featureName} no disponible
          </Title>
          <Text size="sm" c="dimmed" mt={4}>
            Esta funcionalidad está disponible a partir del plan {requiredPlan}.
          </Text>
        </div>
        <Alert color="violet" variant="light" icon={<IconLock size={16} />}>
          Actualizá tu plan en{" "}
          <strong>Configuración → Plan</strong> para acceder.
        </Alert>
      </Stack>
    );
  }

  return <>{children}</>;
}
