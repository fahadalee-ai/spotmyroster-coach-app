import { createFileRoute } from "@tanstack/react-router";
import { SetupScreen } from "@/screens/setup-screen";

export const Route = createFileRoute("/setup")({
  component: SetupScreen,
});
