import { createFileRoute } from "@tanstack/react-router";
import { PasswordScreen } from "@/screens/profile-screens";

export const Route = createFileRoute("/profile/password")({
  component: PasswordScreen,
});
