import { createFileRoute } from "@tanstack/react-router";
import { BlockedScreen } from "@/screens/profile-screens";

export const Route = createFileRoute("/profile/blocked")({
  component: BlockedScreen,
});
