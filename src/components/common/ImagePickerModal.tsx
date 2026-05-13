"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ActionIcon,
  Box,
  Button,
  FileButton,
  Group,
  Image,
  Loader,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconCheck, IconRefresh, IconSearch, IconUpload } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { httpClient } from "@/lib/api/httpClient";
import { tokenManager } from "@/lib/api/tokenManager";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000";

type R2Image = {
  key: string;
  url: string;
  filename: string;
  size: number;
  last_modified: string;
};

type R2ListResponse = {
  images: R2Image[];
  count: number;
  is_truncated: boolean;
  next_token: string | null;
};

// ── ImagePickerModal ──────────────────────────────────────────────────────────

type ImagePickerModalProps = {
  opened: boolean;
  onClose: () => void;
  onSelect: (image: { key: string; url: string }) => void;
};

export function ImagePickerModal({ opened, onClose, onSelect }: ImagePickerModalProps) {
  const [images, setImages] = useState<R2Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const loadImages = useCallback(
    async (token?: string | null) => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { max_keys: 48 };
        if (token) params.token = token;
        if (search) params.search = search;

        const res = await httpClient.get<R2ListResponse>("/api/admin/cloud/images/", params);
        if (token) {
          setImages((prev) => [...prev, ...res.images]);
        } else {
          setImages(res.images);
        }
        setNextToken(res.next_token ?? null);
        setHasMore(res.is_truncated);
      } catch {
        notifications.show({ color: "red", title: "Error", message: "No se pudieron cargar las imágenes." });
      } finally {
        setLoading(false);
      }
    },
    [search]
  );

  useEffect(() => {
    if (opened) {
      setSelected(null);
      loadImages();
    }
  }, [opened]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("folder", "images");

      const accessToken = tokenManager.getAccessToken();
      const tenant = tokenManager.getTenant();
      const headers: Record<string, string> = {};
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
      if (tenant) headers["X-Tenant"] = tenant;

      const res = await fetch(`${API_BASE}/api/admin/cloud/images/`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as Record<string, string>).error ?? "Error al subir");
      }

      const data = (await res.json()) as { filename: string; url: string; success: boolean };
      notifications.show({ color: "green", title: "Subido", message: "Imagen subida correctamente." });

      if (data.success && data.filename && data.url) {
        onSelect({ key: data.filename, url: data.url });
        onClose();
      } else {
        loadImages();
      }
    } catch (e) {
      notifications.show({
        color: "red",
        title: "Error",
        message: e instanceof Error ? e.message : "Error al subir la imagen.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = () => {
    const img = images.find((i) => i.key === selected);
    if (img) {
      onSelect({ key: img.key, url: img.url });
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Seleccionar imagen"
      size="xl"
      zIndex={3000}
      scrollAreaComponent={undefined}
    >
      <Stack gap="md">
        <Group>
          <TextInput
            leftSection={<IconSearch size={16} />}
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && loadImages()}
            style={{ flex: 1 }}
          />
          <ActionIcon variant="light" onClick={() => loadImages()} loading={loading} size="lg">
            <IconRefresh size={16} />
          </ActionIcon>
          <FileButton onChange={handleUpload} accept="image/*">
            {(props) => (
              <Button {...props} leftSection={<IconUpload size={16} />} variant="light" loading={uploading}>
                Subir imagen
              </Button>
            )}
          </FileButton>
        </Group>

        {loading && images.length === 0 ? (
          <Box ta="center" py="xl">
            <Loader />
          </Box>
        ) : images.length === 0 ? (
          <Text c="dimmed" size="sm" ta="center" py="xl">
            No hay imágenes en el bucket.
          </Text>
        ) : (
          <SimpleGrid cols={4} spacing="xs">
            {images.map((img) => (
              <Box
                key={img.key}
                onClick={() => setSelected(img.key)}
                style={{
                  border: `2px solid ${selected === img.key ? "var(--mantine-color-blue-5)" : "var(--mantine-color-gray-3)"}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  overflow: "hidden",
                  position: "relative",
                  background: "var(--mantine-color-gray-0)",
                }}
              >
                <Image src={img.url} alt={img.filename} h={90} fit="cover" />
                {selected === img.key && (
                  <Box
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      background: "var(--mantine-color-blue-5)",
                      borderRadius: "50%",
                      width: 20,
                      height: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconCheck size={12} color="white" />
                  </Box>
                )}
                <Text size="xs" c="dimmed" px={4} pb={4} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {img.filename}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        )}

        {hasMore && (
          <Button variant="light" onClick={() => loadImages(nextToken)} loading={loading}>
            Cargar más
          </Button>
        )}

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!selected}>
            Seleccionar
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

// ── ImagePickerField ──────────────────────────────────────────────────────────

type ImagePickerFieldProps = {
  label?: string;
  value: string;
  onChange: (url: string, key?: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
};

export function ImagePickerField({
  label,
  value,
  onChange,
  required,
  error,
  placeholder,
}: ImagePickerFieldProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Stack gap={4}>
        {label && (
          <Text size="sm" fw={500}>
            {label}
            {required && (
              <Text component="span" c="red">
                {" *"}
              </Text>
            )}
          </Text>
        )}
        <Group gap="xs" align="flex-start">
          <TextInput
            value={value}
            onChange={(e) => onChange(e.currentTarget.value)}
            placeholder={placeholder ?? "https://..."}
            error={error}
            style={{ flex: 1 }}
          />
          <Button variant="light" onClick={() => setModalOpen(true)} mt={0}>
            Seleccionar
          </Button>
        </Group>
        {value && (
          <Box
            mt={4}
            style={{
              width: 80,
              height: 80,
              border: "1px solid var(--mantine-color-gray-3)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <Image src={value} alt="Preview" h={80} fit="cover" />
          </Box>
        )}
      </Stack>

      <ImagePickerModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={({ key, url }) => onChange(url, key)}
      />
    </>
  );
}
