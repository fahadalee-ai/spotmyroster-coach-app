import { createFileRoute } from "@tanstack/react-router";
import { PaymentsScreen } from "@/screens/billing-screens";

export const Route = createFileRoute("/payments/")({
  component: PaymentsScreen,
});
