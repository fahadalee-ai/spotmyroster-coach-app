import { createFileRoute } from "@tanstack/react-router";
import { LearnScreen } from "@/screens/learn-screens";

export const Route = createFileRoute("/learn/")({
  component: LearnScreen,
});
