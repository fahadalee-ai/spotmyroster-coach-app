import { createFileRoute } from "@tanstack/react-router";
import { TeamFormScreen } from "@/screens/team-screens";

export const Route = createFileRoute("/teams/new")({
  component: TeamFormScreen,
});
