import { createFileRoute } from "@tanstack/react-router";
import { PostOpportunityScreen } from "@/screens/listing-screens";

export const Route = createFileRoute("/listings/post")({
  component: PostOpportunityScreen,
});
