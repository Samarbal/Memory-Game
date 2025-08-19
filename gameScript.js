document.addEventListener("DOMContentLoaded", () => {
  // Check which page we're on
  const isMainMenu = document.getElementById("start-btn") !== null;
  const isGamePage = document.getElementById("game-board") !== null;

  if (isMainMenu) {
    // Main menu logic (game.html)
    initializeMainMenu();
  } else if (isGamePage) {
    // Game page logic (gamePage1.html)
    initializeGame();
  } else {
    // Neither page detected - log for debugging
    console.warn("Memory Game: Could not detect which page this is running on");
  }
});

function initializeMainMenu() {
  // Handle difficulty selection
  const difficultyOptions = document.querySelectorAll('.difficulty');
  if (difficultyOptions.length === 0) {
    console.error("Memory Game: No difficulty options found");
    return;
  }
  
  difficultyOptions.forEach(option => {
    option.addEventListener('click', () => {
      // Remove active class from all options
      difficultyOptions.forEach(opt => opt.classList.remove('active'));
      // Add active class to clicked option
      option.classList.add('active');
    });
  });

  // Handle start button with validation
  const usernameInput = document.getElementById("username");
  const warningDiv = document.getElementById("username-warning");
  const startBtn = document.getElementById("start-btn");

  // Check if all required elements exist
  if (!usernameInput) {
    console.error("Memory Game: Username input field not found");
    return;
  }
  if (!warningDiv) {
    console.error("Memory Game: Warning div not found");
    return;
  }
  if (!startBtn) {
    console.error("Memory Game: Start button not found");
    return;
  }

  startBtn.addEventListener("click", () => {
    const username = usernameInput.value.trim();
    if (!username) {
      warningDiv.textContent = "Please enter your name.";
      return;
    }
    if (username.length > 15) {
      warningDiv.textContent = "Name must be 15 characters or less.";
      return;
    }
    warningDiv.textContent = "";
    localStorage.setItem('username', username);
    
    // Get selected difficulty
    const selected = document.querySelector('.difficulty.active');
    const difficulty = selected ? selected.dataset.level : 'easy';
    localStorage.setItem('difficulty', difficulty);
    
    window.location.href = "gamePage1.html";
  });

  // Clear warning on input
  usernameInput.addEventListener("input", () => {
    if (warningDiv) {
      warningDiv.textContent = "";
    }
  });

  // Add leaderboard button functionality for main menu
  const leaderboardBtn = document.getElementById("leaderboard-btn");
  if (leaderboardBtn) {
    leaderboardBtn.addEventListener("click", () => {
      showLeaderboard();
    });
  }

  // Initialize leaderboard functionality for main menu
  initializeLeaderboard();
}

function initializeGame() {
  // Get data from localStorage and initialize variables
  const username = localStorage.getItem('username') || 'Player';
  const difficulty = localStorage.getItem('difficulty') || 'easy';

  // Cache DOM elements (store once to avoid repeated lookups)
  const domElements = {
    username: document.getElementById("username"),
    gameBoard: document.getElementById("game-board"),
    timer: document.getElementById("time"),
    moves: document.getElementById("moves"),
    matches: document.getElementById("matches"),
    newGameBtn: document.getElementById("new-game"),
    mainMenuBtn: document.getElementById("main-menu")
  };

  // Validate required elements
  if (!domElements.gameBoard) {
    console.error("Memory Game: Game board element not found");
    return;
  }

  // Update username display
  if (domElements.username) {
    domElements.username.textContent = username;
  } else {
    console.error("Memory Game: Username display element not found");
  }

  // Game state variables
  const gameState = {
    totalPairs: { easy: 4, medium: 6, hard: 8 }[difficulty],
    flippedCards: [],
    cardElements: [], // Store card elements for easy access
    matches: 0,
    moves: 0,
    timer: 0,
    timerInterval: null,
    isFlipping: false, // Flip animation lock
    gameEnded: false // Prevent timer resume
  };

  // Card images array
  const images = [
    "asset/img-1.png", "asset/img-2.png", "asset/img-3.png", "asset/img-4.png",
    "asset/img-5.png", "asset/img-6.png", "asset/img-7.png", "asset/img-8.png"
  ];

  // Helper function to update display elements safely
  function updateDisplay(elementKey, value) {
    if (domElements[elementKey]) {
      domElements[elementKey].textContent = value;
    } else {
      console.error(`Memory Game: ${elementKey} display element not found`);
    }
  }

  // Function to create card with proper structure (CSS-based flip)
  function createCard(imgSrc, index) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.image = imgSrc;
    card.dataset.index = index;

    // Create card structure for CSS-based flipping
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-back">
          <img src="asset/back-img.png" alt="Back of card" />
        </div>
        <div class="card-face card-front">
          <img src="${imgSrc}" alt="Card Image" />
        </div>
      </div>
    `;

    // Store card element for easy access
    gameState.cardElements.push(card);
    
    return card;
  }

  // Function to flip card (using CSS classes instead of innerHTML)
  function flipCard(card, showFront = true) {
    if (showFront) {
      card.classList.add("flipped");
    } else {
      card.classList.remove("flipped");
    }
  }

  // Function to disable card
  function disableCard(card) {
    card.classList.add("disabled");
  }

  // Function to mark card as matched
  function markCardAsMatched(card) {
    card.classList.add("matched");
    disableCard(card);
  }

  // Function to handle card click logic
  function handleCardClick(card) {
    // Prevent clicks during flip animation, on flipped cards, disabled cards, or when 2 cards are already flipped
    if (gameState.isFlipping || 
        card.classList.contains("flipped") || 
        card.classList.contains("disabled") ||
        gameState.flippedCards.length >= 2 ||
        gameState.gameEnded) {
      return;
    }

    // Set flip lock
    gameState.isFlipping = true;
    
    // Flip the card
    flipCard(card, true);
    gameState.flippedCards.push(card);

    // Release flip lock after animation
    setTimeout(() => {
      gameState.isFlipping = false;
    }, 200);

    // Check for matches when 2 cards are flipped
    if (gameState.flippedCards.length === 2) {
      gameState.moves++;
      updateDisplay('moves', gameState.moves);

      const [card1, card2] = gameState.flippedCards;
      
      if (card1.dataset.image === card2.dataset.image) {
        // Match found
        setTimeout(() => {
          markCardAsMatched(card1);
          markCardAsMatched(card2);
          gameState.matches++;
          updateDisplay('matches', gameState.matches);
          gameState.flippedCards = [];

          // Check for game completion
          if (gameState.matches === gameState.totalPairs) {
            handleGameWin();
          }
        }, 500);
      } else {
        // No match - flip cards back
        setTimeout(() => {
          flipCard(card1, false);
          flipCard(card2, false);
          gameState.flippedCards = [];
        }, 1000);
      }
    }
  }

  // Function to handle game win
  function handleGameWin() {
    gameState.gameEnded = true;
    
    // Stop the timer (ensure no resume)
    if (gameState.timerInterval) {
      clearInterval(gameState.timerInterval);
      gameState.timerInterval = null;
    }
    
    // Save the score
    const playerName = localStorage.getItem('username') || 'Player';
    const currentDifficulty = localStorage.getItem('difficulty') || 'easy';
    saveScore(playerName, currentDifficulty, gameState.timer, gameState.moves);
    
    // Show win screen after a short delay
    setTimeout(() => {
      showWinScreen(gameState.timer, gameState.moves, currentDifficulty);
    }, 500);
  }

  // Initialize game board
  function initializeBoard() {
    // Select and shuffle cards
    const selectedImages = images.slice(0, gameState.totalPairs);
    const cardPairs = [...selectedImages, ...selectedImages];
    cardPairs.sort(() => Math.random() - 0.5);

    // Clear board and reset classes
    domElements.gameBoard.innerHTML = "";
    domElements.gameBoard.className = "game-board"; // Reset classes
    gameState.cardElements = [];

    // Add difficulty-specific class to game board
    domElements.gameBoard.classList.add(difficulty);

    // Create and append cards
    cardPairs.forEach((imgSrc, index) => {
      const card = createCard(imgSrc, index);
      card.addEventListener("click", () => handleCardClick(card));
      domElements.gameBoard.appendChild(card);
    });
  }

  // Initialize timer
  function initializeTimer() {
    if (!domElements.timer) {
      console.error("Memory Game: Timer display element not found");
      return;
    }

    gameState.timerInterval = setInterval(() => {
      if (!gameState.gameEnded) {
        gameState.timer++;
        updateDisplay('timer', gameState.timer);
      }
    }, 1000);
  }

  // Initialize control buttons
  function initializeControls() {
    // New game button
    if (domElements.newGameBtn) {
      domElements.newGameBtn.addEventListener("click", () => {
        // Clean up timer before reload
        if (gameState.timerInterval) {
          clearInterval(gameState.timerInterval);
        }
        location.reload();
      });
    } else {
      console.error("Memory Game: New game button not found");
    }

    // Main menu button
    if (domElements.mainMenuBtn) {
      domElements.mainMenuBtn.addEventListener("click", () => {
        // Clean up timer before navigation
        if (gameState.timerInterval) {
          clearInterval(gameState.timerInterval);
        }
        window.location.href = "index.html";
      });
    } else {
      console.error("Memory Game: Main menu button not found");
    }
  }

  // Initialize the game
  initializeBoard();
  initializeTimer();
  initializeControls();
  initializeLeaderboard();
}

// ===== LEADERBOARD FUNCTIONS =====

// Save a new score to localStorage
function saveScore(playerName, difficulty, time, moves) {
    try {
        const scoreEntry = {
            playerName: playerName,
            difficulty: difficulty,
            time: time,
            moves: moves,
            date: new Date().toISOString()
        };

        const existingScores = JSON.parse(localStorage.getItem('memoryGameScores') || '[]');
        existingScores.push(scoreEntry);
        
        // Sort by time (faster = better) and then by moves (fewer = better)
        existingScores.sort((a, b) => {
            if (a.time !== b.time) {
                return a.time - b.time;
            }
            return a.moves - b.moves;
        });
        
        // Keep only top 50 scores
        const topScores = existingScores.slice(0, 50);
        localStorage.setItem('memoryGameScores', JSON.stringify(topScores));
        
        console.log('Score saved successfully:', scoreEntry);
        return true;
    } catch (error) {
        console.error('Error saving score:', error);
        return false;
    }
}

// Get top scores for a specific difficulty
function getTopScores(difficulty, limit = 10) {
    try {
        const allScores = JSON.parse(localStorage.getItem('memoryGameScores') || '[]');
        const difficultyScores = allScores.filter(score => score.difficulty === difficulty);
        return difficultyScores.slice(0, limit);
    } catch (error) {
        console.error('Error getting scores:', error);
        return [];
    }
}

// Format time from seconds to MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Display leaderboard for a specific difficulty
function displayLeaderboard(difficulty) {
    const leaderboardContent = document.getElementById('leaderboard-content');
    if (!leaderboardContent) {
        console.error('Leaderboard content element not found');
        return;
    }

    const scores = getTopScores(difficulty, 10);
    
    if (scores.length === 0) {
        leaderboardContent.innerHTML = `
            <div class="empty-leaderboard">
                <p>No scores yet for ${difficulty} difficulty!</p>
                <p>Complete a game to see your score here.</p>
            </div>
        `;
        return;
    }

    let html = '';
    scores.forEach((score, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        html += `
            <div class="leaderboard-entry">
                <div class="player-info">
                    <div class="player-name">${medal} ${score.playerName}</div>
                    <div class="player-date">${formatDate(score.date)}</div>
                </div>
                <div class="score-info">
                    <div class="score-time">${formatTime(score.time)}</div>
                    <div class="score-difficulty">${score.difficulty} • ${score.moves} moves</div>
                </div>
            </div>
        `;
    });
    
    leaderboardContent.innerHTML = html;
}

// Show the leaderboard modal
function showLeaderboard() {
    const modal = document.getElementById('leaderboard-modal');
    if (!modal) {
        console.error('Leaderboard modal not found');
        return;
    }
    
    modal.style.display = 'block';
    
    // Set default difficulty to current game difficulty or 'easy'
    const currentDifficulty = localStorage.getItem('difficulty') || 'easy';
    
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    const activeTab = document.querySelector(`[data-difficulty="${currentDifficulty}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Display leaderboard for current difficulty
    displayLeaderboard(currentDifficulty);
}

// Hide the leaderboard modal
function hideLeaderboard() {
    const modal = document.getElementById('leaderboard-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Initialize leaderboard functionality
function initializeLeaderboard() {
    // Add click handlers for difficulty tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const difficulty = btn.dataset.difficulty;
            displayLeaderboard(difficulty);
        });
    });

    // Add click handler for close button
    const closeBtn = document.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideLeaderboard);
    }

    // Close modal when clicking outside
    const modal = document.getElementById('leaderboard-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideLeaderboard();
            }
        });
    }

    // Add leaderboard button functionality
    const leaderboardBtn = document.getElementById('leaderboard');
    if (leaderboardBtn) {
        leaderboardBtn.addEventListener('click', showLeaderboard);
    } else {
        console.error('Leaderboard button not found');
    }
}

// ===== WIN SCREEN FUNCTIONS =====

// Show the win screen modal
function showWinScreen(time, moves, difficulty) {
    const modal = document.getElementById('win-modal');
    if (!modal) {
        console.error('Win modal not found');
        return;
    }
    
    // Update win screen stats
    const winTimeElement = document.getElementById('win-time');
    const winMovesElement = document.getElementById('win-moves');
    const winDifficultyElement = document.getElementById('win-difficulty');
    
    if (winTimeElement) {
        winTimeElement.textContent = `${time}s`;
    }
    if (winMovesElement) {
        winMovesElement.textContent = moves;
    }
    if (winDifficultyElement) {
        winDifficultyElement.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    }
    
    // Show the modal
    modal.style.display = 'block';
    
    // Initialize win screen event handlers
    initializeWinScreen();
}

// Hide the win screen modal
function hideWinScreen() {
    const modal = document.getElementById('win-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Initialize win screen functionality
function initializeWinScreen() {
    // Play again button
    const playAgainBtn = document.getElementById('play-again-btn');
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', () => {
            hideWinScreen();
            location.reload();
        });
    }
    
    // Main menu button
    const mainMenuWinBtn = document.getElementById('main-menu-win-btn');
    if (mainMenuWinBtn) {
        mainMenuWinBtn.addEventListener('click', () => {
            hideWinScreen();
            window.location.href = "index.html";
        });
    }
    
    // Leaderboard button
    const leaderboardWinBtn = document.getElementById('leaderboard-win-btn');
    if (leaderboardWinBtn) {
        leaderboardWinBtn.addEventListener('click', () => {
            hideWinScreen();
            showLeaderboard();
        });
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('win-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideWinScreen();
            }
        });
    }
}
