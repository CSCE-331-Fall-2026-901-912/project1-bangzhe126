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
    "commands: home, portfolio, qualifications, activities, sandbox, theme toggle, help, clear";

function getThemeLink() {
    return document.getElementById("themeStylesheet");
}

function getCurrentTheme() {
    const savedTheme = sessionStorage.getItem("site-theme");

    if (savedTheme === "terminal") {
        return "terminal";
    }

    return "professional";
}

function updateThemeControls(themeName) {
    document.documentElement.dataset.theme = themeName;

    document.querySelectorAll("[data-theme-toggle]").forEach((link) => {
        link.textContent =
            themeName === "terminal"
                ? "Default Style"
                : "Terminal Style";
    });

    const input = document.getElementById("terminalInput");
    const terminal = document.getElementById("terminalBar");

    if (input) {
        input.disabled = themeName !== "terminal";
    }

    if (terminal) {
        terminal.setAttribute(
            "aria-hidden",
            String(themeName !== "terminal")
        );
    }
}

function applyTheme(themeName) {
    const link = getThemeLink();

    if (!link || !THEMES[themeName]) {
        return;
    }

    sessionStorage.setItem(
        "site-theme",
        themeName
    );

    link.href = THEMES[themeName];

    updateThemeControls(themeName);
}

function toggleTheme() {
    const nextTheme =
        getCurrentTheme() === "terminal"
            ? "professional"
            : "terminal";

    applyTheme(nextTheme);
}

function printLine(output, text) {
    const line = document.createElement("div");

    line.className = "terminal-line";
    line.textContent = text;

    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function initThemeLinks() {
    document
        .querySelectorAll("[data-theme-toggle]")
        .forEach((link) => {
            link.addEventListener(
                "click",
                function (event) {
                    event.preventDefault();
                    toggleTheme();
                }
            );
        });
}

function initTerminal() {
    const input =
        document.getElementById("terminalInput");

    const output =
        document.getElementById("terminalOutput");

    if (!input || !output) {
        return;
    }

    input.addEventListener(
        "keydown",
        function (event) {
            if (
                event.key !== "Enter" ||
                getCurrentTheme() !== "terminal"
            ) {
                return;
            }

            const raw = input.value.trim();
            const cmd = raw.toLowerCase();

            input.value = "";

            if (cmd === "") {
                return;
            }

            if (cmd === "clear") {
                output.innerHTML = "";
                return;
            }

            if (cmd === "help") {
                printLine(
                    output,
                    HELP_TEXT
                );

                return;
            }

            if (cmd === "theme toggle") {
                toggleTheme();
                return;
            }

            if (PAGES[cmd]) {
                window.location.href =
                    PAGES[cmd];

                return;
            }

            printLine(
                output,
                "command not found: " + raw
            );
        }
    );
}

updateThemeControls(getCurrentTheme());
initThemeLinks();
initTerminal();