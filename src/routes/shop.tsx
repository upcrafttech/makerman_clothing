import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/shop")({
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/store",
      search,
    });
  },
});
