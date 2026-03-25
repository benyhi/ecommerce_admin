"use client";

import {
  Anchor,
  Button,
  Checkbox,
  Divider,
  Group,
  PasswordInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconBrandGoogle, IconBrandX, IconChevronLeft } from "@tabler/icons-react";
import Link from "next/link";
import React, { useState } from "react";

export default function SignUpForm() {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <Stack flex={1} maw={420} mx="auto" justify="center" py="xl" w="100%">
      <Anchor component={Link} href="/" size="sm" c="dimmed">
        <Group gap={4}>
          <IconChevronLeft size={16} />
          Back to dashboard
        </Group>
      </Anchor>

      <div>
        <Title order={2} mb={4}>Sign Up</Title>
        <Text size="sm" c="dimmed">
          Enter your email and password to sign up!
        </Text>
      </div>

      <Group grow>
        <Button variant="default" leftSection={<IconBrandGoogle size={18} />}>
          Google
        </Button>
        <Button variant="default" leftSection={<IconBrandX size={18} />}>
          X
        </Button>
      </Group>

      <Divider label="Or" labelPosition="center" />

      <form>
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput label="First Name" placeholder="Enter your first name" withAsterisk />
            <TextInput label="Last Name" placeholder="Enter your last name" withAsterisk />
          </SimpleGrid>

          <TextInput
            label="Email"
            placeholder="Enter your email"
            type="email"
            withAsterisk
          />
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            withAsterisk
          />
          <Checkbox
            checked={isChecked}
            onChange={(e) => setIsChecked(e.currentTarget.checked)}
            label={
              <Text size="sm" c="dimmed">
                By creating an account means you agree to the{" "}
                <Text span fw={500}>Terms and Conditions</Text> and our{" "}
                <Text span fw={500}>Privacy Policy</Text>
              </Text>
            }
          />
          <Button fullWidth type="submit">
            Sign Up
          </Button>
        </Stack>
      </form>

      <Text size="sm" c="dimmed">
        Already have an account?{" "}
        <Anchor component={Link} href="/signin">Sign In</Anchor>
      </Text>
    </Stack>
  );
}