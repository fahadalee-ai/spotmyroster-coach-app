import { createFileRoute } from "@tanstack/react-router";
import { AthleteScreen } from "@/screens/recruit-screens";

export const Route = createFileRoute("/recruit/athletes/$athleteId")({
  component: function Page() {
    const { athleteId } = Route.useParams();
    return <AthleteScreen athleteId={athleteId} />;
  },
});
