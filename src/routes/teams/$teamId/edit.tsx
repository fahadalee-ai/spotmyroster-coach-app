import { createFileRoute } from "@tanstack/react-router";
import { TeamFormScreen } from "@/screens/team-screens";

export const Route = createFileRoute("/teams/$teamId/edit")({
  component: function Page() {
    const { teamId } = Route.useParams();
    return <TeamFormScreen teamId={teamId} />;
  },
});
