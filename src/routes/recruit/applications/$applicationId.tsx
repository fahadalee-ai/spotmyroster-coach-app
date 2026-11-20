import { createFileRoute } from "@tanstack/react-router";
import { ApplicationDetailScreen } from "@/screens/recruit-screens";

export const Route = createFileRoute("/recruit/applications/$applicationId")({
  component: function Page() {
    const { applicationId } = Route.useParams();
    return <ApplicationDetailScreen applicationId={applicationId} />;
  },
});
