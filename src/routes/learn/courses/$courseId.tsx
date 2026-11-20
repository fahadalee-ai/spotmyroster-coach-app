import { createFileRoute } from "@tanstack/react-router";
import { CourseScreen } from "@/screens/learn-screens";

export const Route = createFileRoute("/learn/courses/$courseId")({
  component: function Page() {
    const { courseId } = Route.useParams();
    return <CourseScreen courseId={courseId} />;
  },
});
