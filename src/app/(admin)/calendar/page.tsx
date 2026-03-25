import { Stack } from "@mantine/core";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Calendar from "@/components/calendar/Calendar";

export const metadata = {
  title: "Calendario",
};

export default function CalendarPage() {
  return (
    <Stack gap="lg">
      <PageBreadcrumb title="Calendario" subTitle="Agenda" />
      <Calendar />
    </Stack>
  );
}
