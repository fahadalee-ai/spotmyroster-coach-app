import { createFileRoute } from "@tanstack/react-router";
import { OtpScreen } from "@/screens/auth-screens";

export const Route = createFileRoute("/otp")({
  validateSearch: (search: Record<string, unknown>) => ({
    purpose: search.purpose === "reset" ? ("reset" as const) : ("verify" as const),
    email: typeof search.email === "string" ? search.email : "",
  }),
  component: function OtpPage() {
    const { email, purpose } = Route.useSearch();
    return <OtpScreen email={email} purpose={purpose} />;
  },
});
