"use client";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";

import { createTheme, MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import React from "react";

import { AuthProvider } from "@/context/AuthContext";
import { SidebarProvider } from "@/context/SidebarContext";

const theme = createTheme({
  primaryColor: "blue",
  fontFamily: "Outfit, sans-serif",
  defaultRadius: "md",
});

export function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <ModalsProvider>
          <Notifications position="top-right" limit={3} />
          <SidebarProvider>{children}</SidebarProvider>
        </ModalsProvider>
      </MantineProvider>
    </AuthProvider>
  );
}
