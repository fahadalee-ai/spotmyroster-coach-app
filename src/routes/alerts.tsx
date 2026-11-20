import { createFileRoute } from "@tanstack/react-router";
import { AlertsScreen } from "@/screens/billing-screens";

export const Route = createFileRoute("/alerts")({
  component: AlertsScreen,
});
