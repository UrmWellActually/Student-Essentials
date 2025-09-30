const easyBtn = document.querySelector(".easyBtn"),
    mediumBtn = document.querySelector(".middleBtn"),
    hardBtn = document.querySelector(".hardBtn"),
    inputValue = document.querySelector("input");

function resetInputStyle() {
    inputValue.style.color = "";
    inputValue.style.border = "";
}

easyBtn.addEventListener("click", () => {
    const value = parseInt(inputValue.value);
    if (isNaN(value) || value <= 0) {
        inputValue.style.color = "red";
        inputValue.style.border = "2px solid red";
        inputValue.value = "0";
        setTimeout(resetInputStyle, 1000); // Reset after 1 second
    } else {
        goToQuiz("easy");
    }
});

mediumBtn.addEventListener("click", () => {
    const value = parseInt(inputValue.value);
    if (isNaN(value) || value <= 0) {
        inputValue.style.color = "red";
        inputValue.style.border = "2px solid red";
        inputValue.value = "0";
        setTimeout(resetInputStyle, 1000); // Reset after 1 second
    } else {
        goToQuiz("medium");
    }
});

hardBtn.addEventListener("click", () => {
    const value = parseInt(inputValue.value);
    if (isNaN(value) || value <= 0) {
        inputValue.style.color = "red";
        inputValue.style.border = "2px solid red";
        inputValue.value = "0";
        setTimeout(resetInputStyle, 1000); // Reset after 1 second
    } else {
        goToQuiz("hard");
    }
});

function goToQuiz(level) {
    localStorage.setItem("difficulty", level);
    localStorage.setItem("questionCount", inputValue.value);
    window.location.href = "math-questions/math-questions.html";
}
