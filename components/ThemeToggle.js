"use client";

import { useEffect, useState } from "react";

function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(function () {
    var saved = localStorage.getItem("theme");
    var next = "light";
    if (saved === "dark" || saved === "light") {
      next = saved;
    }
    setTheme(next);
    document.documentElement.className = next;
  }, []);

  function handleClick() {
    var next = "light";
    if (theme === "light") {
      next = "dark";
    }
    setTheme(next);
    document.documentElement.className = next;
    localStorage.setItem("theme", next);
  }

  var label = "Mode sombre";
  if (theme === "dark") {
    label = "Mode clair";
  }

  return (
    <button type="button" className="button button-secondary" onClick={handleClick}>
      {label}
    </button>
  );
}

export default ThemeToggle;
