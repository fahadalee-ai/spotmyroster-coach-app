import { createFileRoute } from "@tanstack/react-router";
import { VerifyEmailScreen } from "@/screens/auth-screens";

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search.email === "string" ? search.email : "",
  }),
  component: function VerifyEmailPage() {
    const { email } = Route.useSearch();
    return <VerifyEmailScreen email={email} />;
  },
});
