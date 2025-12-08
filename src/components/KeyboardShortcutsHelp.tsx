import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Keyboard } from "lucide-react";

export const KeyboardShortcutsHelp = () => {
  const [open, setOpen] = useState(false);

  const shortcuts = [
    { keys: "Alt + H", action: "Go to Home" },
    { keys: "Alt + F", action: "Go to Feed" },
    { keys: "Alt + S", action: "Go to Search" },
    { keys: "Alt + N", action: "Go to Notifications" },
    { keys: "Alt + P", action: "Go to Profile" },
    { keys: "Alt + M", action: "Go to Messages" },
    { keys: "Alt + G", action: "Go to Settings" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-20 right-4 z-50 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
          aria-label="Keyboard shortcuts help"
        >
          <Keyboard className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate faster
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.keys}
              className="flex items-center justify-between p-3 rounded-lg bg-muted"
            >
              <span className="text-sm font-medium">{shortcut.action}</span>
              <kbd className="px-3 py-1 text-xs font-semibold rounded bg-background border border-border">
                {shortcut.keys}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
