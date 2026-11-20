import { createFileRoute } from "@tanstack/react-router";
import { EventFormScreen } from "@/screens/event-screens";

export const Route = createFileRoute("/events/$eventId/edit")({
  component: function Page() {
    const { eventId } = Route.useParams();
    return <EventFormScreen eventId={eventId} />;
  },
});
