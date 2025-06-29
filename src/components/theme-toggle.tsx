"use client"

import { useTheme } from "./theme-provider"
import { Button } from "./ui/button"
import { useEffect, useState } from "react"
import { FaMoon, FaSun } from "react-icons/fa"

export function ModeToggle() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Render a disabled placeholder to prevent layout shift
    return (
      <Button variant="ghost" size="icon" disabled className="relative h-9 w-9">
        <FaSun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <FaSun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <FaMoon className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
} 