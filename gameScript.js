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
  }
});

function initializeMainMenu() {
  // Handle difficulty selection
  const difficultyOptions = document.querySelectorAll('.difficulty');
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
    warningDiv.textContent = "";
  });
}

function initializeGame() {
  // get data from local storage, initialize the variables
  const username = localStorage.getItem('username') || 'Player';
  const difficulty = localStorage.getItem('difficulty') || 'easy'; 

  document.getElementById("username").textContent = username;
  const gameBoard = document.getElementById("game-board");

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
              document.getElementById("moves").textContent = moves;

              const [card1, card2] = flippedCards;
              if (card1.dataset.image === card2.dataset.image) {
                  matches++;
                  document.getElementById("matches").textContent = matches;
                  flippedCards = [];

                  if (matches === totalPairs) {
                      setTimeout(() => {
                          alert("🎉 You matched all pairs!");
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
  const timerInterval = setInterval(() => { 
      timer++;
      document.getElementById("time").textContent = timer;
  }, 1000);

  // new game
  document.getElementById("new-game").addEventListener("click", () => {
      location.reload();
  });

  // back to main page
  document.getElementById("main-menu").addEventListener("click", () => {
      window.location.href = "game.html";
  });
}
