(() => {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const STORAGE_KEYS = {
    language: "dots-and-boxes-language",
    size: "dots-and-boxes-size"
  };

  const BOARD_SIZES = {
    small: { rows: 4, cols: 4, nameKey: "sizeNameSmall" },
    medium: { rows: 7, cols: 7, nameKey: "sizeNameMedium" },
    large: { rows: 12, cols: 16, nameKey: "sizeNameLarge" }
  };

  const COPY = {
    ro: {
      pageTitle: "Puncte și Pătrate",
      pageDescription: "Puncte și Pătrate — jocul clasic pentru doi jucători, în română și engleză.",
      skipToBoard: "Sari la tabla de joc",
      eyebrow: "Joc clasic pentru doi",
      title: "Puncte și Pătrate",
      languageLabel: "Limbă",
      letsPlay: "Hai să jucăm",
      subtitle: "Închide pătratele. Câștigă tabla.",
      boardSize: "Dimensiune tablă",
      sizeSmall: "Mică · 4 × 4",
      sizeMedium: "Medie · 7 × 7",
      sizeLarge: "Mare · 12 × 16",
      sizeNameSmall: "Mică",
      sizeNameMedium: "Medie",
      sizeNameLarge: "Mare",
      newGame: "Joc nou",
      rules: "Reguli",
      scoreLabel: "Scor",
      player1: "Jucătorul 1",
      player2: "Jucătorul 2",
      yourTurn: "Rândul tău",
      waiting: "Așteaptă",
      currentTurn: "La mutare",
      boardKicker: "Tabla de joc",
      moves: "Mutări",
      startMessage: "Jucătorul 1 începe. Alege o linie!",
      nextTurnMessage: "{player} este la mutare.",
      claimedOne: "{player} a închis un pătrat și continuă!",
      claimedMany: "{player} a închis {count} pătrate și continuă!",
      boardLabel: "Tabla de joc",
      boardLabelDetailed: "Tabla de joc, {rows} pe {cols} pătrate",
      edgeHorizontal: "Linie orizontală, rândul {row}, coloana {col}",
      edgeVertical: "Linie verticală, rândul {row}, coloana {col}",
      scrollHint: "Glisează pentru a explora tabla mare.",
      gameOver: "Joc încheiat",
      winner: "{player} câștigă!",
      draw: "Egalitate!",
      finalScore: "Scor final: {score1} – {score2}",
      playAgain: "Joacă din nou",
      footer: "Puncte și Pătrate · Un joc pentru două minți istețe",
      howToPlay: "Cum se joacă",
      rulesTitle: "Reguli simple, duel serios",
      close: "Închide",
      rule1: "Pe rând, fiecare jucător trasează o linie între două puncte vecine.",
      rule2: "Dacă închizi a patra latură a unui pătrat, îl revendici și mai joci o dată.",
      rule3: "Poți închide două pătrate dintr-o singură mutare — ambele sunt ale tale.",
      rule4: "După ce toate pătratele sunt ocupate, câștigă jucătorul cu scorul mai mare.",
      gotIt: "Am înțeles",
      confirmReset: "Jocul este în desfășurare. Vrei să începi un joc nou? Progresul actual se va pierde."
    },
    en: {
      pageTitle: "Dots and Boxes",
      pageDescription: "Dots and Boxes — the classic two-player game in Romanian and English.",
      skipToBoard: "Skip to the game board",
      eyebrow: "Classic game for two",
      title: "Dots and Boxes",
      languageLabel: "Language",
      letsPlay: "Let’s play",
      subtitle: "Close the boxes. Win the board.",
      boardSize: "Board size",
      sizeSmall: "Small · 4 × 4",
      sizeMedium: "Medium · 7 × 7",
      sizeLarge: "Large · 12 × 16",
      sizeNameSmall: "Small",
      sizeNameMedium: "Medium",
      sizeNameLarge: "Large",
      newGame: "New game",
      rules: "Rules",
      scoreLabel: "Score",
      player1: "Player 1",
      player2: "Player 2",
      yourTurn: "Your turn",
      waiting: "Waiting",
      currentTurn: "Current turn",
      boardKicker: "Game board",
      moves: "Moves",
      startMessage: "Player 1 starts. Pick a line!",
      nextTurnMessage: "{player} is up next.",
      claimedOne: "{player} closed a box and plays again!",
      claimedMany: "{player} closed {count} boxes and plays again!",
      boardLabel: "Game board",
      boardLabelDetailed: "Game board, {rows} by {cols} boxes",
      edgeHorizontal: "Horizontal line, row {row}, column {col}",
      edgeVertical: "Vertical line, row {row}, column {col}",
      scrollHint: "Swipe to explore the large board.",
      gameOver: "Game over",
      winner: "{player} wins!",
      draw: "It’s a draw!",
      finalScore: "Final score: {score1} – {score2}",
      playAgain: "Play again",
      footer: "Dots and Boxes · A game for two clever minds",
      howToPlay: "How to play",
      rulesTitle: "Simple rules, serious duel",
      close: "Close",
      rule1: "Take turns drawing one line between two neighboring dots.",
      rule2: "Close the fourth side of a box to claim it — then take another turn.",
      rule3: "One move can close two boxes. If it does, you claim both.",
      rule4: "When every box is claimed, the player with the higher score wins.",
      gotIt: "Got it",
      confirmReset: "A game is in progress. Start a new game? Your current progress will be lost."
    }
  };

  class GameModel {
    constructor(rows, cols) {
      this.rows = rows;
      this.cols = cols;
      this.horizontal = Array.from({ length: rows + 1 }, () => Array(cols).fill(null));
      this.vertical = Array.from({ length: rows }, () => Array(cols + 1).fill(null));
      this.boxes = Array.from({ length: rows }, () => Array(cols).fill(null));
      this.currentPlayer = 0;
      this.scores = [0, 0];
      this.moveCount = 0;
      this.finished = false;
    }

    playEdge(type, row, col) {
      if (this.finished || !this.isValidEdge(type, row, col)) {
        return null;
      }

      const edges = type === "h" ? this.horizontal : this.vertical;
      if (edges[row][col] !== null) {
        return null;
      }

      const owner = this.currentPlayer;
      edges[row][col] = owner;
      this.moveCount += 1;

      const claimed = [];
      for (const box of this.adjacentBoxes(type, row, col)) {
        if (this.boxes[box.row][box.col] === null && this.isBoxClosed(box.row, box.col)) {
          this.boxes[box.row][box.col] = owner;
          claimed.push(box);
        }
      }

      if (claimed.length > 0) {
        this.scores[owner] += claimed.length;
      } else {
        this.currentPlayer = 1 - this.currentPlayer;
      }

      this.finished = this.scores[0] + this.scores[1] === this.rows * this.cols;
      return { owner, claimed, finished: this.finished };
    }

    isValidEdge(type, row, col) {
      if (!Number.isInteger(row) || !Number.isInteger(col)) return false;
      if (type === "h") return row >= 0 && row <= this.rows && col >= 0 && col < this.cols;
      if (type === "v") return row >= 0 && row < this.rows && col >= 0 && col <= this.cols;
      return false;
    }

    adjacentBoxes(type, row, col) {
      const candidates = type === "h"
        ? [{ row: row - 1, col }, { row, col }]
        : [{ row, col: col - 1 }, { row, col }];

      return candidates.filter((box) => (
        box.row >= 0 && box.row < this.rows && box.col >= 0 && box.col < this.cols
      ));
    }

    isBoxClosed(row, col) {
      return this.horizontal[row][col] !== null
        && this.horizontal[row + 1][col] !== null
        && this.vertical[row][col] !== null
        && this.vertical[row][col + 1] !== null;
    }
  }

  class DotsAndBoxesApp {
    constructor() {
      this.language = this.readPreference(STORAGE_KEYS.language, ["ro", "en"], "ro");
      this.size = this.readPreference(STORAGE_KEYS.size, Object.keys(BOARD_SIZES), "small");
      this.status = { key: "startMessage", values: {}, scored: false };
      this.resultVisible = false;
      this.resultTimer = null;

      this.elements = {
        sizeSelect: document.querySelector("#board-size"),
        newGame: document.querySelector("#new-game"),
        rulesButton: document.querySelector("#rules-button"),
        rulesDialog: document.querySelector("#rules-dialog"),
        closeRules: document.querySelector("#close-rules"),
        gotIt: document.querySelector("#got-it"),
        boardScroll: document.querySelector("#game-board"),
        boardStage: document.querySelector("#board-stage"),
        boardSvg: document.querySelector("#board-svg"),
        boardName: document.querySelector("#board-heading [data-i18n]"),
        boardDimensions: document.querySelector(".board-dimensions"),
        moveCount: document.querySelector("#move-count"),
        scores: [document.querySelector("#score-player-1"), document.querySelector("#score-player-2")],
        playerCards: [...document.querySelectorAll("[data-player-card]")],
        turnBadges: [...document.querySelectorAll("[data-turn-badge]")],
        currentPlayer: document.querySelector("#current-player"),
        statusMessage: document.querySelector("#status-message"),
        scrollHint: document.querySelector("#scroll-hint"),
        gameOver: document.querySelector("#game-over"),
        resultIcon: document.querySelector("#result-icon"),
        resultTitle: document.querySelector("#result-title"),
        resultScore: document.querySelector("#result-score"),
        playAgain: document.querySelector("#play-again")
      };

      this.bindEvents();
      this.applyLanguage();
      this.startGame(this.size);
    }

    readPreference(key, allowed, fallback) {
      try {
        const value = localStorage.getItem(key);
        return allowed.includes(value) ? value : fallback;
      } catch {
        return fallback;
      }
    }

    savePreference(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {
        // Storage can be disabled; the game remains fully playable without it.
      }
    }

    t(key, values = {}) {
      let text = COPY[this.language][key] ?? key;
      for (const [name, value] of Object.entries(values)) {
        text = text.replaceAll(`{${name}}`, String(value));
      }
      return text;
    }

    playerName(player) {
      return this.t(player === 0 ? "player1" : "player2");
    }

    bindEvents() {
      document.querySelectorAll("[data-language]").forEach((button) => {
        button.addEventListener("click", () => this.setLanguage(button.dataset.language));
      });

      this.elements.sizeSelect.addEventListener("change", (event) => {
        const requestedSize = event.target.value;
        if (!this.confirmResetIfNeeded()) {
          event.target.value = this.size;
          return;
        }
        this.startGame(requestedSize);
      });

      this.elements.newGame.addEventListener("click", () => {
        if (this.confirmResetIfNeeded()) this.startGame(this.size);
      });

      this.elements.playAgain.addEventListener("click", () => this.startGame(this.size));
      this.elements.rulesButton.addEventListener("click", () => this.openRules());
      this.elements.closeRules.addEventListener("click", () => this.elements.rulesDialog.close());
      this.elements.gotIt.addEventListener("click", () => this.elements.rulesDialog.close());
      this.elements.rulesDialog.addEventListener("click", (event) => {
        if (event.target === this.elements.rulesDialog) this.elements.rulesDialog.close();
      });

      this.elements.boardSvg.addEventListener("click", (event) => {
        const edge = event.target.closest(".edge-group");
        if (edge) this.handleEdge(edge, false);
      });

      this.elements.boardSvg.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        const edge = event.target.closest(".edge-group");
        if (!edge) return;
        event.preventDefault();
        this.handleEdge(edge, true);
      });
    }

    confirmResetIfNeeded() {
      return !this.model || this.model.moveCount === 0 || this.model.finished || window.confirm(this.t("confirmReset"));
    }

    setLanguage(language) {
      if (!COPY[language] || language === this.language) return;
      this.language = language;
      this.savePreference(STORAGE_KEYS.language, language);
      this.applyLanguage();
    }

    applyLanguage() {
      document.documentElement.lang = this.language;
      document.title = this.t("pageTitle");
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) metaDescription.content = this.t("pageDescription");

      document.querySelectorAll("[data-i18n]").forEach((element) => {
        element.textContent = this.t(element.dataset.i18n);
      });

      document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
        element.setAttribute("aria-label", this.t(element.dataset.i18nAria));
      });

      document.querySelectorAll("[data-language]").forEach((button) => {
        const active = button.dataset.language === this.language;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });

      const brand = document.querySelector(".brand");
      if (brand) brand.setAttribute("aria-label", this.t("title"));
      if (this.model) {
        this.updateDynamicUI();
        this.updateEdgeLabels();
        if (this.resultVisible) this.renderResult();
      }
    }

    startGame(size) {
      if (this.resultTimer !== null) {
        window.clearTimeout(this.resultTimer);
        this.resultTimer = null;
      }
      this.size = Object.hasOwn(BOARD_SIZES, size) ? size : "small";
      const config = BOARD_SIZES[this.size];
      this.model = new GameModel(config.rows, config.cols);
      this.status = { key: "startMessage", values: {}, scored: false };
      this.resultVisible = false;

      this.savePreference(STORAGE_KEYS.size, this.size);
      this.elements.sizeSelect.value = this.size;
      this.elements.gameOver.hidden = true;
      this.elements.boardStage.dataset.size = this.size;
      this.elements.scrollHint.hidden = this.size !== "large";
      this.generateBoard();
      this.elements.boardScroll.scrollTo({ top: 0, left: 0, behavior: "auto" });
      this.updateDynamicUI();
    }

    generateBoard() {
      const { rows, cols } = this.model;
      const cell = 64;
      const padding = 28;
      const width = padding * 2 + cols * cell;
      const height = padding * 2 + rows * cell;
      const svg = this.elements.boardSvg;

      svg.replaceChildren();
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svg.setAttribute("aria-label", this.t("boardLabelDetailed", { rows, cols }));

      const boxesLayer = this.svgElement("g", { class: "boxes-layer", "aria-hidden": "true" });
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const group = this.svgElement("g", { "data-box": `${row}-${col}` });
          group.append(
            this.svgElement("rect", {
              class: "box-fill",
              x: padding + col * cell + 5,
              y: padding + row * cell + 5,
              width: cell - 10,
              height: cell - 10,
              rx: 12
            }),
            this.svgElement("text", {
              class: "box-mark",
              x: padding + col * cell + cell / 2,
              y: padding + row * cell + cell / 2
            })
          );
          boxesLayer.append(group);
        }
      }
      svg.append(boxesLayer);

      const edgesLayer = this.svgElement("g", { class: "edges-layer" });
      for (let row = 0; row <= rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          edgesLayer.append(this.createEdge(
            "h", row, col,
            padding + col * cell, padding + row * cell,
            padding + (col + 1) * cell, padding + row * cell
          ));
        }
      }
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col <= cols; col += 1) {
          edgesLayer.append(this.createEdge(
            "v", row, col,
            padding + col * cell, padding + row * cell,
            padding + col * cell, padding + (row + 1) * cell
          ));
        }
      }
      svg.append(edgesLayer);

      const dotsLayer = this.svgElement("g", { class: "dots-layer", "aria-hidden": "true" });
      for (let row = 0; row <= rows; row += 1) {
        for (let col = 0; col <= cols; col += 1) {
          dotsLayer.append(this.svgElement("circle", {
            class: "board-dot",
            cx: padding + col * cell,
            cy: padding + row * cell,
            r: 6
          }));
        }
      }
      svg.append(dotsLayer);
    }

    svgElement(tag, attributes) {
      const element = document.createElementNS(SVG_NS, tag);
      for (const [name, value] of Object.entries(attributes)) {
        element.setAttribute(name, value);
      }
      return element;
    }

    createEdge(type, row, col, x1, y1, x2, y2) {
      const group = this.svgElement("g", {
        class: "edge-group",
        role: "button",
        tabindex: "0",
        focusable: "true",
        "data-type": type,
        "data-row": row,
        "data-col": col,
        "aria-label": this.edgeLabel(type, row, col)
      });
      const coordinates = { x1, y1, x2, y2 };
      const hitArea = type === "h"
        ? { x: x1, y: y1 - 12, width: x2 - x1, height: 24, rx: 12 }
        : { x: x1 - 12, y: y1, width: 24, height: y2 - y1, rx: 12 };
      group.append(
        this.svgElement("line", { class: "edge-guide", ...coordinates }),
        this.svgElement("rect", { class: "edge-hit", ...hitArea })
      );
      return group;
    }

    edgeLabel(type, row, col) {
      return this.t(type === "h" ? "edgeHorizontal" : "edgeVertical", {
        row: row + 1,
        col: col + 1
      });
    }

    updateEdgeLabels() {
      this.elements.boardSvg.querySelectorAll(".edge-group:not(.is-selected)").forEach((edge) => {
        edge.setAttribute("aria-label", this.edgeLabel(
          edge.dataset.type,
          Number(edge.dataset.row),
          Number(edge.dataset.col)
        ));
      });
    }

    handleEdge(edge, focusNext) {
      if (this.model.finished || edge.classList.contains("is-selected")) return;
      const result = this.model.playEdge(
        edge.dataset.type,
        Number(edge.dataset.row),
        Number(edge.dataset.col)
      );
      if (!result) return;

      edge.classList.add("is-selected", `player-${result.owner + 1}`);
      edge.removeAttribute("role");
      edge.setAttribute("tabindex", "-1");
      edge.setAttribute("focusable", "false");
      edge.setAttribute("aria-disabled", "true");

      for (const box of result.claimed) {
        const boxGroup = this.elements.boardSvg.querySelector(`[data-box="${box.row}-${box.col}"]`);
        const ownerClass = `player-${result.owner + 1}`;
        boxGroup.querySelector(".box-fill").classList.add(ownerClass);
        const mark = boxGroup.querySelector(".box-mark");
        mark.textContent = result.owner === 0 ? "X" : "O";
        mark.classList.add(ownerClass);
      }

      if (result.claimed.length === 1) {
        this.status = {
          key: "claimedOne",
          values: { player: this.playerName(result.owner) },
          scored: true
        };
      } else if (result.claimed.length > 1) {
        this.status = {
          key: "claimedMany",
          values: { player: this.playerName(result.owner), count: result.claimed.length },
          scored: true
        };
      } else {
        this.status = {
          key: "nextTurnMessage",
          values: { player: this.playerName(this.model.currentPlayer) },
          scored: false
        };
      }

      this.updateDynamicUI();

      if (result.finished) {
        this.resultTimer = window.setTimeout(() => this.showResult(), 420);
      } else if (focusNext) {
        this.focusNextEdge(edge);
      }
    }

    focusNextEdge(currentEdge) {
      const available = [...this.elements.boardSvg.querySelectorAll(".edge-group:not(.is-selected)")];
      if (available.length === 0) return;
      const allEdges = [...this.elements.boardSvg.querySelectorAll(".edge-group")];
      const currentIndex = allEdges.indexOf(currentEdge);
      const next = allEdges.slice(currentIndex + 1).find((edge) => !edge.classList.contains("is-selected")) || available[0];
      next.focus();
    }

    updateDynamicUI() {
      const config = BOARD_SIZES[this.size];
      const player = this.model.currentPlayer;
      this.elements.boardName.textContent = this.t(config.nameKey);
      this.elements.boardDimensions.textContent = `${config.rows} × ${config.cols}`;
      this.elements.boardScroll.setAttribute("aria-label", this.t("boardLabelDetailed", config));
      this.elements.boardSvg.setAttribute("aria-label", this.t("boardLabelDetailed", config));
      this.elements.moveCount.textContent = String(this.model.moveCount);
      this.elements.scores.forEach((score, index) => {
        score.textContent = String(this.model.scores[index]);
      });

      this.elements.playerCards.forEach((card, index) => {
        const current = index === player && !this.model.finished;
        card.classList.toggle("is-current", current);
        if (current) card.setAttribute("aria-current", "true");
        else card.removeAttribute("aria-current");
      });

      this.elements.turnBadges.forEach((badge, index) => {
        badge.textContent = this.t(index === player && !this.model.finished ? "yourTurn" : "waiting");
      });

      const symbol = player === 0 ? "X" : "O";
      this.elements.currentPlayer.replaceChildren();
      const symbolElement = document.createElement("span");
      symbolElement.setAttribute("aria-hidden", "true");
      symbolElement.textContent = symbol;
      this.elements.currentPlayer.append(symbolElement, ` ${this.playerName(player)}`);

      this.elements.statusMessage.classList.toggle("player-two-status", player === 1);
      this.elements.statusMessage.classList.toggle("scored", this.status.scored);
      const statusText = this.elements.statusMessage.querySelector("span:last-child");
      statusText.textContent = this.t(this.status.key, this.localizedStatusValues());
    }

    localizedStatusValues() {
      const values = { ...this.status.values };
      if (this.status.key === "claimedOne" || this.status.key === "claimedMany") {
        const owner = this.model.currentPlayer;
        values.player = this.playerName(owner);
      } else if (this.status.key === "nextTurnMessage") {
        values.player = this.playerName(this.model.currentPlayer);
      }
      return values;
    }

    openRules() {
      if (typeof this.elements.rulesDialog.showModal === "function") {
        this.elements.rulesDialog.showModal();
      } else {
        this.elements.rulesDialog.setAttribute("open", "");
      }
    }

    showResult() {
      this.resultTimer = null;
      this.resultVisible = true;
      this.renderResult();
      this.elements.gameOver.hidden = false;
      this.elements.playAgain.focus();
    }

    renderResult() {
      const [score1, score2] = this.model.scores;
      if (score1 === score2) {
        this.elements.resultTitle.textContent = this.t("draw");
        this.elements.resultIcon.textContent = "=";
      } else {
        const winner = score1 > score2 ? 0 : 1;
        this.elements.resultTitle.textContent = this.t("winner", { player: this.playerName(winner) });
        this.elements.resultIcon.textContent = "★";
      }
      this.elements.resultScore.textContent = this.t("finalScore", { score1, score2 });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    window.dotsAndBoxes = new DotsAndBoxesApp();
  });
})();
