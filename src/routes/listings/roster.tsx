import { createFileRoute } from "@tanstack/react-router";
import { RosterListingScreen } from "@/screens/listing-screens";

export const Route = createFileRoute("/listings/roster")({
  component: RosterListingScreen,
});
