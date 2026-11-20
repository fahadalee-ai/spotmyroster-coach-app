import { createFileRoute } from "@tanstack/react-router";
import { RosterScreen } from "@/screens/team-screens";

export const Route = createFileRoute("/teams/$teamId/roster")({
  component: function Page() {
    const { teamId } = Route.useParams();
    return <RosterScreen teamId={teamId} />;
  },
});
