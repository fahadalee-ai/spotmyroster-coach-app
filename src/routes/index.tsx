import { createFileRoute } from "@tanstack/react-router";
import { SplashScreen } from "@/screens/auth-screens";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SpotMyRoster" },
      { name: "description", content: "SpotMyRoster coach app." },
    ],
  }),
  component: SplashScreen,
});
