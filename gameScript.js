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
}

function initializeGame() {
  // get data from local storage, initialize the variables
  const username = localStorage.getItem('username') || 'Player';
  const difficulty = localStorage.getItem('difficulty') || 'easy'; 

  // Safely update username display
  const usernameElement = document.getElementById("username");
  if (usernameElement) {
    usernameElement.textContent = username;
  } else {
    console.error("Memory Game: Username display element not found");
  }

  const gameBoard = document.getElementById("game-board");
  if (!gameBoard) {
    console.error("Memory Game: Game board element not found");
    return;
  }

  // number of pairs using key-value lookups instead of the traditional if statement 
  const totalPairs = { easy: 4, medium: 6, hard: 8 }[difficulty];

  // cards list 
  const images = [
      "asset/img-1.png",
      "asset/img-2.png",
      "asset/img-3.png",
      "asset/img-4.png",
      "asset/img-5.png",
      "asset/img-6.png",
      "asset/img-7.png",
      "asset/img-8.png"
  ];

  // select the images for the game
  let selected = images.slice(0, totalPairs);
  // repeat the images
  let cards = [...selected, ...selected]; 

  // shuffle the cards
  cards.sort(() => Math.random() - 0.5);

  // create the cards
  const board = document.getElementById("game-board");
  board.innerHTML = ""; // clear previous if any

  // Handle Card Flipping and Matching
  let flippedCards = [];
  let matches = 0;
  let moves = 0;

  cards.forEach((imgSrc) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.dataset.image = imgSrc;

      // back card
      card.innerHTML = `<img src="asset/back-img.png" class="card-back" alt="Back of card" />`;

      card.addEventListener("click", () => {
          if (card.classList.contains("flipped") || flippedCards.length >= 2) return;

          card.classList.add("flipped");
          card.innerHTML = `<img src="${imgSrc}" alt="Card Image" />`;
          flippedCards.push(card);

          if (flippedCards.length === 2) {
              moves++;
              // Safely update moves display
              const movesElement = document.getElementById("moves");
              if (movesElement) {
                movesElement.textContent = moves;
              } else {
                console.error("Memory Game: Moves display element not found");
              }

              const [card1, card2] = flippedCards;
              if (card1.dataset.image === card2.dataset.image) {
                  matches++;
                  // Safely update matches display
                  const matchesElement = document.getElementById("matches");
                  if (matchesElement) {
                    matchesElement.textContent = matches;
                  } else {
                    console.error("Memory Game: Matches display element not found");
                  }
                  flippedCards = [];

                  if (matches === totalPairs) {
                      // Save the score
                      const playerName = localStorage.getItem('username') || 'Player';
                      const currentDifficulty = localStorage.getItem('difficulty') || 'easy';
                      saveScore(playerName, currentDifficulty, timer, moves);
                      
                      setTimeout(() => {
                          alert("🎉 You matched all pairs!");
                          // Show leaderboard after a short delay
                          setTimeout(() => {
                              showLeaderboard();
                          }, 1000);
                      }, 500);
                  }
              } else {
                  setTimeout(() => {
                      card1.classList.remove("flipped");
                      card2.classList.remove("flipped");

                      card1.innerHTML = `<img src="asset/back-img.png" class="card-back" alt="Back of card" />`;
                      card2.innerHTML = `<img src="asset/back-img.png" class="card-back" alt="Back of card" />`;

                      flippedCards = [];
                  }, 1000);
              }
          }
      });

      board.appendChild(card);
  });

  // timer
  let timer = 0;
  const timerElement = document.getElementById("time");
  if (!timerElement) {
    console.error("Memory Game: Timer display element not found");
  }
  
  const timerInterval = setInterval(() => { 
      timer++;
      if (timerElement) {
        timerElement.textContent = timer;
      }
  }, 1000);

  // new game button
  const newGameBtn = document.getElementById("new-game");
  if (newGameBtn) {
    newGameBtn.addEventListener("click", () => {
        location.reload();
    });
  } else {
    console.error("Memory Game: New game button not found");
  }

  // back to main page button
  const mainMenuBtn = document.getElementById("main-menu");
  if (mainMenuBtn) {
    mainMenuBtn.addEventListener("click", () => {
        window.location.href = "game.html";
    });
  } else {
    console.error("Memory Game: Main menu button not found");
  }

  // Initialize leaderboard functionality
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
