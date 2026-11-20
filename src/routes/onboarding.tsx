import { createFileRoute } from "@tanstack/react-router";
import { OnboardingScreen } from "@/screens/auth-screens";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingScreen,
});
