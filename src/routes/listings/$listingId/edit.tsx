import { createFileRoute } from "@tanstack/react-router";
import { EditListingScreen } from "@/screens/listing-screens";

export const Route = createFileRoute("/listings/$listingId/edit")({
  component: function Page() {
    const { listingId } = Route.useParams();
    return <EditListingScreen listingId={listingId} />;
  },
});
