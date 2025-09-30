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
            
            try {
                // Use a safer evaluation method
                answer = new Function('return ' + resultString)();
                if (isNaN(answer) || !isFinite(answer)) {
                    answer = "Unsolvable Question";
                }
            } catch (error) {
                answer = "Unsolvable Question";
            }

            let formattedHistory;
            if (answer === "Unsolvable Question") {
                formattedHistory = "Unsolvable Question";
            } else {
                // Add spacing only for valid calculations
                const spacedString = `${resultString}=${answer}`.split('').join(' ');
                formattedHistory = spacedString;
            }

            historyEl.innerText = `${index + 1}) ${formattedHistory}`;
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