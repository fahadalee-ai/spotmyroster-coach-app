import { createFileRoute } from "@tanstack/react-router";
import { EventFormScreen } from "@/screens/event-screens";

export const Route = createFileRoute("/events/new")({
  component: EventFormScreen,
});
