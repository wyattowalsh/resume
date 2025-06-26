"use client"

import { FaMoon, FaSun } from "react-icons/fa"
import { useTheme } from "./theme-provider"
import { Button } from "./ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const isDark = theme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative h-9 w-9"
    >
      <span className="sr-only">Toggle theme</span>
      <FaSun
        className={`h-[1.2rem] w-[1.2rem] transform transition-all duration-500 ease-in-out ${
          isDark ? "rotate-0 scale-100" : "rotate-90 scale-0"
        }`}
      />
      <FaMoon
        className={`absolute h-[1.2rem] w-[1.2rem] transform transition-all duration-500 ease-in-out ${
          isDark ? "-rotate-90 scale-0" : "rotate-0 scale-100"
        }`}
      />
    </Button>
  )
} 