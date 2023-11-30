// Global Variables
const keyboard = document.getElementById("keyboard");
const keyboardKeys = keyboard.querySelectorAll("button");
let currentWord = "";
let currentRow = 0;

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

keyboardKeys.forEach((element) => {
    element.addEventListener("click", () => {
        if (element.className === "delete") {
            currentWord = currentWord.slice(0, -1);
            renderBoard();
        } else if (element.className === "enter") {
            if (currentWord.length === 5) {
                // Build a javascript object using the current string and make a post request to game.ts
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
