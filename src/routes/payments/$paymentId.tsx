import { createFileRoute } from "@tanstack/react-router";
import { ReceiptScreen } from "@/screens/billing-screens";

export const Route = createFileRoute("/payments/$paymentId")({
  component: function Page() {
    const { paymentId } = Route.useParams();
    return <ReceiptScreen paymentId={paymentId} />;
  },
});
