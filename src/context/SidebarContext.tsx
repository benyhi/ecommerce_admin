"use client";
import React, { createContext, useContext } from "react";
import { useDisclosure } from "@mantine/hooks";

type SidebarContextType = {
  mobileOpened: boolean;
  desktopOpened: boolean;
  toggleMobile: () => void;
  toggleDesktop: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false);
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  return (
    <SidebarContext.Provider
      value={{ mobileOpened, desktopOpened, toggleMobile, toggleDesktop }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
