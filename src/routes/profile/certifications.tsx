import { createFileRoute } from "@tanstack/react-router";
import { CertificationsScreen } from "@/screens/profile-screens";

export const Route = createFileRoute("/profile/certifications")({
  component: CertificationsScreen,
});
