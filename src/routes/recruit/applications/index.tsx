import { createFileRoute } from "@tanstack/react-router";
import { ApplicationsScreen } from "@/screens/recruit-screens";

export const Route = createFileRoute("/recruit/applications/")({
  component: ApplicationsScreen,
});
