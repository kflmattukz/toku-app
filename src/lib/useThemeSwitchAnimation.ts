import { useEffect, useState } from "react";
import { ThemeAnimationType, useModeAnimation } from "react-theme-switch-animation";
import { isDarkMode } from "#/lib/utils";

export function useThemeSwitchAnimation() {
  const [dark, setDark] = useState(isDarkMode);

  useEffect(() => {
    const handleThemeChange = (e: CustomEvent<boolean>) => {
      setDark(e.detail);
    };
    window.addEventListener("toku_theme_change" as any, handleThemeChange);
    return () => {
      window.removeEventListener("toku_theme_change" as any, handleThemeChange);
    };
  }, []);

  const { ref, toggleSwitchTheme } = useModeAnimation({
    animationType: ThemeAnimationType.CIRCLE,
    isDarkMode: dark,
    onDarkModeChange: (nextDark) => {
      localStorage.setItem("toku_theme", nextDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", nextDark);
      window.dispatchEvent(new CustomEvent("toku_theme_change", { detail: nextDark }));
      setDark(nextDark);
    },
  });

  return { ref, toggleSwitchTheme, dark };
}
