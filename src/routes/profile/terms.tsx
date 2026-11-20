import { createFileRoute } from "@tanstack/react-router";
import { TermsScreen } from "@/screens/profile-screens";

export const Route = createFileRoute("/profile/terms")({
  component: TermsScreen,
});
