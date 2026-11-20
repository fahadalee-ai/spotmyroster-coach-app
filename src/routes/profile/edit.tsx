import { createFileRoute } from "@tanstack/react-router";
import { EditProfileScreen } from "@/screens/profile-screens";

export const Route = createFileRoute("/profile/edit")({
  component: EditProfileScreen,
});
