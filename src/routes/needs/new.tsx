import { createFileRoute } from "@tanstack/react-router";
import { NeedFormScreen } from "@/screens/need-screens";

export const Route = createFileRoute("/needs/new")({
  component: NeedFormScreen,
});
