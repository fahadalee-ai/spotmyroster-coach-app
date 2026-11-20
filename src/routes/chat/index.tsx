import { createFileRoute } from "@tanstack/react-router";
import { ChatListScreen } from "@/screens/chat-screens";

export const Route = createFileRoute("/chat/")({
  component: ChatListScreen,
});
