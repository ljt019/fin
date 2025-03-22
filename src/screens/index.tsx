"use client";

import { createRoute, useNavigate } from "@tanstack/react-router";
import { rootRoute } from "@/screens/root";
import { ArrowRight, Github, FileCode, Heart, ExternalLink } from "lucide-react";

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Index,
});

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function Index() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <img src="/tauri.svg" className="size-10" />,
      title: "Tauri",
      description: "Build secure and lightweight desktop applications with web technologies",
      url: "https://tauri.app/",
    },
    {
      icon: <img src="/vite.svg" className="size-10" />,
      title: "Vite & React 18",
      description: "Fast development with modern UI capabilities",
      url: "https://vitejs.dev/",
    },
    {
      icon: <img src="/typescript.svg" className="size-10" />,
      title: "TypeScript",
      description: "Type-safe development experience",
      url: "https://www.typescriptlang.org/",
    },
    {
      icon: <img src="/tailwind.svg" className="size-10" />,
      title: "Tailwind",
      description: "Utility-first CSS for rapid UI development",
      url: "https://tailwindcss.com/",
    },
    {
      icon: <img src="/react-query.svg" className="size-10" />,
      title: "TanStack Router & Query",
      description: "Type-safe routing and efficient data fetching",
      url: "https://tanstack.com/",
    },
    {
      icon: <img src="/shadcn.svg" className="size-10" />,
      title: "ShadCN UI",
      description: "Accessible and customizable components",
      url: "https://ui.shadcn.com/",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="max-w-5xl mx-auto pt-8 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Tauri React Template</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A robust and feature-rich template for building desktop applications
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="border bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-primary/10 text-primary">{feature.icon}</div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => window.open(feature.url, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Visit {feature.title} website</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Welcome to Your New App!</CardTitle>
            <CardDescription>
              Your Tauri React Template is up and running successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-primary/10 p-4 border border-primary/20">
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <FileCode className="h-4 w-4" />
                Next Steps
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>
                  Edit{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    src/screens/Index.tsx
                  </code>{" "}
                  to customize this landing page
                </li>
                <li>
                  Create new routes in{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">src/screens/</code>{" "}
                  directory
                </li>
                <li>
                  Add components in{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">src/components/</code>
                </li>
                <li>
                  Configure Tauri in{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">src-tauri/</code> directory
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <h3 className="font-medium">Try the counter example</h3>
                <p className="text-sm text-muted-foreground">
                  Visit the About page to see a working counter component
                </p>
              </div>
              <Button onClick={() => navigate({ to: "/about" })} className="gap-2">
                View Example
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center border-t pt-4">
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
