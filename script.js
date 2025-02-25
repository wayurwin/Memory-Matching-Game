// Game Variables
let difficulty = 'medium';
let hintUsed = false;
let timer;
let timeLeft;
let totalCards;
let score = 0;
let currentCategory;

// Categories
const categories = {
    fruits: ['🍎', '🍌', '🍇', '🍉', '🍒', '🍓', '🍍', '🥭'],
    emojis: ['😀', '😂', '😍', '😎', '🤔', '😴', '🤯', '🥳'],
    animals: ['🐶', '🐱', '🦁', '🐯', '🐸', '🐼', '🐷', '🦊'],
    planets: ['🌍', '🪐', '🌕', '🌟', '🌞', '🌑', '🚀', '🛸'],
    history: [
        'images/aai_jijau.jpg', 'images/CSM.jpg', 'images/shivaji-maharaj.jpg', 'images/shahaji_maharaj.jpg',
        'images/yesubai.jpg', 'images/hambirrao_mohite.jpg', 'images/baji_prabhu.jpg', 'images/mudra.jpg'
    ]
};

// Difficulty Settings
const difficultySettings = {
    easy: { cardCount: 8, timer: 40 },
    medium: { cardCount: 16, timer: 30 },
    hard: { cardCount: 24, timer: 20 }
};

const flipSound = new Audio('sounds/flip.mp3');
const winSound = new Audio('sounds/win.mp3');

// Select Difficulty
function selectDifficulty(level, category) {
    difficulty = level;
    currentCategory = category;
    timeLeft = difficultySettings[difficulty].timer;
    totalCards = difficultySettings[difficulty].cardCount;
    startGame(category);
}

// Start Game
function startGame(category) {
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');

    const cardGrid = document.getElementById('card-grid');
    cardGrid.innerHTML = '';

    let items = categories[category];

    // Create pairs and shuffle
    const cards = [...items.slice(0, totalCards / 2), ...items.slice(0, totalCards / 2)];
    cards.sort(() => Math.random() - 0.5);

    // Render cards
    cards.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.item = item;
        card.dataset.category = category;
        card.innerHTML = '?';
        card.addEventListener('click', () => flipCard(card));
        cardGrid.appendChild(card);
    });

    score = 0;
    updateScore();
    hintUsed = false;
    startTimer();
    updateProgressBar();
}

// Timer Countdown
function startTimer() {
    const progressBar = document.getElementById('progress-bar');
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        progressBar.style.width = (timeLeft / difficultySettings[difficulty].timer) * 100 + '%';

        if (timeLeft <= 0) {
            clearInterval(timer);
            alert("Time's Up! Game Over");
            restartGame();
        }
    }, 1000);
}

// Show Hint
function showHint() {
    if (hintUsed) return;
    const unmatchedCards = document.querySelectorAll('.card:not(.flipped)');
    if (unmatchedCards.length > 0) {
        const randomCard = unmatchedCards[Math.floor(Math.random() * unmatchedCards.length)];
        revealCard(randomCard);
        setTimeout(() => hideCard(randomCard), 2000);
    }
    hintUsed = true;
}

// Flip Card
let flippedCards = [];
function flipCard(card) {
    if (flippedCards.length < 2 && !card.classList.contains('flipped')) {
        card.classList.add('flipped');
        revealCard(card);
        flippedCards.push(card);

        flipSound.play();

        if (flippedCards.length === 2) {
            setTimeout(checkMatch, 500);
        }
    }
}

// Reveal Card
function revealCard(card) {
    const category = card.dataset.category;
    if (category === 'history') {
        card.innerHTML = `<img src='${card.dataset.item}' alt='history-image' class='card-image' />`;
    } else {
        card.innerHTML = card.dataset.item;
    }
}

// Hide Card
function hideCard(card) {
    card.innerHTML = '?';
    card.classList.remove('flipped');
}

// Check Match
function checkMatch() {
    const [card1, card2] = flippedCards;

    if (card1.dataset.item === card2.dataset.item) {
        score++;
        updateScore();
        flippedCards = [];

        if (score === totalCards / 2) {
            clearInterval(timer);
            winSound.play();
            alert('You Win!');
            saveHighScore();
        }
    } else {
        hideCard(card1);
        hideCard(card2);
        flippedCards = [];
    }
}

// Update Score
function updateScore() {
    const scoreDisplay = document.getElementById('score');
    scoreDisplay.textContent = score;
    scoreDisplay.classList.add('score-update');
    setTimeout(() => scoreDisplay.classList.remove('score-update'), 300);
}

// Save High Score
function saveHighScore() {
    const playerName = prompt('Enter your name:');
    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    const newScore = { name: playerName, score: timeLeft };
    highScores.push(newScore);
    highScores.sort((a, b) => b.score - a.score);
    localStorage.setItem('highScores', JSON.stringify(highScores));

    displayLeaderboard();
}

// Display Leaderboard
function displayLeaderboard() {
    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.innerHTML = '<h3>Leaderboard</h3>';
    highScores.slice(0, 5).forEach(score => {
        const scoreElement = document.createElement('p');
        scoreElement.textContent = `${score.name}: ${score.score}s`;
        leaderboard.appendChild(scoreElement);
    });
}

// Restart Game
function restartGame() {
    clearInterval(timer);
    flippedCards = [];
    selectDifficulty(difficulty, currentCategory);
}
