import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/diagnostic-test")({
  beforeLoad: () => {
    throw redirect({ to: "/diagnostic" });
  },
});
