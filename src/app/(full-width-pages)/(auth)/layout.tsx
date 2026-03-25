"use client";

import { Center, Grid, Stack, Text } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Grid gutter={0} mih="100vh">
      <Grid.Col span={{ base: 12, lg: 6 }} p="md">
        {children}
      </Grid.Col>

      <Grid.Col span={6} visibleFrom="lg">
        <Center h="100%" bg="blue.9">
          <Stack align="center" maw={320}>
            <Link href="/">
              <Image
                width={231}
                height={48}
                src="/images/logo/auth-logo.svg"
                alt="Logo"
              />
            </Link>
            <Text ta="center" c="gray.4">
              Admin Dashboard
            </Text>
          </Stack>
        </Center>
      </Grid.Col>
    </Grid>
  );
}