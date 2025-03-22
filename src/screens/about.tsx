import { createRoute, useNavigate } from "@tanstack/react-router";
import { rootRoute } from "@/screens/root";
import { Undo, Minus, Plus, Github, ExternalLink, Heart } from "lucide-react";

export const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: About,
});

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function About() {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="max-w-3xl mx-auto pt-8 pb-16">
        <Card className="w-full mx-auto border shadow-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">About This Template</CardTitle>
                <CardDescription>Example page with interactive components</CardDescription>
              </div>
              <Button variant="ghost" onClick={() => navigate({ to: "/" })} className="h-9 w-9 p-0">
                <Undo className="h-5 w-5" />
                <span className="sr-only">Back to home</span>
              </Button>
            </div>
          </CardHeader>

          <Tabs defaultValue="counter" className="w-full">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="counter">Counter</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="counter" className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">Counter Example</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    A simple counter to demonstrate state management
                  </p>
                </div>

                <Card className="border-2 border-primary/20 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex justify-center items-center text-5xl font-bold py-8 text-primary">
                      {count}
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-center pb-6">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setCount((prev) => prev - 1)}
                        className="h-12 w-12 rounded-full p-0"
                      >
                        <Minus className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="default"
                        size="lg"
                        onClick={() => setCount((prev) => prev + 1)}
                        className="h-12 w-12 rounded-full p-0"
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Helpful Resources</h3>
                <p className="text-sm text-muted-foreground">
                  Explore these resources to learn more about the technologies used in this
                  template.
                </p>

                <div className="space-y-3 mt-4">
                  <ResourceLink
                    title="Tauri Documentation"
                    description="Learn how to build desktop apps with Tauri"
                    url="https://tauri.app"
                  />
                  <ResourceLink
                    title="React Documentation"
                    description="Official React documentation"
                    url="https://react.dev/"
                  />
                  <ResourceLink
                    title="TanStack Router"
                    description="Type-safe routing for React applications"
                    url="https://tanstack.com/router/latest"
                  />
                  <ResourceLink
                    title="ShadCN UI"
                    description="Re-usable components built with Radix UI and Tailwind CSS"
                    url="https://ui.shadcn.com/"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <CardFooter className="flex justify-between items-center border-t px-6 py-4">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs"
              onClick={() => window.open("https://github.com/ljt019", "_blank")}
            >
              <Github className="h-3.5 w-3.5" />
              GitHub: ljt019
            </Button>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                Made with <Heart className="h-3 w-3 text-red-500" /> by Lucien Thomas
              </span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

interface ResourceLinkProps {
  title: string;
  description: string;
  url: string;
}

function ResourceLink({ title, description, url }: ResourceLinkProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 rounded-lg border hover:bg-accent hover:border-accent transition-colors"
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-medium">{title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
      </div>
    </a>
  );
}
