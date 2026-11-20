import { createFileRoute } from "@tanstack/react-router";
import { NotificationSettingsScreen } from "@/screens/profile-screens";

export const Route = createFileRoute("/profile/notifications")({
  component: NotificationSettingsScreen,
});
