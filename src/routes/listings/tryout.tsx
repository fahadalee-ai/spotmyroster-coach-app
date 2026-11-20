import { createFileRoute } from "@tanstack/react-router";
import { TryoutWizardScreen } from "@/screens/listing-screens";

export const Route = createFileRoute("/listings/tryout")({
  component: TryoutWizardScreen,
});
