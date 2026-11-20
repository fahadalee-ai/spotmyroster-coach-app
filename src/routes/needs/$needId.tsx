import { createFileRoute } from "@tanstack/react-router";
import { NeedDetailScreen } from "@/screens/need-screens";

export const Route = createFileRoute("/needs/$needId")({
  component: function Page() {
    const { needId } = Route.useParams();
    return <NeedDetailScreen needId={needId} />;
  },
});
