// Imports
const axios = require("axios");

// Global Variables
const keyboard = document.getElementById("keyboard");
const keyboardKeys = keyboard.querySelectorAll("button");
let currentWord = "";
let currentRow = 0;

// Functions
const renderBoard = () => {
    const row = document.getElementById(`row-${currentRow}`);
    const values = row.querySelectorAll("p");
    const upperCaseWord = currentWord.toUpperCase();

    values.forEach((element, index) => {
        element.innerHTML = "";
        if (index < upperCaseWord.length) {
            element.innerHTML = upperCaseWord[index];
        }
    });
};

// Event Listeners
keyboardKeys.forEach((element) => {
    element.addEventListener("click", () => {
        if (element.className === "delete") {
            currentWord = currentWord.slice(0, -1);
            renderBoard();
        } else if (element.className === "enter") {
            if (currentWord.length === 5) {
                const request = {
                    gueass: currentWord,
                };

                axios.post("/game/start", request).then((response) => {});

                currentRow += 1;
                currentWord = "";
            }
        } else {
            if (currentWord.length < 5) {
                currentWord += element.innerHTML;
                renderBoard();
            }
        }
    });
});
