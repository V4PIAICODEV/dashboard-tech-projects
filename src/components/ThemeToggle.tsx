import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * Sun/Moon icon toggle button for switching between dark and light mode.
 * Shows Sun icon when dark (click to switch to light).
 * Shows Moon icon when light (click to switch to dark).
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}
