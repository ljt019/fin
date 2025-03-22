import { X, Minus } from "lucide-react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Button } from "@/components/ui/button";

export function TitleBar() {
  // Function to minimize the window
  const minimizeWindow = async () => {
    try {
      const appWindow = getCurrentWebviewWindow();
      await appWindow.minimize();
    } catch (error) {
      console.error("Failed to minimize window:", error);
    }
  };

  // Function to close the window
  const closeWindow = async () => {
    try {
      const appWindow = getCurrentWebviewWindow();
      await appWindow.close();
    } catch (error) {
      console.error("Failed to close window:", error);
    }
  };

  return (
    <div
      className="h-[30px] select-none flex justify-end fixed top-0 left-0 right-0 w-full z-[999] p-[5px]"
      data-tauri-drag-region
    >
      <Button
        className="inline-flex justify-center items-center w-[30px] h-[30px] text-muted-foreground hover:text-foreground"
        id="titlebar-minimize"
        onClick={minimizeWindow}
        variant={"icon"}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Button
        className="inline-flex justify-center items-center w-[30px] h-[30px] text-muted-foreground hover:text-destructive"
        id="titlebar-close"
        onClick={closeWindow}
        variant={"icon"}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
