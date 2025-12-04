import { Moon } from "lucide-react";
import { Button } from "./ui/button";

/**
 * ThemeToggle - Currently disabled as app is dark-mode only
 * Displays moon icon as visual indicator of dark mode
 */
const ThemeToggle = () => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="hover:bg-sidebar-accent text-sidebar-foreground h-8 w-8 cursor-default"
      aria-label="Dark mode enabled"
      disabled
    >
      <Moon className="w-4 h-4" />
    </Button>
  );
};

export default ThemeToggle;
