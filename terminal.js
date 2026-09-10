// this is MY gimmick

// terminal.js -- shared across all pages.
// The bottom bar is the only navigation on this site: type a page name
// (or "help") into the input and press Enter.

const PAGES = {
  home: "index.html",
  index: "index.html",
  portfolio: "portfolio.html",
  qualifications: "qualifications.html",
  quals: "qualifications.html",
  activities: "activities.html",
  sandbox: "sandbox.html"
};

const HELP_TEXT = "commands: home, portfolio, qualifications, activities, sandbox, help, clear";

function initTerminal() {
  const input = document.getElementById("terminalInput");
  const output = document.getElementById("terminalOutput");

  input.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;

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

    if (PAGES[cmd]) {
      window.location.href = PAGES[cmd];
      return;
    }

    printLine(output, "command not found: " + raw);
  });
}

function printLine(output, text) {
  const line = document.createElement("div");
  line.className = "terminal-line";
  line.textContent = text;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

document.addEventListener("DOMContentLoaded", initTerminal);