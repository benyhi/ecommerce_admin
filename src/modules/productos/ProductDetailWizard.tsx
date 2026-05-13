"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  LoadingOverlay,
  NumberInput,
  Paper,
  Select,
  Stack,
  Stepper,
  Switch,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBolt,
  IconCheck,
  IconDeviceFloppy,
  IconEye,
  IconInfoCircle,
  IconListDetails,
  IconPackage,
  IconPlus,
  IconShield,
  IconShieldCheck,
  IconStar,
  IconTrash,
  IconTruck,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { httpClient } from "@/lib/api/httpClient";
import type { Category, Subcategory, ProductAttribute, ProductBadge } from "@/lib/api/types";

// ─── Local types ──────────────────────────────────────────────────────────────

type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: string;
  active: boolean;
  order: number;
  image_url: string | null;
  category_detail?: { id: string; name: string; order: number } | null;
  subcategory_detail?: { id: string; name: string; order: number; category?: { id: string; name: string; order: number } } | null;
};

// ─── Icon helpers ─────────────────────────────────────────────────────────────

const ICON_OPTIONS = [
  { value: "truck",  label: "🚚 Envío"      },
  { value: "shield", label: "🛡️ Garantía"   },
  { value: "box",    label: "📦 Paquete"     },
  { value: "check",  label: "✅ Verificado"  },
  { value: "star",   label: "⭐ Destacado"   },
  { value: "zap",    label: "⚡ Rápido"      },
];

function BadgeIcon({ icon, size = 18 }: { icon: string; size?: number }) {
  switch (icon) {
    case "truck":  return <IconTruck  size={size} />;
    case "shield": return <IconShield size={size} />;
    case "box":    return <IconPackage size={size} />;
    case "star":   return <IconStar   size={size} />;
    case "zap":    return <IconBolt   size={size} />;
    default:       return <IconCheck  size={size} />;
  }
}

// ─── Live Preview ─────────────────────────────────────────────────────────────

interface PreviewProps {
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  categoryName: string;
  attributes: ProductAttribute[];
  badges: ProductBadge[];
}

function ProductPagePreview({ name, description, price, imageUrl, categoryName, attributes, badges }: PreviewProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(n);

  const activeBadges = badges.filter((b) => b.active);

  return (
    <Paper withBorder radius="lg" p={0} style={{ overflow: "hidden" }}>
      <Box px="md" py="xs" style={{ background: "var(--mantine-color-gray-0)", borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
        <Group gap="xs">
          <IconEye size={14} color="var(--mantine-color-dimmed)" />
          <Text size="xs" c="dimmed" fw={500}>Vista previa del producto</Text>
        </Group>
      </Box>

      <Box p="md">
        {/* Image */}
        <Card withBorder radius="md" p={0} mb="md" style={{ overflow: "hidden", height: 180, background: "var(--mantine-color-gray-1)" }}>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Stack h="100%" align="center" justify="center" gap={6}>
              <IconPackage size={32} color="var(--mantine-color-gray-5)" />
              <Text size="xs" c="dimmed">Sin imagen</Text>
            </Stack>
          )}
        </Card>

        {/* Category / name / price */}
        <Stack gap={4} mb="sm">
          <Text size="xs" c="dimmed" fw={500}>{categoryName || "Sin categoría"}</Text>
          <Text fw={700} size="lg" lh={1.2}>{name || "Nombre del producto"}</Text>
          <Text fw={800} size="xl" c="blue">{fmt(price || 0)}</Text>
        </Stack>

        {/* Trust badges */}
        {activeBadges.length > 0 && (
          <Grid gutter="xs" mb="sm">
            {activeBadges.map((b) => (
              <Grid.Col key={b.id} span={activeBadges.length === 1 ? 12 : 6}>
                <Paper withBorder radius="md" p="xs" style={{ height: "100%" }}>
                  <Group gap="xs" align="flex-start" wrap="nowrap">
                    <ThemeIcon variant="light" color="blue" size="sm" style={{ flexShrink: 0, marginTop: 1 }}>
                      <BadgeIcon icon={b.icon} size={12} />
                    </ThemeIcon>
                    <Box>
                      <Text fw={700} size="xs" lh={1.2}>{b.title}</Text>
                      <Text size="xs" c="dimmed" lh={1.2}>{b.description}</Text>
                    </Box>
                  </Group>
                </Paper>
              </Grid.Col>
            ))}
          </Grid>
        )}

        {/* Description */}
        {description && (
          <>
            <Divider mb="sm" />
            <Text size="sm" c="dimmed" mb="sm" lineClamp={4}>{description}</Text>
          </>
        )}

        {/* Attributes */}
        {attributes.length > 0 && (
          <>
            <Divider label="Características" labelPosition="left" mb="xs" />
            <Stack gap={4}>
              {[...attributes].sort((a, b) => a.order - b.order).map((attr) => (
                <Group key={attr.id} justify="space-between" gap="xs" px="xs" py={2}
                  style={{ background: "var(--mantine-color-gray-0)", borderRadius: 4 }}>
                  <Text size="xs" c="dimmed">{attr.name}</Text>
                  <Text size="xs" fw={600}>{attr.value}</Text>
                </Group>
              ))}
            </Stack>
          </>
        )}

        {/* Placeholder buttons */}
        <Stack gap="xs" mt="md">
          <Box h={32} style={{ background: "var(--mantine-color-blue-6)", borderRadius: 8, opacity: 0.2 }} />
          <Box h={32} style={{ background: "var(--mantine-color-blue-2)", borderRadius: 8, opacity: 0.5 }} />
        </Stack>
      </Box>
    </Paper>
  );
}

// ─── Step 0 — Información base ────────────────────────────────────────────────

interface Step0Props {
  categories: Category[];
  subcategories: Subcategory[];
  name: string;       setName: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  price: number;      setPrice: (v: number) => void;
  categoryId: string | null; setCategoryId: (v: string | null) => void;
  subcategoryId: string | null; setSubcategoryId: (v: string | null) => void;
}

function Step0Info({ categories, subcategories, name, setName, description, setDescription, price, setPrice, categoryId, setCategoryId, subcategoryId, setSubcategoryId }: Step0Props) {
  const subcategoryOptions = subcategories
    .filter((s) => !categoryId || (typeof s.category === "string" ? s.category : s.category.id) === categoryId)
    .map((s) => ({ value: s.id as unknown as string, label: s.name }));

  return (
    <Stack gap="lg">
      <Box>
        <Text size="sm" fw={600} mb={4}>Nombre del producto</Text>
        <TextInput
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Ej: MacBook Pro 14 pulgadas"
          size="md"
        />
      </Box>
      <Box>
        <Text size="sm" fw={600} mb={4}>Descripción</Text>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          placeholder="Describí el producto: materiales, usos, beneficios clave..."
          autosize
          minRows={4}
          maxRows={8}
          size="md"
        />
      </Box>
      <Grid>
        <Grid.Col span={6}>
          <Text size="sm" fw={600} mb={4}>Precio</Text>
          <NumberInput
            value={price}
            onChange={(v) => setPrice(Number(v ?? 0))}
            thousandSeparator="."
            decimalSeparator=","
            prefix="$ "
            size="md"
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Text size="sm" fw={600} mb={4}>Categoría</Text>
          <Select
            data={categories.map((c) => ({ value: c.id as unknown as string, label: c.name }))}
            value={categoryId}
            onChange={(value) => {
              setCategoryId(value);
              if (!value) {
                setSubcategoryId(null);
                return;
              }
              const selected = subcategories.find((s) => s.id === subcategoryId);
              const selectedCategory = selected
                ? typeof selected.category === "string" ? selected.category : selected.category.id
                : null;
              if (selectedCategory !== value) setSubcategoryId(null);
            }}
            clearable
            searchable
            placeholder="Sin categoría"
            size="md"
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Text size="sm" fw={600} mb={4}>Subcategoría</Text>
          <Select
            data={subcategoryOptions}
            value={subcategoryId}
            onChange={setSubcategoryId}
            clearable
            searchable
            disabled={!categoryId}
            placeholder={categoryId ? "Sin subcategoría" : "Seleccioná una categoría"}
            size="md"
          />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

// ─── Step 1 — Características ─────────────────────────────────────────────────

interface Step1Props {
  productId: string;
  attributes: ProductAttribute[];
  setAttributes: React.Dispatch<React.SetStateAction<ProductAttribute[]>>;
}

function Step1Attributes({ productId, attributes, setAttributes }: Step1Props) {
  const addAttribute = async () => {
    try {
      const res = await httpClient.post<ProductAttribute>("/api/admin/catalog/attributes/", {
        product: productId,
        name: "Característica",
        value: "Valor",
        order: attributes.length,
      });
      setAttributes((prev) => [...prev, res]);
    } catch {
      notifications.show({ color: "red", title: "Error", message: "No se pudo agregar la característica." });
    }
  };

  const deleteAttr = async (id: string) => {
    try {
      await httpClient.delete(`/api/admin/catalog/attributes/${id}/`);
      setAttributes((prev) => prev.filter((a) => a.id !== id));
    } catch {
      notifications.show({ color: "red", title: "Error", message: "No se pudo eliminar." });
    }
  };

  const updateLocal = (id: string, patch: Partial<ProductAttribute>) =>
    setAttributes((prev) => prev.map((a) => a.id === id ? { ...a, ...patch } : a));

  return (
    <Stack gap="md">
      <Text c="dimmed" size="sm">
        Agregá las especificaciones técnicas del producto. Aparecerán como tabla en la página de detalle. Los cambios se guardan con el botón de abajo.
      </Text>

      {attributes.length === 0 ? (
        <Paper withBorder radius="md" p="xl" ta="center">
          <IconListDetails size={32} color="var(--mantine-color-gray-5)" />
          <Text c="dimmed" size="sm" mt="xs">Sin características todavía.</Text>
          <Text c="dimmed" size="xs">Ej: RAM → 16 GB, Pantalla → 15.6 pulgadas</Text>
        </Paper>
      ) : (
        <Stack gap="xs">
          <Group gap="xs" px={4}>
            <Text size="xs" c="dimmed" fw={600} style={{ flex: 1 }}>Nombre</Text>
            <Text size="xs" c="dimmed" fw={600} style={{ flex: 1 }}>Valor</Text>
            <Box w={28} />
          </Group>
          {attributes.map((attr) => (
            <Group key={attr.id} gap="xs" align="center">
              <TextInput
                value={attr.name}
                onChange={(e) => updateLocal(attr.id, { name: e.currentTarget.value })}
                placeholder="Ej: RAM"
                style={{ flex: 1 }}
                size="sm"
              />
              <TextInput
                value={attr.value}
                onChange={(e) => updateLocal(attr.id, { value: e.currentTarget.value })}
                placeholder="Ej: 16 GB"
                style={{ flex: 1 }}
                size="sm"
              />
              <ActionIcon color="red" variant="subtle" onClick={() => deleteAttr(attr.id)}>
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>
      )}

      <Button
        variant="light"
        leftSection={<IconPlus size={14} />}
        onClick={addAttribute}
        size="sm"
        w="fit-content"
      >
        Agregar característica
      </Button>
    </Stack>
  );
}

// ─── Step 2 — Badges ──────────────────────────────────────────────────────────

interface Step2Props {
  badges: ProductBadge[];
  setBadges: React.Dispatch<React.SetStateAction<ProductBadge[]>>;
}

function Step2Badges({ badges, setBadges }: Step2Props) {
  const addBadge = async () => {
    try {
      const res = await httpClient.post<ProductBadge>("/api/admin/catalog/badges/", {
        title: "Nuevo badge",
        description: "",
        icon: "check",
        active: true,
        order: badges.length,
      });
      setBadges((prev) => [...prev, res]);
    } catch {
      notifications.show({ color: "red", title: "Error", message: "No se pudo crear el badge." });
    }
  };

  const deleteBadge = async (id: string) => {
    try {
      await httpClient.delete(`/api/admin/catalog/badges/${id}/`);
      setBadges((prev) => prev.filter((b) => b.id !== id));
    } catch {
      notifications.show({ color: "red", title: "Error", message: "No se pudo eliminar." });
    }
  };

  const updateLocal = (id: string, patch: Partial<ProductBadge>) =>
    setBadges((prev) => prev.map((b) => b.id === id ? { ...b, ...patch } : b));

  return (
    <Stack gap="md">
      <Text c="dimmed" size="sm">
        Los badges son tarjetas de confianza visibles en todos los productos de la tienda. Los cambios se guardan con el botón de abajo.
      </Text>

      {badges.length === 0 ? (
        <Paper withBorder radius="md" p="xl" ta="center">
          <IconShieldCheck size={32} color="var(--mantine-color-gray-5)" />
          <Text c="dimmed" size="sm" mt="xs">Sin badges todavía.</Text>
          <Text c="dimmed" size="xs">Ej: "Llega rápido", "Garantía oficial"</Text>
        </Paper>
      ) : (
        <Stack gap="sm">
          {badges.map((badge) => (
            <Paper key={badge.id} withBorder radius="md" p="sm"
              style={{ opacity: badge.active ? 1 : 0.5, transition: "opacity .15s" }}>
              <Group gap="sm" align="flex-start" wrap="nowrap">
                <ThemeIcon variant="light" color="blue" size="lg" style={{ flexShrink: 0, marginTop: 2 }}>
                  <BadgeIcon icon={badge.icon} size={16} />
                </ThemeIcon>
                <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
                  <Group gap="xs" wrap="nowrap">
                    <Select
                      data={ICON_OPTIONS}
                      value={badge.icon}
                      onChange={(v) => v && updateLocal(badge.id, { icon: v as ProductBadge["icon"] })}
                      size="xs"
                      w={130}
                    />
                    <TextInput
                      value={badge.title}
                      onChange={(e) => updateLocal(badge.id, { title: e.currentTarget.value })}
                      placeholder="Título (ej: Llega rápido)"
                      size="xs"
                      style={{ flex: 1 }}
                      fw={600}
                    />
                  </Group>
                  <TextInput
                    value={badge.description}
                    onChange={(e) => updateLocal(badge.id, { description: e.currentTarget.value })}
                    placeholder="Descripción (ej: Envío a todo el país en 48 hs)"
                    size="xs"
                  />
                </Stack>
                <Stack gap="xs" align="center" style={{ flexShrink: 0 }}>
                  <Switch
                    size="sm"
                    checked={badge.active}
                    onChange={(e) => updateLocal(badge.id, { active: e.currentTarget.checked })}
                  />
                  <ActionIcon color="red" variant="subtle" size="sm" onClick={() => deleteBadge(badge.id)}>
                    <IconTrash size={14} />
                  </ActionIcon>
                </Stack>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}

      <Button
        variant="light"
        leftSection={<IconPlus size={14} />}
        onClick={addBadge}
        size="sm"
        w="fit-content"
      >
        Agregar badge
      </Button>
    </Stack>
  );
}

// ─── Step 3 — Finalizar ───────────────────────────────────────────────────────

function Step3Finish({ productName, attributeCount, badgeCount }: { productName: string; attributeCount: number; badgeCount: number }) {
  return (
    <Stack gap="lg" align="center" py="xl">
      <ThemeIcon size={64} radius="xl" color="green" variant="light">
        <IconCheck size={32} />
      </ThemeIcon>
      <Stack gap={4} ta="center">
        <Title order={3}>¡Vista configurada!</Title>
        <Text c="dimmed" size="sm" maw={380} ta="center">
          La página de detalle de <b>{productName}</b> muestra{" "}
          {attributeCount > 0 ? `${attributeCount} característica${attributeCount !== 1 ? "s" : ""}` : "sin características"}{" "}
          y {badgeCount > 0 ? `${badgeCount} badge${badgeCount !== 1 ? "s" : ""} activo${badgeCount !== 1 ? "s" : ""}` : "sin badges activos"}.
        </Text>
      </Stack>
      <Button component={Link} href="/productos" variant="light" leftSection={<IconArrowLeft size={16} />}>
        Volver a productos
      </Button>
    </Stack>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export function ProductDetailWizard({ productId }: { productId: string }) {
  const [step, setStep] = useState(0);
  const [product, setProduct] = useState<ProductRow | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Step 0 fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<string | null>(null);

  // Step 1
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);

  // Step 2
  const [badges, setBadges] = useState<ProductBadge[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prod, attrsRes, badgesRes, catsRes, subcatsRes] = await Promise.all([
        httpClient.get<ProductRow>(`/api/admin/catalog/products/${productId}/`),
        httpClient.get<ProductAttribute[] | { results: ProductAttribute[] }>(`/api/admin/catalog/attributes/`, { product: productId }),
        httpClient.get<ProductBadge[] | { results: ProductBadge[] }>(`/api/admin/catalog/badges/`),
        httpClient.get<Category[] | { results: Category[] }>(`/api/admin/catalog/categories/`),
        httpClient.get<Subcategory[] | { results: Subcategory[] }>(`/api/admin/catalog/subcategories/`),
      ]);
      setProduct(prod);
      setName(prod.name);
      setDescription(prod.description ?? "");
      setPrice(Number(prod.price));
      setCategoryId(prod.category_detail?.id ?? null);
      setSubcategoryId(prod.subcategory_detail?.id ?? null);
      setAttributes(Array.isArray(attrsRes) ? attrsRes : attrsRes.results ?? []);
      setBadges(Array.isArray(badgesRes) ? badgesRes : badgesRes.results ?? []);
      setCategories(Array.isArray(catsRes) ? catsRes : catsRes.results ?? []);
      setSubcategories(Array.isArray(subcatsRes) ? subcatsRes : subcatsRes.results ?? []);
    } catch {
      notifications.show({ color: "red", title: "Error", message: "No se pudo cargar el producto." });
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Unified save per step ──────────────────────────────────────────────────

  const handleSave = async () => {
    if (!product) return;
    setSaving(true);
    try {
      if (step === 0) {
        const updated = await httpClient.put<ProductRow>(`/api/admin/catalog/products/${product.id}/`, {
          name, description, price, category: categoryId, subcategory: subcategoryId,
          active: product.active, order: product.order,
        });
        setProduct((prev) => prev ? { ...prev, name: updated.name, description: updated.description, price: updated.price } : prev);
        notifications.show({ color: "green", title: "Guardado", message: "Información del producto actualizada." });
      } else if (step === 1) {
        await Promise.all(
          attributes.map((a) =>
            httpClient.patch(`/api/admin/catalog/attributes/${a.id}/`, { name: a.name, value: a.value, order: a.order })
          )
        );
        notifications.show({ color: "green", title: "Guardado", message: `${attributes.length} característica${attributes.length !== 1 ? "s" : ""} guardada${attributes.length !== 1 ? "s" : ""}.` });
      } else if (step === 2) {
        await Promise.all(
          badges.map((b) =>
            httpClient.patch(`/api/admin/catalog/badges/${b.id}/`, { title: b.title, description: b.description, icon: b.icon, active: b.active, order: b.order })
          )
        );
        notifications.show({ color: "green", title: "Guardado", message: `${badges.length} badge${badges.length !== 1 ? "s" : ""} guardado${badges.length !== 1 ? "s" : ""}.` });
      }
    } catch {
      notifications.show({ color: "red", title: "Error", message: "No se pudo guardar. Revisá los datos e intentá de nuevo." });
    } finally {
      setSaving(false);
    }
  };

  const currentCategory = categories.find((c) => c.id === categoryId) ?? product?.category_detail ?? null;

  const STEPS = [
    { label: "Información",     description: "Nombre y precio",       icon: <IconInfoCircle size={16} /> },
    { label: "Características", description: "Ficha técnica",         icon: <IconListDetails size={16} /> },
    { label: "Badges",          description: "Tarjetas de confianza", icon: <IconShieldCheck size={16} /> },
    { label: "Finalizar",       description: "Vista completa",        icon: <IconEye size={16} /> },
  ];

  return (
    <Box pos="relative" mih={500}>
      <LoadingOverlay visible={loading} />

      {/* Header */}
      <Group mb="xl" gap="sm">
        <Button component={Link} href="/productos" variant="subtle" leftSection={<IconArrowLeft size={16} />} size="sm">
          Volver a productos
        </Button>
        {product && (
          <>
            <Text c="dimmed">/</Text>
            <Text fw={600}>{product.name}</Text>
            <Badge variant="light" color="blue">Vista del producto</Badge>
          </>
        )}
      </Group>

      {/* Stepper */}
      <Stepper active={step} onStepClick={setStep} mb="xl" size="sm">
        {STEPS.map((s, i) => (
          <Stepper.Step key={i} label={s.label} description={s.description} icon={s.icon} />
        ))}
      </Stepper>

      {product && (
        <Grid gutter="xl" align="flex-start">
          {/* ── Form column ── */}
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Paper withBorder radius="lg" p="xl">
              <Title order={4} mb="xs">{STEPS[step].label}</Title>
              <Text c="dimmed" size="sm" mb="lg">{STEPS[step].description}</Text>
              <Divider mb="lg" />

              {step === 0 && (
                <Step0Info
                  categories={categories}
                  subcategories={subcategories}
                  name={name}           setName={setName}
                  description={description} setDescription={setDescription}
                  price={price}         setPrice={setPrice}
                  categoryId={categoryId}   setCategoryId={setCategoryId}
                  subcategoryId={subcategoryId} setSubcategoryId={setSubcategoryId}
                />
              )}
              {step === 1 && (
                <Step1Attributes productId={productId} attributes={attributes} setAttributes={setAttributes} />
              )}
              {step === 2 && (
                <Step2Badges badges={badges} setBadges={setBadges} />
              )}
              {step === 3 && (
                <Step3Finish
                  productName={name}
                  attributeCount={attributes.length}
                  badgeCount={badges.filter((b) => b.active).length}
                />
              )}

              {/* ── Navigation + persistent save button ── */}
              {step < 3 && (
                <Group justify="space-between" mt="xl" pt="md" style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}>
                  <div>
                    {step > 0 && (
                      <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => setStep((s) => s - 1)}>
                        Anterior
                      </Button>
                    )}
                  </div>
                  <Group gap="sm">
                    <Button
                      variant="light"
                      color="green"
                      leftSection={<IconDeviceFloppy size={16} />}
                      onClick={handleSave}
                      loading={saving}
                    >
                      Guardar cambios
                    </Button>
                    <Button
                      rightSection={<IconArrowRight size={16} />}
                      onClick={() => setStep((s) => s + 1)}
                    >
                      {step === 2 ? "Ver resultado" : "Siguiente"}
                    </Button>
                  </Group>
                </Group>
              )}
            </Paper>
          </Grid.Col>

          {/* ── Preview column ── */}
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Box style={{ position: "sticky", top: "1rem" }}>
              <ProductPagePreview
                name={name}
                description={description}
                price={price}
                imageUrl={product.image_url}
                categoryName={currentCategory?.name ?? ""}
                attributes={attributes}
                badges={badges}
              />
            </Box>
          </Grid.Col>
        </Grid>
      )}
    </Box>
  );
}
