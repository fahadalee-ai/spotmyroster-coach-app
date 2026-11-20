import { createFileRoute } from "@tanstack/react-router";
import { AuthSuccessScreen } from "@/screens/auth-screens";

export const Route = createFileRoute("/auth-success")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: search.next === "home" ? ("home" as const) : ("setup" as const),
    title: typeof search.title === "string" ? search.title : "You're in",
  }),
  component: function AuthSuccessPage() {
    const { title, next } = Route.useSearch();
    return <AuthSuccessScreen title={title} next={next} />;
  },
});
