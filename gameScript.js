const difficultyOptions = document.querySelectorAll('.difficulty');
let selectedDifficulty = 'easy';

difficultyOptions.forEach(option => {
    option.addEventListener('click', () => {
        difficultyOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        selectedDifficulty = option.dataset.level;
    });
});

document.getElementById('start-btn').addEventListener('click', () => {
    const username = document.getElementById('username').value.trim();
    if (!username) {
        alert('Please enter your name');
        return;
    }
    // Store the username and difficulty in local storage
    localStorage.setItem('username', username);
    localStorage.setItem('difficulty', selectedDifficulty);

    // Redirect to the game page
    window.location.href = 'gamePage1.html';
});

// Game logic
const username = localStorage.getItem('username') || 'Player';
const difficulty = localStorage.getItem('difficulty') || 'easy';
document.getElementById('username').textContent = username;

const gameBoard = document.getElementById('game-board');
let totalPairs = {easy: 4, medium: 6, hard: 8} [difficulty];
let cards = [];
let flippedCards = [];
let matches = 0;
let moves = 0;
let time = 0;
let timerInterval;

//  genrate pairs 
const emojis = ["🍎", "🍌", "🍇", "🍒", "🍓", "🥝", "🍍", "🍉"];
let selectedEmojis = emojis.slice(0, totalPairs);
cards = [...selectedEmojis, ...selectedEmojis];

// Shuffle the cards
cards.sort(() => Math.random() - 0.5);



