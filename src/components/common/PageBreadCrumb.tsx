"use client";

import { Anchor, Breadcrumbs, Group, Title } from "@mantine/core";
import Link from "next/link";
import React from "react";

interface BreadcrumbProps {
  title: string;
  subTitle?: string;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ title, subTitle }) => {
  return (
    <Group justify="space-between" mb="md">
      <Title order={3}>{title}</Title>
      <Breadcrumbs>
        <Anchor component={Link} href="/" size="sm">
          Home
        </Anchor>
        {subTitle && <span>{subTitle}</span>}
        <span>{title}</span>
      </Breadcrumbs>
    </Group>
  );
};

export default PageBreadcrumb;