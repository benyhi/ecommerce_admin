import { ProductDetailWizard } from "@/modules/productos/ProductDetailWizard";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ProductDetailWizard productId={id} />;
}
