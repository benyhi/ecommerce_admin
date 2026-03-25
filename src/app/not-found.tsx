"use client";

import { Button, Center, Container, Stack, Text, Title } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <Center mih="100vh" p="xl">
      <Container size="xs">
        <Stack align="center" gap="lg">
          <Title order={1}>ERROR</Title>

          <Image
            src="/images/error/404.svg"
            alt="404"
            width={472}
            height={152}
          />

          <Text size="lg" ta="center" c="dimmed">
            We can&apos;t seem to find the page you are looking for!
          </Text>

          <Button component={Link} href="/" variant="default" size="lg">
            Back to Home Page
          </Button>
        </Stack>
      </Container>
    </Center>
  );
}