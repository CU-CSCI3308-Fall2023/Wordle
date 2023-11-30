const keyboard = document.getElementById("keyboard");
const keyboardKeys = keyboard.querySelectorAll("button");
const currentWord = "";

keyboardKeys.forEach((element) => {
    element.addEventListener("click", () => {
        if (element.className === "delete") {
            currentWord = currentWord.slice(0, -1);
            // Call a function that rerenders the letters on the current row of the game board
        } else if (element.className === "enter") {
            // Build a javascript object using the current string and make a post request to game.ts
        } else {
            currentWord += element.innerHTML;
            // Call a function that rerenders the letters on the current row of the game board
        }
    });
});
