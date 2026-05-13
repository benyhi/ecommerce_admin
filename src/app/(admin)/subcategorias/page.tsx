import { redirect } from "next/navigation";

export const metadata = {
  title: "Subcategorias",
};

export default function SubcategoriasPage() {
  redirect("/categorias");
}
