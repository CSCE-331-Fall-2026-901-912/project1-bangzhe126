const DEFAULT_CORPUS =
    "computers learn patterns by predicting what comes next. a language model looks at the words it has already seen and guesses the next word based on patterns it learned from examples. sometimes the model predicts words that make sense. sometimes the model predicts words that are strange or funny. either way the model keeps guessing one word at a time until it decides to stop.";

let markovChain = null;
let vocabulary = [];
let generatedWords = [];
let autoTimer = null;

function tokenize(text) {
    return text.trim().split(/\s+/).filter(Boolean);
}

function buildChain(tokens) {
    const chain = new Map();

    for (let i = 0; i < tokens.length - 1; i++) {
        const current = tokens[i];
        const next = tokens[i + 1];

        if (!chain.has(current)) {
            chain.set(current, new Map());
        }

        const followers = chain.get(current);
        followers.set(next, (followers.get(next) || 0) + 1);
    }

    return chain;
}

function getCandidates(word) {
    if (!markovChain || !markovChain.has(word)) {
        return null;
    }

    const followers = markovChain.get(word);
    const total = Array.from(followers.values()).reduce(function (sum, count) {
        return sum + count;
    }, 0);

    return Array.from(followers.entries())
        .map(function (entry) {
            return {
                word: entry[0],
                count: entry[1],
                probability: entry[1] / total
            };
        })
        .sort(function (a, b) {
            return b.count - a.count;
        })
        .slice(0, 5);
}

function weightedChoice(candidates) {
    const roll = Math.random();
    let cumulative = 0;

    for (let i = 0; i < candidates.length; i++) {
        cumulative += candidates[i].probability;

        if (roll <= cumulative) {
            return candidates[i].word;
        }
    }

    return candidates[candidates.length - 1].word;
}

function renderCandidates(candidates, chosenWord, isRestart) {
    const container = document.getElementById("labCandidates");
    container.innerHTML = "";

    if (isRestart) {
        const note = document.createElement("p");
        note.className = "lab-empty";
        note.textContent = "context ran out - restarting from a random word in the vocabulary.";
        container.appendChild(note);
        return;
    }

    if (!candidates) {
        return;
    }

    candidates.forEach(function (candidate) {
        const row = document.createElement("div");
        row.className = "candidate-row" + (candidate.word === chosenWord ? " chosen" : "");

        const word = document.createElement("span");
        word.className = "candidate-word";
        word.textContent = candidate.word;

        const track = document.createElement("span");
        track.className = "candidate-track";

        const fill = document.createElement("span");
        fill.className = "candidate-fill";
        fill.style.width = Math.round(candidate.probability * 100) + "%";
        track.appendChild(fill);

        const pct = document.createElement("span");
        pct.className = "candidate-pct";
        pct.textContent = Math.round(candidate.probability * 100) + "%";

        row.appendChild(word);
        row.appendChild(track);
        row.appendChild(pct);
        container.appendChild(row);
    });
}

function renderOutput() {
    const output = document.getElementById("labOutput");
    output.innerHTML = "";

    generatedWords.forEach(function (word, index) {
        if (word === "\u00b7") {
            const marker = document.createElement("span");
            marker.className = "lab-reset-marker";
            marker.textContent = " \u00b7 ";
            output.appendChild(marker);
            return;
        }

        const span = document.createElement("span");
        span.textContent = word + " ";

        if (index === generatedWords.length - 1) {
            span.className = "lab-word-current";
        }

        output.appendChild(span);
    });
}

function stepGenerate() {
    if (!markovChain) {
        return;
    }

    const lastWord = generatedWords.length
        ? generatedWords[generatedWords.length - 1]
        : null;

    if (lastWord === null || lastWord === "\u00b7") {
        const startWord = vocabulary[Math.floor(Math.random() * vocabulary.length)];
        generatedWords.push(startWord);
        renderOutput();
        renderCandidates(getCandidates(startWord), null, false);
        return;
    }

    const candidates = getCandidates(lastWord);

    if (!candidates) {
        generatedWords.push("\u00b7");
        renderOutput();
        renderCandidates(null, null, true);
        return;
    }

    const nextWord = weightedChoice(candidates);
    generatedWords.push(nextWord);
    renderOutput();
    renderCandidates(candidates, nextWord, false);
}

function stopAuto() {
    if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
    }

    const autoButton = document.getElementById("labAuto");

    if (autoButton) {
        autoButton.textContent = "auto-generate";
    }
}

function toggleAuto() {
    if (!markovChain) {
        return;
    }

    if (autoTimer) {
        stopAuto();
        return;
    }

    document.getElementById("labAuto").textContent = "stop";

    let steps = 0;

    autoTimer = setInterval(function () {
        stepGenerate();
        steps++;

        if (steps >= 40) {
            stopAuto();
        }
    }, 550);
}

function trainModel() {
    const tokens = tokenize(document.getElementById("labCorpus").value);

    if (tokens.length < 2) {
        document.getElementById("labCandidates").innerHTML =
            '<p class="lab-empty">add a bit more text to train on.</p>';
        return;
    }

    markovChain = buildChain(tokens);
    vocabulary = Array.from(new Set(tokens));
    generatedWords = [];

    stopAuto();
    document.getElementById("labOutput").innerHTML = "";
    document.getElementById("labCandidates").innerHTML =
        '<p class="lab-empty">trained on ' + tokens.length + ' words, ' +
        vocabulary.length + ' unique. click "next word" or "auto-generate" to begin.</p>';

    document.getElementById("labStep").disabled = false;
    document.getElementById("labAuto").disabled = false;
    document.getElementById("labClear").disabled = false;
}

function clearOutput() {
    generatedWords = [];
    stopAuto();
    document.getElementById("labOutput").innerHTML = "";
    document.getElementById("labCandidates").innerHTML =
        '<p class="lab-empty">click "next word" or "auto-generate" to begin.</p>';
}

function resetCorpus() {
    document.getElementById("labCorpus").value = DEFAULT_CORPUS;
}

function initLab() {
    const corpusField = document.getElementById("labCorpus");

    if (!corpusField) {
        return;
    }

    corpusField.value = DEFAULT_CORPUS;

    document.getElementById("labTrain").addEventListener("click", trainModel);
    document.getElementById("labReset").addEventListener("click", resetCorpus);
    document.getElementById("labStep").addEventListener("click", stepGenerate);
    document.getElementById("labAuto").addEventListener("click", toggleAuto);
    document.getElementById("labClear").addEventListener("click", clearOutput);
}

initLab();