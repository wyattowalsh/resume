import React from "react";

const ThemeScript = () => {
  const script = `
    (function() {
      const getTheme = () => {
        const theme = window.localStorage.getItem('theme')
        if (theme) return theme
        return window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
      }
      const theme = getTheme()
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      }
    })()
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
};

export default ThemeScript; 