import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordScreen } from "@/screens/auth-screens";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordScreen,
});
