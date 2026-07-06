import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "./index";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Learning Path — AI-Sana" },
      { name: "description", content: "AI-Sana gamified learning path." },
    ],
  }),
  component: Dashboard,
});
