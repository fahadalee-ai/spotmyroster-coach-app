import { createFileRoute } from "@tanstack/react-router";
import { CalendarScreen } from "@/screens/event-screens";

export const Route = createFileRoute("/events/calendar")({
  component: CalendarScreen,
});
