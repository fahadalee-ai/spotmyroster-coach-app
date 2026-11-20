import { createFileRoute } from "@tanstack/react-router";
import { ProfileScreen } from "@/screens/profile-screens";

export const Route = createFileRoute("/profile/")({
  component: ProfileScreen,
});
