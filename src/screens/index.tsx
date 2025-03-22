import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "@/screens/root";
import { ChatContainer } from "@/components/chat/ChatContainer";

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Index,
});

function Index() {
  return <ChatContainer />;
}
