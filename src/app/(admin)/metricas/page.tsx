import { Metadata } from "next";

import { MetricasContent } from "@/modules/metricas/MetricasContent";

export const metadata: Metadata = {
  title: "Metricas",
};

export default function MetricasPage() {
  return <MetricasContent />;
}
