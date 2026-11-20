import { createFileRoute } from "@tanstack/react-router";
import { ManageSubscriptionScreen } from "@/screens/billing-screens";

export const Route = createFileRoute("/subscription/manage")({
  component: ManageSubscriptionScreen,
});
