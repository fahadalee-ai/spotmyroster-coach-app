import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPolicyScreen } from "@/screens/profile-screens";

export const Route = createFileRoute("/profile/privacy-policy")({
  component: PrivacyPolicyScreen,
});
