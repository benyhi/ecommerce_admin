"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Button,
  Card,
  Center,
  Group,
  Loader,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconCheck,
  IconCoin,
  IconLanguage,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { httpClient } from "@/lib/api/httpClient";
import { FeatureGate } from "@/components/FeatureGate";

type LocaleSettings = {
  currency: string;
  language: string;
  supported_currencies: string[];
  supported_languages: string[];
};

const CURRENCY_LABELS: Record<string, string> = {
  ARS: "Peso argentino (ARS)",
  USD: "Dólar estadounidense (USD)",
  EUR: "Euro (EUR)",
  BRL: "Real brasileño (BRL)",
  CLP: "Peso chileno (CLP)",
  COP: "Peso colombiano (COP)",
  MXN: "Peso mexicano (MXN)",
  UYU: "Peso uruguayo (UYU)",
  PYG: "Guaraní paraguayo (PYG)",
  BOB: "Boliviano (BOB)",
  PEN: "Sol peruano (PEN)",
};

const LANGUAGE_LABELS: Record<string, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
};

function MonedaIdiomaInner() {
  const [settings, setSettings] = useState<LocaleSettings | null>(null);
  const [currency, setCurrency] = useState<string | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await httpClient.get<LocaleSettings>("/api/admin/tenant/locale/");
      setSettings(data);
      setCurrency(data.currency);
      setLanguage(data.language);
    } catch {
      notifications.show({ color: "red", title: "Error", message: "No se pudo cargar la configuración de moneda e idioma." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await httpClient.patch("/api/admin/tenant/locale/", { currency, language });
      notifications.show({
        color: "green",
        icon: <IconCheck size={16} />,
        title: "Guardado",
        message: "Configuración de moneda e idioma actualizada.",
      });
    } catch {
      notifications.show({ color: "red", title: "Error", message: "No se pudo guardar la configuración." });
    } finally {
      setSaving(false);
    }
  };

  const isDirty = settings && (currency !== settings.currency || language !== settings.language);

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  const currencyOptions = (settings?.supported_currencies ?? []).map((c) => ({
    value: c,
    label: CURRENCY_LABELS[c] ?? c,
  }));

  const languageOptions = (settings?.supported_languages ?? []).map((l) => ({
    value: l,
    label: LANGUAGE_LABELS[l] ?? l,
  }));

  return (
    <Stack gap="lg">
      <Group>
        <IconCoin size={24} />
        <Title order={3}>Moneda e idioma</Title>
      </Group>

      <Card withBorder radius="md" p="lg">
        <Stack gap="md">
          <div>
            <Group gap="xs" mb={4}>
              <IconCoin size={16} />
              <Text fw={600} size="sm">Moneda principal</Text>
            </Group>
            <Text size="xs" c="dimmed" mb="sm">
              Moneda utilizada para mostrar precios en el storefront y en los reportes.
            </Text>
            <Select
              data={currencyOptions}
              value={currency}
              onChange={setCurrency}
              placeholder="Seleccionar moneda"
              w={300}
            />
          </div>

          <div>
            <Group gap="xs" mb={4}>
              <IconLanguage size={16} />
              <Text fw={600} size="sm">Idioma de la tienda</Text>
            </Group>
            <Text size="xs" c="dimmed" mb="sm">
              Idioma predeterminado para los textos del storefront y los emails enviados a los clientes.
            </Text>
            <Select
              data={languageOptions}
              value={language}
              onChange={setLanguage}
              placeholder="Seleccionar idioma"
              w={300}
            />
          </div>
        </Stack>
      </Card>

      <Group justify="flex-end">
        <Button
          leftSection={<IconCheck size={16} />}
          loading={saving}
          disabled={!isDirty}
          onClick={handleSave}
        >
          Guardar configuración
        </Button>
      </Group>
    </Stack>
  );
}

export default function MonedaIdiomaContent() {
  return (
    <FeatureGate
      featureKey="multi_currency"
      featureName="Moneda e idioma"
      requiredPlan="Business"
    >
      <MonedaIdiomaInner />
    </FeatureGate>
  );
}
