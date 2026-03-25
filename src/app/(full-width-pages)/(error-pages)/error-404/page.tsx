import { Button, Center, Container, Stack, Text, Title } from "@mantine/core";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Error 404",
  description: "Page not found",
};

export default function Error404() {
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

          <Link href="/">
            <Button variant="default" size="lg">
              Back to Home Page
            </Button>
          </Link>
        </Stack>
      </Container>
    </Center>
  );
}