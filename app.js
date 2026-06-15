/**
 * English Flashcard App
 * 英単語フラッシュカード学習アプリケーション
 */

(function () {
    'use strict';

    // ========================================
    // State
    // ========================================
    let state = {
        allWords: [],
        activeWords: [],
        currentIndex: 0,
        isFlipped: false,
        selectedCount: 50,
        selectedOrder: 'sequential',
        selectedLevel: 'beginner',
        isStudying: false,
    };

    // ========================================
    // DOM Elements
    // ========================================
    const els = {};

    function cacheDOMElements() {
        els.setupScreen = document.getElementById('setupScreen');
        els.studyScreen = document.getElementById('studyScreen');
        els.flashcard = document.getElementById('flashcard');
        els.cardContainer = document.getElementById('cardContainer');

        // Card content
        els.cardWord = document.getElementById('cardWord');
        els.cardMeaning = document.getElementById('cardMeaning');
        els.cardExample = document.getElementById('cardExample');
        els.cardNumber = document.getElementById('cardNumber');
        els.cardNumberBack = document.getElementById('cardNumberBack');

        // Navigation
        els.prevButton = document.getElementById('prevButton');
        els.nextButton = document.getElementById('nextButton');
        els.navCurrent = document.getElementById('navCurrent');
        els.navTotal = document.getElementById('navTotal');

        // Progress
        els.progressBar = document.getElementById('progressBar');
        els.currentIndex = document.getElementById('currentIndex');
        els.totalWords = document.getElementById('totalWords');

        // Setup
        els.wordCountOptions = document.getElementById('wordCountOptions');
        els.orderOptions = document.getElementById('orderOptions');
        els.levelOptions = document.getElementById('levelOptions');
        els.startButton = document.getElementById('startButton');
        els.totalAvailable = document.getElementById('totalAvailable');

        // Actions
        els.resetButton = document.getElementById('resetButton');
        els.shuffleButton = document.getElementById('shuffleButton');
        els.backToSetupButton = document.getElementById('backToSetupButton');

        // Modal
        els.completionModal = document.getElementById('completionModal');
        els.completedCount = document.getElementById('completedCount');
        els.restartButton = document.getElementById('restartButton');
        els.newSetupButton = document.getElementById('newSetupButton');

        // Keyboard hint
        els.keyboardHint = document.getElementById('keyboardHint');
    }

    // ========================================
    // Data Loading
    // ========================================
    function loadWordData() {
        // Combine all word data arrays
        const allData = [];

        if (typeof wordData1 !== 'undefined') allData.push(...wordData1);
        if (typeof wordData2 !== 'undefined') allData.push(...wordData2);
        if (typeof wordData3 !== 'undefined') allData.push(...wordData3);

        state.allWords = allData;
        return allData;
    }

    function getWordsByLevel(level) {
        const total = state.allWords.length;
        if (level === 'all') return [...state.allWords];

        // Split words into 3 levels based on their position in the array
        const thirdSize = Math.ceil(total / 3);

        switch (level) {
            case 'beginner':
                return state.allWords.slice(0, thirdSize);
            case 'intermediate':
                return state.allWords.slice(thirdSize, thirdSize * 2);
            case 'advanced':
                return state.allWords.slice(thirdSize * 2);
            default:
                return [...state.allWords];
        }
    }

    // ========================================
    // Shuffle (Fisher-Yates)
    // ========================================
    function shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // ========================================
    // Setup Screen Logic
    // ========================================
    function initSetup() {
        const words = loadWordData();
        els.totalAvailable.textContent = words.length;

        // Word count options
        els.wordCountOptions.addEventListener('click', (e) => {
            const btn = e.target.closest('.count-option');
            if (!btn) return;
            els.wordCountOptions.querySelectorAll('.count-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            state.selectedCount = parseInt(btn.dataset.count, 10);
        });

        // Order options
        els.orderOptions.addEventListener('click', (e) => {
            const btn = e.target.closest('.order-option');
            if (!btn) return;
            els.orderOptions.querySelectorAll('.order-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            state.selectedOrder = btn.dataset.order;
        });

        // Level options
        els.levelOptions.addEventListener('click', (e) => {
            const btn = e.target.closest('.level-option');
            if (!btn) return;
            els.levelOptions.querySelectorAll('.level-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            state.selectedLevel = btn.dataset.level;
        });

        // Start button
        els.startButton.addEventListener('click', startStudy);
    }

    function startStudy() {
        let pool = getWordsByLevel(state.selectedLevel);

        if (state.selectedOrder === 'random') {
            pool = shuffle(pool);
        }

        // Limit to selected count
        const count = Math.min(state.selectedCount, pool.length);
        state.activeWords = pool.slice(0, count);
        state.currentIndex = 0;
        state.isFlipped = false;
        state.isStudying = true;

        // Switch screens
        els.setupScreen.classList.add('hidden');
        els.studyScreen.classList.remove('hidden');

        // Update totals
        els.navTotal.textContent = state.activeWords.length;
        els.totalWords.textContent = state.activeWords.length;

        // Show card
        updateCard();
        updateProgress();
        updateNavButtons();

        // Show keyboard hint on desktop
        showKeyboardHint();
    }

    // ========================================
    // Card Display
    // ========================================
    function updateCard(animate = true) {
        const word = state.activeWords[state.currentIndex];
        if (!word) return;

        // Reset flip
        state.isFlipped = false;
        els.flashcard.classList.remove('flipped');

        // Update content
        const num = `#${state.currentIndex + 1}`;
        els.cardNumber.textContent = num;
        els.cardNumberBack.textContent = num;
        els.cardWord.textContent = word.word;
        els.cardMeaning.textContent = word.meaning;
        els.cardExample.textContent = word.example;

        // Animate entrance
        if (animate) {
            els.flashcard.classList.remove('card-enter');
            // Force reflow
            void els.flashcard.offsetWidth;
            els.flashcard.classList.add('card-enter');
        }
    }

    function flipCard() {
        state.isFlipped = !state.isFlipped;
        if (state.isFlipped) {
            els.flashcard.classList.add('flipped');
        } else {
            els.flashcard.classList.remove('flipped');
        }
    }

    // ========================================
    // Navigation
    // ========================================
    function goToPrevious() {
        if (state.currentIndex > 0) {
            state.currentIndex--;
            updateCard();
            updateProgress();
            updateNavButtons();
        }
    }

    function goToNext() {
        if (state.currentIndex < state.activeWords.length - 1) {
            state.currentIndex++;
            updateCard();
            updateProgress();
            updateNavButtons();
        } else {
            // Reached the end - show completion
            showCompletion();
        }
    }

    function updateNavButtons() {
        els.prevButton.disabled = state.currentIndex === 0;
        els.navCurrent.textContent = state.currentIndex + 1;
    }

    function updateProgress() {
        const progress = ((state.currentIndex + 1) / state.activeWords.length) * 100;
        els.progressBar.style.width = `${progress}%`;
        els.currentIndex.textContent = state.currentIndex + 1;
    }

    // ========================================
    // Actions
    // ========================================
    function resetStudy() {
        state.currentIndex = 0;
        state.isFlipped = false;
        els.flashcard.classList.remove('flipped');
        updateCard();
        updateProgress();
        updateNavButtons();
    }

    function shuffleWords() {
        state.activeWords = shuffle(state.activeWords);
        state.currentIndex = 0;
        state.isFlipped = false;
        els.flashcard.classList.remove('flipped');
        updateCard();
        updateProgress();
        updateNavButtons();
    }

    function goBackToSetup() {
        state.isStudying = false;
        els.studyScreen.classList.add('hidden');
        els.setupScreen.classList.remove('hidden');
        els.completionModal.classList.add('hidden');
    }

    // ========================================
    // Completion Modal
    // ========================================
    function showCompletion() {
        els.completedCount.textContent = state.activeWords.length;
        els.completionModal.classList.remove('hidden');
    }

    function hideCompletion() {
        els.completionModal.classList.add('hidden');
    }

    // ========================================
    // Keyboard Shortcuts
    // ========================================
    function handleKeyboard(e) {
        if (!state.isStudying) return;

        // Don't handle if modal is open
        if (!els.completionModal.classList.contains('hidden')) {
            if (e.key === 'Escape') {
                hideCompletion();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                goToPrevious();
                break;
            case 'ArrowRight':
                e.preventDefault();
                goToNext();
                break;
            case ' ':
            case 'Enter':
                e.preventDefault();
                flipCard();
                break;
            case 'Escape':
                goBackToSetup();
                break;
        }
    }

    // ========================================
    // Swipe Support (touch)
    // ========================================
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    function handleTouchStart(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }

    function handleTouchEnd(e) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }

    function handleSwipe() {
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        const threshold = 50;

        // Only act on horizontal swipes
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                goToPrevious();
            } else {
                goToNext();
            }
        }
    }

    // ========================================
    // Keyboard Hint
    // ========================================
    function showKeyboardHint() {
        // Only show on devices that likely have a keyboard
        if (window.matchMedia('(hover: hover)').matches) {
            els.keyboardHint.classList.add('visible');
            setTimeout(() => {
                els.keyboardHint.classList.remove('visible');
            }, 4000);
        }
    }

    // ========================================
    // Event Listeners
    // ========================================
    function bindEvents() {
        // Card flip
        els.cardContainer.addEventListener('click', flipCard);

        // Navigation buttons
        els.prevButton.addEventListener('click', goToPrevious);
        els.nextButton.addEventListener('click', goToNext);

        // Action buttons
        els.resetButton.addEventListener('click', resetStudy);
        els.shuffleButton.addEventListener('click', shuffleWords);
        els.backToSetupButton.addEventListener('click', goBackToSetup);

        // Modal buttons
        els.restartButton.addEventListener('click', () => {
            hideCompletion();
            resetStudy();
        });
        els.newSetupButton.addEventListener('click', () => {
            hideCompletion();
            goBackToSetup();
        });

        // Keyboard
        document.addEventListener('keydown', handleKeyboard);

        // Touch/Swipe on card
        els.cardContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
        els.cardContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    // ========================================
    // Initialize
    // ========================================
    function init() {
        cacheDOMElements();
        bindEvents();
        initSetup();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
