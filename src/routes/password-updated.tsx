import { createFileRoute } from "@tanstack/react-router";
import { PasswordUpdatedScreen } from "@/screens/auth-screens";

export const Route = createFileRoute("/password-updated")({
  component: PasswordUpdatedScreen,
});
