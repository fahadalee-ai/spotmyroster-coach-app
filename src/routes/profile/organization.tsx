import { createFileRoute } from "@tanstack/react-router";
import { OrganizationScreen } from "@/screens/profile-screens";

export const Route = createFileRoute("/profile/organization")({
  component: OrganizationScreen,
});
