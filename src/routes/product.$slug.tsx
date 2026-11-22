import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    throw redirect({ to: "/product/$id", params: { id: params.slug } });
  },
  component: () => null,
});
