import { createFileRoute } from "@tanstack/react-router";
import { TeamDetailScreen } from "@/screens/team-screens";

export const Route = createFileRoute("/teams/$teamId")({
  component: function Page() {
    const { teamId } = Route.useParams();
    return <TeamDetailScreen teamId={teamId} />;
  },
});
