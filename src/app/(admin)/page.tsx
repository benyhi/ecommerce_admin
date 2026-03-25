import { redirect } from "next/navigation";

export const metadata = {
  title: "Administración",
  description: "Panel principal",
};

export default function AdminHome() {
  redirect("/metricas");
}
