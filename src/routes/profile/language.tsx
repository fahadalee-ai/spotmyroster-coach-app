import { createFileRoute } from "@tanstack/react-router";
import { LanguageScreen } from "@/screens/profile-screens";

export const Route = createFileRoute("/profile/language")({
  component: LanguageScreen,
});
