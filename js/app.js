/**
 * Fidel Kids - Main Application Architecture Controller Engine
 */

class FidelKidsApp {
  constructor() {
    // App State Management Engine Configuration
    this.state = {
      currentView: "view-home",
      activeLetter: null,
      quizCurrentQuestion: null,
      userProgress: {
        streak: 0,
        coins: 0,
        stars: 0,
        lives: 3,
      },
    };

    // Tracing Canvas State Machine Configuration
    this.canvasState = {
      isDrawing: false,
      ctx: null,
      drawnPoints: [],
      showGuide: true,
    };

    this.init();
  }

  init() {
    this.loadProgress();
    this.initDOMEvents();
    this.renderFidelGrid();
    this.setupCanvas();
    this.updateStatsUI();
    this.initFlashcardEngine();
  }

  /* --- DOM Navigation & Application Layout Control Engine --- */
  initDOMEvents() {
    // Dynamic Single Page Application routing transitions
    document.querySelectorAll(".link-view").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.currentTarget.getAttribute("data-target");
        this.switchView(target);
      });
    });

    // Remember to invoke: this.initFlashcardEngine(); in your app's init() constructor!

    // Interface Theme Configuration
    document.getElementById("theme-toggle").addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", nextTheme);
    });

    // Speech Recognition Setup
    document
      .getElementById("btn-speech-verify")
      .addEventListener("click", () => this.handleSpeechRecognition());

    // Native Speech Synthesis Setup
    document.getElementById("btn-audio-play").addEventListener("click", () => {
      if (this.state.activeLetter)
        this.speakWord(this.state.activeLetter.pronunciation);
    });

    // Overlay Triggers Closure
    document
      .getElementById("close-celebration")
      .addEventListener("click", () => {
        document.getElementById("celebration-overlay").classList.add("hidden");
      });
  }
  // Add inside your main FidelKidsApp class:
  initFlashcardEngine() {
    let currentCardIdx = 0;
    const cardEl = document.getElementById("interactive-flashcard");
    const modal = document.getElementById("flashcard-modal");

    // Open Modal Trigger
    document
      .getElementById("btn-flashcards-mode")
      ?.addEventListener("click", () => {
        currentCardIdx = 0;
        updateCardContent();
        modal.classList.remove("hidden");
      });

    // Flip Toggle Trigger
    cardEl.addEventListener("click", () => {
      cardEl.classList.toggle("is-flipped");
    });

    // Navigation Triggers
    document.getElementById("flash-next").addEventListener("click", (e) => {
      e.stopPropagation(); // Prevents flipping card when hitting button
      cardEl.classList.remove("is-flipped");
      setTimeout(() => {
        currentCardIdx = (currentCardIdx + 1) % AMHARIC_ALPHABET.length;
        updateCardContent();
      }, 150);
    });

    document.getElementById("flash-prev").addEventListener("click", (e) => {
      e.stopPropagation();
      cardEl.classList.remove("is-flipped");
      setTimeout(() => {
        currentCardIdx =
          (currentCardIdx - 1 + AMHARIC_ALPHABET.length) %
          AMHARIC_ALPHABET.length;
        updateCardContent();
      }, 150);
    });

    document.getElementById("close-flashcard").addEventListener("click", () => {
      modal.classList.add("hidden");
      cardEl.classList.remove("is-flipped");
    });

    function updateCardContent() {
      const item = AMHARIC_ALPHABET[currentCardIdx];
      document.getElementById("flashcard-letter").textContent = item.letter;
      document.getElementById("flashcard-graphic").textContent =
        item.exampleGraphic;
      document.getElementById("flashcard-word").textContent = item.exampleWord;
      document.getElementById("flashcard-meaning").textContent =
        item.exampleMeaning;
    }
  }

  switchView(viewId) {
    document
      .querySelectorAll(".view")
      .forEach((view) => view.classList.remove("active"));
    const targetView = document.getElementById(viewId);
    if (targetView) {
      targetView.classList.add("active");
      this.state.currentView = viewId;
    }

    // Action Initializations per specific Lifecycle targets
    if (viewId === "view-quiz") {
      this.generateQuizQuestion();
    }
  }

  /* --- Progress & Sync Persistency Subsystems (LocalStorage) --- */
  loadProgress() {
    const storedProgress = localStorage.getItem("fidel_kids_progress");
    if (storedProgress) {
      try {
        this.state.userProgress = JSON.parse(storedProgress);
      } catch (e) {
        console.error(
          "Corrupted local state database. Reinitializing structural configurations.",
          e,
        );
      }
    }
  }

  saveProgress() {
    localStorage.setItem(
      "fidel_kids_progress",
      JSON.stringify(this.state.userProgress),
    );
    this.updateStatsUI();
  }

  updateStatsUI() {
    document.getElementById("stat-streak").textContent =
      this.state.userProgress.streak;
    document.getElementById("stat-coins").textContent =
      this.state.userProgress.coins;
    document.getElementById("stat-stars").textContent =
      this.state.userProgress.stars;
    document.getElementById("stat-lives").textContent =
      this.state.userProgress.lives;
  }

  /* --- Learning Matrix Grid Generation Subsystem --- */
  renderFidelGrid() {
    const gridContainer = document.getElementById("fidel-grid-container");
    gridContainer.innerHTML = "";

    AMHARIC_ALPHABET.forEach((item) => {
      const card = document.createElement("div");
      card.className = "fidel-card animate-bounce";
      card.textContent = item.letter;
      card.addEventListener("click", () => this.loadLetterDetails(item));
      gridContainer.appendChild(card);
    });
  }

  loadLetterDetails(letterObj) {
    this.state.activeLetter = letterObj;
    document.getElementById("detail-title").textContent =
      `Learning Character: ${letterObj.letter}`;
    document.getElementById("detail-fidel").textContent = letterObj.letter;
    document.getElementById("detail-pronounce").textContent =
      letterObj.pronunciation;
    document.getElementById("detail-example-word").textContent =
      `${letterObj.exampleWord} (${letterObj.pronunciation})`;
    document.getElementById("detail-example-meaning").textContent =
      `${letterObj.exampleGraphic} ${letterObj.exampleMeaning}`;

    document.getElementById("speech-feedback").textContent = "";
    document.getElementById("canvas-feedback").textContent = "";

    this.switchView("view-details");
    this.resetCanvas();
    this.drawCanvasGuide();
  }

  /* --- Interactive Canvas Writing & Tracing Engine --- */
  setupCanvas() {
    const canvas = document.getElementById("tracing-canvas");
    this.canvasState.ctx = canvas.getContext("2d");

    // Auto-Verification Delay Timer Property
    this.canvasState.autoVerifyTimer = null;

    // Mouse Event Listeners
    canvas.addEventListener("mousedown", (e) =>
      this.startDrawing(e.offsetX, e.offsetY),
    );
    canvas.addEventListener("mousemove", (e) =>
      this.draw(e.offsetX, e.offsetY),
    );
    canvas.addEventListener("mouseup", () =>
      this.stopDrawingAndScheduleVerify(),
    );
    canvas.addEventListener("mouseleave", () =>
      this.stopDrawingAndScheduleVerify(),
    );

    // Touch Event Listeners (Mobile Interaction Support)
    canvas.addEventListener("touchstart", (e) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      this.startDrawing(touch.clientX - rect.left, touch.clientY - rect.top);
    });
    canvas.addEventListener(
      "touchmove",
      (e) => {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        this.draw(touch.clientX - rect.left, touch.clientY - rect.top);
        e.preventDefault();
      },
      { passive: false },
    );
    canvas.addEventListener("touchend", () =>
      this.stopDrawingAndScheduleVerify(),
    );

   
  }

  startDrawing(x, y) {
    // Clear any pending verification timers if the child starts drawing another stroke quickly
    if (this.canvasState.autoVerifyTimer) {
      clearTimeout(this.canvasState.autoVerifyTimer);
    }

    this.canvasState.isDrawing = true;
    this.canvasState.ctx.beginPath();
    this.canvasState.ctx.moveTo(x, y);
    this.canvasState.ctx.lineWidth = 14;
    this.canvasState.ctx.lineCap = "round";
    this.canvasState.ctx.strokeStyle = "#4caf50";
    this.canvasState.drawnPoints.push({ x, y });
  }

  draw(x, y) {
    if (!this.canvasState.isDrawing) return;
    this.canvasState.ctx.lineTo(x, y);
    this.canvasState.ctx.stroke();
    this.canvasState.drawnPoints.push({ x, y });
  }

  stopDrawingAndScheduleVerify() {
    if (!this.canvasState.isDrawing) return;
    this.canvasState.isDrawing = false;

    // Wait 250ms after input stops. This gives kids time to start a multi-stroke letter (like ለ or መ)
    this.canvasState.autoVerifyTimer = setTimeout(() => {
      this.verifyUserDrawing();
    }, 250);
  }

  resetCanvas() {
    if (this.canvasState.autoVerifyTimer) {
      clearTimeout(this.canvasState.autoVerifyTimer);
    }
    const canvas = document.getElementById("tracing-canvas");
    this.canvasState.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.canvasState.drawnPoints = [];
    document.getElementById("canvas-feedback").textContent = "";
  }

  startDrawing(x, y) {
    this.canvasState.isDrawing = true;
    this.canvasState.ctx.beginPath();
    this.canvasState.ctx.moveTo(x, y);
    this.canvasState.ctx.lineWidth = 12;
    this.canvasState.ctx.lineCap = "round";
    this.canvasState.ctx.strokeStyle = "#4caf50";
    this.canvasState.drawnPoints.push({ x, y });
  }

  draw(x, y) {
    if (!this.canvasState.isDrawing) return;
    this.canvasState.ctx.lineTo(x, y);
    this.canvasState.ctx.stroke();
    this.canvasState.drawnPoints.push({ x, y });
  }

  stopDrawing() {
    this.canvasState.isDrawing = false;
  }

  resetCanvas() {
    const canvas = document.getElementById("tracing-canvas");
    this.canvasState.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.canvasState.drawnPoints = [];
  }

  drawCanvasGuide() {
    if (!this.canvasState.showGuide || !this.state.activeLetter) return;

    const ctx = this.canvasState.ctx;
    ctx.save();
    ctx.strokeStyle = "rgba(255, 152, 0, 0.25)";
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    this.state.activeLetter.strokes.forEach((stroke) => {
      ctx.beginPath();
      stroke.forEach((point, idx) => {
        if (idx === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    });
    ctx.restore();
  }

  verifyUserDrawing() {
    if (this.canvasState.drawnPoints.length < 5) {
      return; // Not enough drawn data to verify yet
    }

    // 1. Reward the child for successful tracing
    this.state.userProgress.stars += 2;
    this.state.userProgress.coins += 5;
    this.saveProgress();

    // 2. Display success feedback and pop the celebration modal
    document.getElementById("canvas-feedback").className = "feedback-success";
    document.getElementById("canvas-feedback").textContent =
      "🎉 ኮከብ አግኝተሃል! Fantastic Tracing! +2 Stars";
    this.triggerCelebrationEffect();

    // 3. Continuous Learning Flow Engine Hook
    // Wait 1.5 seconds during the celebration, then automatically move to the next letter
    setTimeout(() => {
      this.loadNextLetterInSequence();
    }, 1500);
  }

  loadNextLetterInSequence() {
    if (!this.state.activeLetter) return;

    // Find the index position of our current letter in the master alphabet array
    const currentIndex = AMHARIC_ALPHABET.findIndex(
      (item) => item.id === this.state.activeLetter.id,
    );

    // Calculate the next index, wrapping back around to 0 if they finish the alphabet
    const nextIndex = (currentIndex + 1) % AMHARIC_ALPHABET.length;
    const nextLetter = AMHARIC_ALPHABET[nextIndex];

    // Safely clear out the feedback text before loading the next letter card
    document.getElementById("canvas-feedback").textContent = "";

    // Automatically re-initialize the view context with the next letter profile
    this.loadLetterDetails(nextLetter);
  }

  /* --- Web Speech Synthesis & Recognition API Infrastructure --- */
  speakWord(text) {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US"; // Uses global structural standard phonetics for backing
      window.speechSynthesis.speak(utterance);
    } else {
      alert(
        "Speech Synthesizer engine not supported by architecture framework.",
      );
    }
  }

  handleSpeechRecognition() {
    const feedbackEl = document.getElementById("speech-feedback");
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      feedbackEl.textContent =
        "🎙️ Device browser version lacks speech recording access compatibility models.";
      return;
    }

    feedbackEl.textContent =
      "🎙️ Listening... Speak the letter phonetics clear!";
    const recognizer = new SpeechRecognition();
    recognizer.lang = "en-US";
    recognizer.interimResults = false;
    recognizer.maxAlternatives = 1;

    recognizer.start();

    recognizer.onresult = (event) => {
      const spokenResult = event.results[0][0].transcript.toLowerCase();
      const targetPhonetic =
        this.state.activeLetter.pronunciation.toLowerCase();

      if (
        spokenResult.includes(targetPhonetic) ||
        targetPhonetic.includes(spokenResult)
      ) {
        feedbackEl.textContent = `🎯 Excellent! Detected: "${spokenResult}". Accuracy matches perfectly!`;
        this.state.userProgress.coins += 10;
        this.saveProgress();
      } else {
        feedbackEl.textContent = `⚡ Recognized: "${spokenResult}". Try matching standard pitch variant sound target: "${targetPhonetic}"`;
      }
    };

    recognizer.onerror = () => {
      feedbackEl.textContent =
        "❌ Recognition capture timeout error occurred. Please test again.";
    };
  }

  /* --- Interactive Gamified Quiz Engine Infrastructure --- */
  generateQuizQuestion() {
    if (AMHARIC_ALPHABET.length < 2) return;

    const feedbackToast = document.getElementById("quiz-feedback");
    feedbackToast.classList.add("hidden");

    // Choose random target letter element context
    const targetIndex = Math.floor(Math.random() * AMHARIC_ALPHABET.length);
    const correctLetter = AMHARIC_ALPHABET[targetIndex];
    this.state.quizCurrentQuestion = correctLetter;

    // Build unique options pool
    const optionsSet = new Set([correctLetter]);
    while (optionsSet.size < Math.min(4, AMHARIC_ALPHABET.length)) {
      const randomPick =
        AMHARIC_ALPHABET[Math.floor(Math.random() * AMHARIC_ALPHABET.length)];
      optionsSet.add(randomPick);
    }

    const sortedOptions = Array.from(optionsSet).sort(
      () => Math.random() - 0.5,
    );

    // Configure Prompt Element Systems listeners
    const promptAudioBtn = document.getElementById("quiz-prompt-sound");
    // Unbind previous elements listeners cleanly
    const clonedBtn = promptAudioBtn.cloneNode(true);
    promptAudioBtn.parentNode.replaceChild(clonedBtn, promptAudioBtn);

    clonedBtn.addEventListener("click", () =>
      this.speakWord(correctLetter.pronunciation),
    );
    this.speakWord(correctLetter.pronunciation); // Autoplays initial cue

    // Render target buttons interface layout grid
    const optionsContainer = document.getElementById("quiz-options-container");
    optionsContainer.innerHTML = "";

    sortedOptions.forEach((opt) => {
      const optBtn = document.createElement("button");
      optBtn.className = "quiz-option";
      optBtn.textContent = opt.letter;
      optBtn.addEventListener("click", () =>
        this.evaluateQuizSelection(opt.id),
      );
      optionsContainer.appendChild(optBtn);
    });
  }

  evaluateQuizSelection(selectedId) {
    const toast = document.getElementById("quiz-feedback");
    toast.classList.remove("hidden");

    if (selectedId === this.state.quizCurrentQuestion.id) {
      toast.className = "quiz-feedback-toast toast-success";
      toast.innerHTML =
        "<h3>🎉 Correct Choice!</h3><p>Excellent Listening Skills.</p>";
      this.state.userProgress.stars += 5;
      this.state.userProgress.coins += 5;
      this.state.userProgress.streak += 1;
      this.saveProgress();
      this.triggerCelebrationEffect();

      setTimeout(() => this.generateQuizQuestion(), 2000);
    } else {
      toast.className = "quiz-feedback-toast toast-error";
      toast.innerHTML =
        "<h3>😢 Not quite right</h3><p>Listen closer and try again!</p>";

      this.state.userProgress.lives = Math.max(
        0,
        this.state.userProgress.lives - 1,
      );
      this.state.userProgress.streak = 0;
      if (this.state.userProgress.lives === 0) {
        alert("Game Over! Let's refresh structural lifelines loop!");
        this.state.userProgress.lives = 3;
      }
      this.saveProgress();
    }
  }

  triggerCelebrationEffect() {
    const celebrationOverlay = document.getElementById("celebration-overlay");
    celebrationOverlay.classList.remove("hidden");

    // Auto dismisses clean reward frame display context
    setTimeout(() => {
      celebrationOverlay.classList.add("hidden");
    }, 1800);
  }
}

// Global Core Application Initialization Bootloader hook
window.addEventListener("DOMContentLoaded", () => {
  window.AppEngineInstance = new FidelKidsApp();
});
