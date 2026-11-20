import { createFileRoute } from "@tanstack/react-router";
import { NeedFormScreen } from "@/screens/need-screens";

export const Route = createFileRoute("/needs/$needId/edit")({
  component: function Page() {
    const { needId } = Route.useParams();
    return <NeedFormScreen needId={needId} />;
  },
});
