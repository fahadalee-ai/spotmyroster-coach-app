import { createFileRoute } from "@tanstack/react-router";
import { RecruitScreen } from "@/screens/recruit-screens";

export const Route = createFileRoute("/recruit/")({
  component: RecruitScreen,
});
