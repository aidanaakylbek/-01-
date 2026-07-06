import { createFileRoute } from "@tanstack/react-router";
import { getAccountDashboard } from "@/lib/api/account.functions";
import { ProfileContent } from "./settings";

export const Route = createFileRoute("/profile")({
  loader: async () => getAccountDashboard(),
  head: () => ({ meta: [{ title: "Profile — AI-Sana" }] }),
  component: ProfileRoute,
});

function ProfileRoute() {
  const dashboard = Route.useLoaderData();
  return <ProfileContent dashboard={dashboard} />;
}
