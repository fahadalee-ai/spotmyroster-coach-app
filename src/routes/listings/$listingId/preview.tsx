import { createFileRoute } from "@tanstack/react-router";
import { ListingPreviewScreen } from "@/screens/listing-screens";

export const Route = createFileRoute("/listings/$listingId/preview")({
  component: function Page() {
    const { listingId } = Route.useParams();
    return <ListingPreviewScreen listingId={listingId} />;
  },
});
