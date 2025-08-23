const inputBox = document.querySelector(".input-box");

function addNumber(number) {
    if (["-", "Unsolvable Question"].includes(inputBox.value)) {
        inputBox.value = number;
    } else {
        inputBox.value += number;
    }
}

function clearInput() {
    inputBox.value = "-";
}

function copyAnswer() {
    solveInput();
    navigator.clipboard.writeText(inputBox.value);
}

function solveInput() {
    setLocalStorage(inputBox.value);

    try {
        let result = eval(inputBox.value);
        if (isNaN(result)) {
            inputBox.value = "Unsolvable Question";
        } else {
            inputBox.value = result;
        }
    } catch (error) {
        inputBox.value = "Unsolvable Question";
    }
}

function setLocalStorage(value) {
    const lsValue = localStorage.getItem("historyAvailability");
    let historyArray = [];

    if (lsValue === "true") {
        historyArray = localStorage.getItem("history").split(",");
    }

    historyArray.push(value);

    if (historyArray.length > 10) {
        historyArray = historyArray.slice(-10);
    }

    localStorage.setItem("historyAvailability", "true");
    localStorage.setItem("history", historyArray.join(","));

    setFrontEnd();
}

function setFrontEnd() {
    const finalStringArr = localStorage.getItem("history").split(",");
    const numberOfTries = finalStringArr.length;

    for (let i = 0; i < 10; i++) {
        const historyEl = document.querySelector(`.history-element-${i + 1}`);
        const index = numberOfTries - i - 1;

        if (!historyEl) continue;

        if (index < 0) {
            historyEl.innerText = "";
        } else {
            let resultString = finalStringArr[index];
            let answer = "";
            
            // Check if the history item is the "Unsolvable" string
            if (resultString === "Unsolvable Question") {
                answer = "Unsolvable Question";
            } else {
                // Use a try-catch block to handle errors in the history
                try {
                    answer = eval(resultString);
                } catch (error) {
                    answer = "Unsolvable Question";
                }
            }

            let answerSpacedOutArr = `${resultString}=${answer}`.split("");
            let answerSpacedOut = "";

            for (let j = 0; j < answerSpacedOutArr.length; j++) {
                answerSpacedOut += `${answerSpacedOutArr[j]} `
            }

            historyEl.innerText = `${index + 1}) ${answerSpacedOut}`;
        }
    }
}

function clearHis() {
    localStorage.removeItem("historyAvailability");
    localStorage.removeItem("history");

    for (let i = 0; i < 10; i++) {
        const historyEl = document.querySelector(`.history-element-${i + 1}`);

        historyEl.innerText = "";
    }
}

setFrontEnd();