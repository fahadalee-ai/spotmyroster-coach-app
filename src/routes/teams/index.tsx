import { createFileRoute } from "@tanstack/react-router";
import { TeamsScreen } from "@/screens/team-screens";

export const Route = createFileRoute("/teams/")({
  component: TeamsScreen,
});
