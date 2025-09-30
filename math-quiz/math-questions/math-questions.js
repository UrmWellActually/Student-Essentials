const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const feedbackEl = document.getElementById("feedback");
const nextBtn = document.getElementById("next-btn");

const difficulty = localStorage.getItem("difficulty") || "easy";
let questionCount = parseInt(localStorage.getItem("questionCount")) || 5;

let operations = ["+", "-", "*", "/"];

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomOperation() {
    return operations[Math.floor(Math.random() * operations.length)];
}

// 👉 Generate a single question based on difficulty
function generateQuestion(level) {
    let num1, num2, op, correctAnswer;
    const lastTwoDigitsTarget = 25;

    switch (level) {
        case "easy":
            num1 = getRandomNumber(1, 20);
            num2 = getRandomNumber(1, 20);
            op = getRandomOperation();
            break;
        case "medium":
            num1 = getRandomNumber(10, 100);
            num2 = getRandomNumber(10, 100);
            op = getRandomOperation();
            break;
        case "hard":
            num1 = getRandomNumber(1000, 100000000);
            num2 = getRandomNumber(1000, 100000000);
            op = "+";
            break;
    }

    if (op === "*") {
        // To get a product ending in 25, both numbers must end in 5.
        // e.g., 15, 25, 35...
        const tens1 = getRandomNumber(1, 9); // 10-90
        const tens2 = getRandomNumber(1, 9); // 10-90
        num1 = tens1 * 10 + 5; // e.g., 15, 25...95
        num2 = tens2 * 10 + 5; // e.g., 15, 25...95
        correctAnswer = num1 * num2;
    } else if (op === "/") {
        num2 = getRandomNumber(1, 10);
        correctAnswer = getRandomNumber(1, 10);
        num1 = num2 * correctAnswer;
    } else {
        correctAnswer = eval(`${num1} ${op} ${num2}`);
    }

    let questionText = `${num1} ${op} ${num2}`;
    correctAnswer = Math.round(correctAnswer * 100) / 100;

    const options = generateOptions(correctAnswer, op);

    return {
        question: questionText,
        options: shuffle(options),
        correct: correctAnswer.toString()
    };
}

// 👉 Create multiple choice options including the correct one
function generateOptions(correctAnswer, op) {
    let options = new Set();
    const correctStr = correctAnswer.toString();
    options.add(correctStr);
    const decimalPlaces = correctStr.includes('.') ? correctStr.split('.')[1].length : 0;

    if (op === "*") {
        // Create a pool of potential wrong answers ending in 5 to avoid infinite loops
        const potentialOffsets = [-20, -10, 10, 20, -30, 30];
        const shuffledOffsets = shuffle(potentialOffsets);
        
        for (const offset of shuffledOffsets) {
            if (options.size >= 4) break;
            const wrongAnswerNum = parseFloat(correctAnswer) + offset;
            const wrongAnswerStr = (Math.round(wrongAnswerNum / 10) * 10 + 5).toString();
            options.add(wrongAnswerStr);
        }
    }
    
    // Fill any remaining slots with the standard method
    while (options.size < 4) { 
        let wrongAnswerStr;
        do { 
            let randomOffset;
            do { randomOffset = getRandomNumber(-10, 10); } while (randomOffset === 0);
            const wrongAnswerNum = parseFloat(correctAnswer) + randomOffset;
            wrongAnswerStr = Number(wrongAnswerNum).toFixed(decimalPlaces);
        } while (options.has(wrongAnswerStr));
        options.add(wrongAnswerStr);
    }

    return Array.from(options).map(val => val.toString());
}

// 🔀 Shuffle helper
function shuffle(array) {
    return [...array].sort(() => 0.5 - Math.random());
}

let selectedQuestions = [];
let currentIndex = 0;
let currentQuestion;
let correctCount = 0;
let questionStartTimes = [];
let questionEndTimes = [];
let answerSelected = false; // Flag to track if an answer has been chosen

function startQuiz() {
    selectedQuestions = [];
    correctCount = 0;
    questionStartTimes = [];
    questionEndTimes = [];
    for (let i = 0; i < questionCount; i++) {
        selectedQuestions.push(generateQuestion(difficulty));
    }
    selectedQuestions = shuffle(selectedQuestions);
    currentIndex = 0;
    loadQuestion();
}

function loadQuestion() {
    answerSelected = false; // Reset for the new question
    optionsEl.innerHTML = "";

    if (currentIndex >= selectedQuestions.length) {
        // Calculate average time per question
        let totalTime = 0;
        for (let i = 0; i < questionEndTimes.length; i++) {
            const startTime = questionStartTimes[i];
            const endTime = questionEndTimes[i];
            // Ensure both start and end times are valid numbers before calculating
            if (typeof startTime === 'number' && typeof endTime === 'number') {
                totalTime += (endTime - startTime);
            }
        }
        const avgTime = questionEndTimes.length > 0 ? (totalTime / questionEndTimes.length / 1000).toFixed(2) : "0.00";

        const quizContainer = document.querySelector('.quiz-container');
        quizContainer.innerHTML = `
            <h2 class="summary-title">🎉 Quiz Completed!</h2>
            <div class="summary-details">
                <div class="summary-item">
                    <span>Difficulty</span>
                    <span class="summary-value">${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
                </div>
                <div class="summary-item">
                    <span>Total Questions</span>
                    <span class="summary-value">${selectedQuestions.length}</span>
                </div>
                <div class="summary-item">
                    <span>Correct Answers</span>
                    <span class="summary-value">${correctCount}</span>
                </div>
                <div class="summary-item">
                    <span>Average Time</span>
                    <span class="summary-value">${avgTime}s</span>
                </div>
            </div>
            <button id="play-again-btn">Play Again</button>
        `;

        document.getElementById('play-again-btn').addEventListener('click', () => {
            window.location.href = '../math-quiz.html';
        });
        nextBtn.style.display = "none";
        return;
    }

    currentQuestion = selectedQuestions[currentIndex];
    questionEl.textContent = `Q${currentIndex + 1} of ${selectedQuestions.length}: ${currentQuestion.question}`;

    currentQuestion.options.forEach(option => {
        const button = document.createElement("button");
        button.textContent = option; 
        // button.classList.add("option-btn"); // This class is not in the CSS, but #options button is.
        button.onclick = () => checkAnswer(option);
        optionsEl.appendChild(button);
    });

    // Start timing for this question
    questionStartTimes[currentIndex] = Date.now();
    feedbackEl.textContent = "";
    nextBtn.style.display = "inline-block"; // Make next button visible immediately
}

function checkAnswer(selected) {
    // Prevent re-answering the same question
    if (answerSelected) return;
    answerSelected = true;

    // End timing for this question
    questionEndTimes[currentIndex] = Date.now();

    const isCorrect = selected === currentQuestion.correct;
    if (isCorrect) correctCount++;

    const buttons = optionsEl.querySelectorAll("button");
    buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === currentQuestion.correct) {
            btn.classList.add("correct");
        }
        if (btn.textContent === selected && !isCorrect) {
            btn.classList.add("incorrect");
        }
    });
}

nextBtn.addEventListener("click", () => {
    // If user clicks next without selecting an answer, treat it as wrong
    if (!answerSelected) {
        answerSelected = true; // Mark as answered to proceed on next click
        questionEndTimes[currentIndex] = Date.now(); // Record time

        // Highlight the correct answer for feedback
        const buttons = optionsEl.querySelectorAll("button");
        buttons.forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === currentQuestion.correct) {
                btn.classList.add("correct");
            }
        });
        // Wait for the user to click "Next" again to move on
        return;
    }

    currentIndex++;
    loadQuestion();
});

window.addEventListener("DOMContentLoaded", startQuiz);
