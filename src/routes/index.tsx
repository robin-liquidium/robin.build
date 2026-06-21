import { createFileRoute } from "@tanstack/react-router";
import { HomeScreen } from "@/src/features/home/HomeScreen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "robin.build" },
      { name: "description", content: "robin.build" },
    ],
  }),
  component: HomeRoute,
});

/** Renders the bootable robin.build desktop entry route. */
function HomeRoute() {
  return <HomeScreen />;
}
