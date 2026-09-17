const PAGES = {
  home: "index.html",
  index: "index.html",
  portfolio: "portfolio.html",
  qualifications: "qualifications.html",
  quals: "qualifications.html",
  activities: "activities.html",
  sandbox: "sandbox.html"
};

const THEMES = {
  terminal: "terminal.css",
  professional: "stylesheet.css"
};

const HELP_TEXT =
  "commands: home, portfolio, qualifications, activities, sandbox, theme, theme terminal, theme professional, theme toggle, help, clear";

function getThemeLink() {
  return document.getElementById("themeStylesheet");
}

function getCurrentTheme() {
  const link = getThemeLink();
  if (!link) return "professional";

  const href = link.getAttribute("href") || "";
  return href.endsWith("terminal.css") ? "terminal" : "professional";
}

function updateThemeControls(themeName) {
  document.documentElement.dataset.theme = themeName;

  document.querySelectorAll("[data-theme-toggle]").forEach((link) => {
    link.textContent = themeName === "professional" ? "Terminal Style" : "Professional Style";
  });

  const input = document.getElementById("terminalInput");
  const terminal = document.getElementById("terminalBar");
  const terminalEnabled = themeName === "terminal";

  if (input) input.disabled = !terminalEnabled;
  if (terminal) terminal.setAttribute("aria-hidden", String(!terminalEnabled));
}

function applyTheme(themeName, remember = true) {
  if (!THEMES[themeName]) return false;

  const link = getThemeLink();
  if (!link) return false;

  link.setAttribute("href", THEMES[themeName]);
  updateThemeControls(themeName);

  if (remember) {
    localStorage.setItem("site-theme", themeName);
  }

  return true;
}

function loadSavedTheme() {
  const savedTheme = localStorage.getItem("site-theme");
  const themeName = THEMES[savedTheme] ? savedTheme : "terminal";
  applyTheme(themeName, false);
}

function printLine(output, text) {
  const line = document.createElement("div");
  line.className = "terminal-line";
  line.textContent = text;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

function handleThemeCommand(output, cmd) {
  if (cmd === "theme" || cmd === "style") {
    printLine(
      output,
      `theme: ${getCurrentTheme()} (use "theme terminal", "theme professional", or "theme toggle")`
    );
    return true;
  }

  if (cmd === "theme toggle" || cmd === "style toggle") {
    const nextTheme = getCurrentTheme() === "terminal" ? "professional" : "terminal";
    printLine(output, `theme switched to: ${nextTheme}`);
    applyTheme(nextTheme);
    return true;
  }

  const match = cmd.match(/^(?:theme|style)\s+(terminal|professional)$/);
  if (match) {
    const nextTheme = match[1];
    printLine(output, `theme switched to: ${nextTheme}`);
    applyTheme(nextTheme);
    return true;
  }

  return false;
}

function initThemeLinks() {
  document.querySelectorAll("[data-theme-toggle]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const nextTheme = getCurrentTheme() === "terminal" ? "professional" : "terminal";
      applyTheme(nextTheme);
    });
  });
}

function initTerminal() {
  const input = document.getElementById("terminalInput");
  const output = document.getElementById("terminalOutput");

  if (!input || !output) return;

  input.addEventListener("keydown", function (event) {
    if (event.key !== "Enter" || getCurrentTheme() !== "terminal") return;

    const raw = input.value.trim();
    const cmd = raw.toLowerCase();
    input.value = "";

    if (cmd === "") return;

    if (cmd === "clear") {
      output.innerHTML = "";
      return;
    }

    if (cmd === "help") {
      printLine(output, HELP_TEXT);
      return;
    }

    if (handleThemeCommand(output, cmd)) return;

    if (PAGES[cmd]) {
      window.location.href = PAGES[cmd];
      return;
    }

    printLine(output, "command not found: " + raw);
  });
}

loadSavedTheme();
initThemeLinks();
initTerminal();
