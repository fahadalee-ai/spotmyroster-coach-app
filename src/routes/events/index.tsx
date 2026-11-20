import { createFileRoute } from "@tanstack/react-router";
import { EventsScreen } from "@/screens/event-screens";

export const Route = createFileRoute("/events/")({
  component: EventsScreen,
});
