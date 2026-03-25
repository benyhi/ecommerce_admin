import { ColorSchemeScript } from "@mantine/core";
import { Outfit } from "next/font/google";
import "./globals.css";

import { AppProviders } from "@/providers/AppProviders";

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body className={outfit.className}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
