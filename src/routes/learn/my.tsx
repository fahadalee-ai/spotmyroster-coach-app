import { createFileRoute } from "@tanstack/react-router";
import { MyCoursesScreen } from "@/screens/learn-screens";

export const Route = createFileRoute("/learn/my")({
  component: MyCoursesScreen,
});
