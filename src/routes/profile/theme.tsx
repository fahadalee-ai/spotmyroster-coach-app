import { createFileRoute } from "@tanstack/react-router";
import { ThemeScreen } from "@/screens/profile-screens";

export const Route = createFileRoute("/profile/theme")({
  component: ThemeScreen,
});
