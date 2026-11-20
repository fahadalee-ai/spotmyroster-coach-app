import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordScreen } from "@/screens/auth-screens";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordScreen,
});
