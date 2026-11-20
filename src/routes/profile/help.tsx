import { createFileRoute } from "@tanstack/react-router";
import { HelpScreen } from "@/screens/profile-screens";

export const Route = createFileRoute("/profile/help")({
  component: HelpScreen,
});
