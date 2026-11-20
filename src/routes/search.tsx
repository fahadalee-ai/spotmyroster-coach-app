import { createFileRoute } from "@tanstack/react-router";
import { SearchScreen } from "@/screens/inbox-screens";

export const Route = createFileRoute("/search")({
  component: SearchScreen,
});
