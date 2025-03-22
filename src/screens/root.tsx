import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { indexRoute } from "@/screens/index";
import { aboutRoute } from "@/screens/about";

export const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <ReactQueryDevtools />
      <TanStackRouterDevtools />
    </>
  ),
});

export const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);
