"use client";

import { AppShell, Container } from "@mantine/core";
import React from "react";

import { ProtectedView } from "@/components/auth/ProtectedView";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { mobileOpened, desktopOpened } = useSidebar();

  return (
    <AppShell
      id="admin-shell"
      header={{ height: 60 }}
      navbar={{
        width: 260,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <AppHeader />
      </AppShell.Header>

      <AppShell.Navbar>
        <AppSidebar />
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="xl">
          <ProtectedView>{children}</ProtectedView>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
