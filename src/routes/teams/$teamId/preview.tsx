import { createFileRoute } from "@tanstack/react-router";
import { TeamPreviewScreen } from "@/screens/team-screens";

export const Route = createFileRoute("/teams/$teamId/preview")({
  component: function Page() {
    const { teamId } = Route.useParams();
    return <TeamPreviewScreen teamId={teamId} />;
  },
});
