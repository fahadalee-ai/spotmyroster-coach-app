import { createFileRoute } from "@tanstack/react-router";
import { EventDetailScreen } from "@/screens/event-screens";

export const Route = createFileRoute("/events/$eventId")({
  component: function Page() {
    const { eventId } = Route.useParams();
    return <EventDetailScreen eventId={eventId} />;
  },
});
