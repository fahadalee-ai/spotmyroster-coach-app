import { createFileRoute } from "@tanstack/react-router";
import { BoostListingScreen } from "@/screens/listing-screens";

export const Route = createFileRoute("/listings/$listingId/boost")({
  component: function Page() {
    const { listingId } = Route.useParams();
    return <BoostListingScreen listingId={listingId} />;
  },
});
