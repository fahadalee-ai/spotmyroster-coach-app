import { createFileRoute } from "@tanstack/react-router";
import { DeleteAccountScreen } from "@/screens/profile-screens";

export const Route = createFileRoute("/profile/delete")({
  component: DeleteAccountScreen,
});
