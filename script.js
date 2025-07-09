document.addEventListener('DOMContentLoaded', function() {
    // Game data
    const gameData = [
        {
            item: "Mosquito Net",
            image: "images/mosquito-net.png",
            options: ["Health Science", "Food Science"],
            correctAnswer: "Health Science",
            audio: "audio/mosquito-net.mp3",
            feedback: "Great choice! Mosquito nets protect us from malaria — that's Health Science in action."
        },
        {
            item: "Fertilizer",
            image: "images/fertilizer.png",
            options: ["Agricultural Science", "Physics"],
            correctAnswer: "Agricultural Science",
            audio: "audio/fertilizer.mp3",
            feedback: "Yes! Fertilizer improves soil nutrients for crops — a key part of Agricultural Science."
        },
        {
            item: "Solar Panel",
            image: "images/solar-panel.jpg",
            options: ["Biology", "Physics"],
            correctAnswer: "Physics",
            audio: "audio/solar-panel.mp3",
            feedback: "Good job! Solar panels change sunlight into energy — that's pure Physics at work."
        },
        {
            item: "Bar Soap",
            image: "images/soap.jpg",
            options: ["Chemistry", "Biology"],
            correctAnswer: "Chemistry",
            audio: "audio/soap.mp3",
            feedback: "Excellent! Soap is made through a chemical process called saponification — Chemistry!"
        }
    ];

    // DOM elements
    const introScreen = document.querySelector('.intro-screen');
    const gameContainer = document.querySelector('.game-container');
    const completionScreen = document.querySelector('.completion-screen');
    const startBtn = document.getElementById('start-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const itemsGrid = document.querySelector('.items-grid');
    const progressText = document.getElementById('progress');
    const progressFill = document.querySelector('.progress-fill');
    const feedbackPopup = document.querySelector('.feedback-popup');
    const feedbackText = document.getElementById('feedback-text');
    const continueBtn = document.getElementById('continue-btn');
    const introAudio = document.getElementById('intro-audio');
    const completionAudio = document.getElementById('completion-audio');

    // Game state
    let currentItem = null;
    let score = 0;
    let completedItems = 0;
    const totalItems = gameData.length;
    let currentAudio = null;
    const correctSound = new Audio('audio/ding.mp3'); // Add ding.mp3 to your audio folder

    // Initialize the game
    function initGame() {
        // Create item cards
        itemsGrid.innerHTML = '';
        gameData.forEach((itemData, index) => {
            const itemCard = document.createElement('div');
            itemCard.className = 'item-card';
            itemCard.dataset.index = index;

            itemCard.innerHTML = `
                <div class="item-image" style="background-image: url('${itemData.image}')"></div>
                <div class="item-label">${itemData.item}</div>
                <div class="options-container">
                    ${itemData.options.map(option =>
                        `<button class="option-btn" data-option="${option}">${option}</button>`
                    ).join('')}
                </div>
            `;

            itemsGrid.appendChild(itemCard);
        });

        // Reset game state
        score = 0;
        completedItems = 0;
        updateProgress();
    }

    // Update progress tracker
    function updateProgress() {
        const percentage = Math.round((completedItems / totalItems) * 100);
        progressText.textContent = `${percentage}% Complete`;
        progressFill.style.width = `${percentage}%`;
    }

    // Create confetti effect
    function createConfetti(element) {
        const colors = ['#f00', '#0f0', '#00f', '#ff0', '#f0f'];
        const rect = element.getBoundingClientRect();

        for (let i = 0; i < 15; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${rect.left + rect.width/2 - 5}px`;
            confetti.style.top = `${rect.top}px`;
            confetti.style.backgroundColor = colors[i % colors.length];
            document.body.appendChild(confetti);

            setTimeout(() => {
                confetti.remove();
            }, 2000);
        }
    }

    // Show feedback
    function showFeedback(isCorrect, feedback) {
        feedbackText.textContent = feedback;
        feedbackPopup.classList.remove('hidden');

        if (isCorrect) {
            // Play ding sound
            correctSound.play();

            // Stop any currently playing audio
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }

            // Play new audio and track it
            currentAudio = new Audio(currentItem.audio);
            currentAudio.play();

            // When this audio finishes, check if we should play completion audio
            currentAudio.onended = function() {
                if (completedItems === totalItems) {
                    setTimeout(() => {
                        completionAudio.play();
                    }, 500);
                }
            };
        }
    }

    // Event listeners
    startBtn.addEventListener('click', function() {
        introScreen.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        initGame();
        introAudio.play();
    });

    playAgainBtn.addEventListener('click', function() {
        completionScreen.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        initGame();
    });

    itemsGrid.addEventListener('click', function(e) {
        // Handle item card click to show options
        const itemCard = e.target.closest('.item-card');
        if (itemCard && !e.target.classList.contains('option-btn')) {
            // Remove highlight from all cards
            document.querySelectorAll('.item-card').forEach(card => {
                card.classList.remove('card-highlight');
            });

            // Highlight clicked card
            itemCard.classList.add('card-highlight');

            // Hide options on all cards
            document.querySelectorAll('.options-container').forEach(container => {
                container.style.display = 'none';
            });

            // Show options on clicked card
            const optionsContainer = itemCard.querySelector('.options-container');
            optionsContainer.style.display = 'flex';

            // Set current item
            const itemIndex = itemCard.dataset.index;
            currentItem = gameData[itemIndex];
        }

        // Handle option button click
        const optionBtn = e.target.closest('.option-btn');
        if (optionBtn) {
            const selectedOption = optionBtn.dataset.option;
            const isCorrect = selectedOption === currentItem.correctAnswer;

            // Visual feedback
            const itemCard = optionBtn.closest('.item-card');
            itemCard.classList.add(isCorrect ? 'glow' : 'shake');

            // Remove animation classes after animation ends
            itemCard.addEventListener('animationend', function() {
                itemCard.classList.remove('glow', 'shake', 'card-highlight');
            }, { once: true });

            // Hide options
            itemCard.querySelector('.options-container').style.display = 'none';

            // Provide appropriate feedback
            if (isCorrect) {
                score++;
                completedItems++;
                updateProgress();
                createConfetti(itemCard); // Add confetti effect
                showFeedback(true, currentItem.feedback);
            } else {
                showFeedback(false, "Try again. What science explains how this works?");
            }

            // Check if game is complete
            if (completedItems === totalItems) {
                setTimeout(() => {
                    gameContainer.classList.add('hidden');
                    completionScreen.classList.remove('hidden');
                }, 1000);
            }
        }
    });

    continueBtn.addEventListener('click', function() {
        feedbackPopup.classList.add('hidden');
    });
});