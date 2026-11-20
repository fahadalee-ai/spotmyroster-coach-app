import { createFileRoute } from "@tanstack/react-router";
import { CoachMenuScreen } from "@/screens/billing-screens";

export const Route = createFileRoute("/coach")({
  component: CoachMenuScreen,
});
