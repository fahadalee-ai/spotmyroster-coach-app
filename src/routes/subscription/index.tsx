import { createFileRoute } from "@tanstack/react-router";
import { SubscriptionScreen } from "@/screens/billing-screens";

export const Route = createFileRoute("/subscription/")({
  component: SubscriptionScreen,
});
