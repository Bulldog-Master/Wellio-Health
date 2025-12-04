import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Always force dark mode
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    setIsDark(true);
  }, []);

  const toggleTheme = () => {
    // Theme toggle disabled - always dark mode
    // const newIsDark = !isDark;
    // setIsDark(newIsDark);
    // if (newIsDark) {
    //   document.documentElement.classList.add('dark');
    //   document.documentElement.classList.remove('light');
    // } else {
    //   document.documentElement.classList.remove('dark');
    //   document.documentElement.classList.add('light');
    // }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="hover:bg-sidebar-accent text-sidebar-foreground h-8 w-8"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </Button>
  );
};

export default ThemeToggle;