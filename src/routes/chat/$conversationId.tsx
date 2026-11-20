import { createFileRoute } from "@tanstack/react-router";
import { ChatDetailScreen } from "@/screens/chat-screens";

export const Route = createFileRoute("/chat/$conversationId")({
  component: function Page() {
    const { conversationId } = Route.useParams();
    return <ChatDetailScreen conversationId={conversationId} />;
  },
});
