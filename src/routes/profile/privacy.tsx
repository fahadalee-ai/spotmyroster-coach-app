import { createFileRoute } from "@tanstack/react-router";
import { PrivacyScreen } from "@/screens/profile-screens";

export const Route = createFileRoute("/profile/privacy")({
  component: PrivacyScreen,
});
