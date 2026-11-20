import { createFileRoute } from "@tanstack/react-router";
import { ListingsScreen } from "@/screens/listing-screens";

export const Route = createFileRoute("/listings/")({
  component: ListingsScreen,
});
