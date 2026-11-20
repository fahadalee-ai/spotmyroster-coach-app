import { createFileRoute } from "@tanstack/react-router";
import { LessonScreen } from "@/screens/learn-screens";

export const Route = createFileRoute("/learn/courses/$courseId/lessons/$lessonId")({
  component: function Page() {
    const { courseId } = Route.useParams();
    const { lessonId } = Route.useParams();
    return <LessonScreen courseId={courseId} lessonId={lessonId} />;
  },
});
