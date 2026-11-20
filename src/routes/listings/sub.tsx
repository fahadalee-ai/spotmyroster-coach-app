import { createFileRoute } from "@tanstack/react-router";
import { SubListingScreen } from "@/screens/listing-screens";

export const Route = createFileRoute("/listings/sub")({
  component: SubListingScreen,
});
