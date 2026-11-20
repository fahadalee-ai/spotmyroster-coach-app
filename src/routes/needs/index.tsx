import { createFileRoute } from "@tanstack/react-router";
import { NeedsScreen } from "@/screens/need-screens";

export const Route = createFileRoute("/needs/")({
  component: NeedsScreen,
});
