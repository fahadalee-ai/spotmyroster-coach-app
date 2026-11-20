import { createFileRoute } from "@tanstack/react-router";
import { AboutScreen } from "@/screens/profile-screens";

export const Route = createFileRoute("/profile/about")({
  component: AboutScreen,
});
