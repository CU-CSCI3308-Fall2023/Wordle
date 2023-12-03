/**
 * @type {string[]}
 */
const guesses = [];

/**
 * @type {number|undefined}
 */
let gameId;

/**
 * @typedef {Object} GuessLetterFeedback
 * @property {string} letter
 * @property {number} index
 * @property {string} guess
 * @property {boolean} isInWord
 * @property {boolean} isInCorrectPosition
 */

/**
 * @typedef {Object} GuessResponse
 * @property {number} gameId
 * @property {number} remainingGuesses
 * @property {boolean} canKeepGuessing
 * @property {boolean} won
 * @property {number} currentPoints
 * @property {GuessLetterFeedback[][]} guesses
 */

/**
 * Handle the key press on the interactive keyboard
 * @param event {MouseEvent<HTMLButtonElement>} Key pressed on the interactive keyboard
 */
function handleInteractiveKeyPress(event) {
  const rowIdx = Math.max(guesses.length - 1, 0);

  const guess = guesses[rowIdx];
  if (guess === undefined) {
    guesses[rowIdx] = event.target.innerHTML;
  } else if (guess.length < 5) {
    guesses[rowIdx] += event.target.innerHTML;
  } else {
    return;
  }

  const colIdx = Math.max(guesses[rowIdx].length - 1, 0);

  const row = document.querySelector(`#row-${rowIdx}`);
  const col = row.querySelectorAll(`.board-col p`)[colIdx];

  col.innerHTML = event.target.innerHTML;
}

document.querySelectorAll('#keyboard button.btn').forEach(el => {
  el.addEventListener('click', handleInteractiveKeyPress);
});

/**
 * Handle delete key press on the interactive keyboard
 */
document
  .querySelector('#keyboard button.delete')
  .addEventListener('click', () => {
    const rowIdx = Math.max(guesses.length - 1, 0);
    const colIdx = Math.max(guesses[rowIdx].length - 1, 0);

    const row = document.querySelector(`#row-${rowIdx}`);
    const col = row.querySelectorAll(`.board-col p`)[colIdx];

    col.innerHTML = '';

    guesses[rowIdx] = guesses[rowIdx].slice(0, -1);
  });

/**
 * Handle enter key press on the interactive keyboard
 */
document
  .querySelector('#keyboard button.enter')
  .addEventListener('click', async () => {
    const guess = guesses[guesses.length - 1];
    if (guess?.length !== 5) {
      return;
    }

    /**
     * @type {GuessResponse}
     */
    let response;

    if (gameId === undefined) {
      response = await startNewGame(guess);
      gameId = response.gameId;
    } else {
      response = await addGuessToGame(guess);
    }

    if (response.canKeepGuessing) {
      guesses.push(''); // jump to next row
    }

    // TODO:
    //  - Change colors on the board
    //  - Change colors on the interactive
    //  - Disable keys accordingly
  });

/**
 * @param guess {string} Guess to be used to start a new game
 * @return {Promise<GuessResponse>}
 */
async function startNewGame(guess) {
  return axios.post('/game/start', { guess }).then(res => res.data);
}

/**
 * @param {string} guess
 * @return {Promise<GuessResponse>}
 */
function addGuessToGame(guess) {
  if (gameId === undefined) {
    throw new Error('gameId is undefined');
  }

  return axios.post('/game/guess', { gameId, guess }).then(res => res.data);
}
