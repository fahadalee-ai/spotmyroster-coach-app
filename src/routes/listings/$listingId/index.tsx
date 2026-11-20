import { createFileRoute } from "@tanstack/react-router";
import { ListingDetailScreen } from "@/screens/listing-screens";

export const Route = createFileRoute("/listings/$listingId/")({
  component: function Page() {
    const { listingId } = Route.useParams();
    return <ListingDetailScreen listingId={listingId} />;
  },
});
