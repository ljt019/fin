import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TitleBar } from "@/components/title-bar";

import { indexRoute } from "@/screens/index";
import { aboutRoute } from "@/screens/about";

export const rootRoute = createRootRoute({
  component: () => (
    <>
      <TitleBar />
      <Outlet />
    </>
  ),
});

export const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);
