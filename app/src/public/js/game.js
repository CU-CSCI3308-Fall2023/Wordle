(function () {
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
      } else {
        disableAllInputs();
      }

      updateBoardColors(response);
      updateKeyboard(response);
    });

  /**
   * @param guess {string} Guess to be used to start a new game
   * @return {Promise<GuessResponse>}
   */
  function startNewGame(guess) {
    return fetch('/game/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ guess })
    }).then(res => res.json());
  }

  /**
   * @param {string} guess
   * @return {Promise<GuessResponse>}
   */
  function addGuessToGame(guess) {
    if (gameId === undefined) {
      throw new Error('gameId is undefined');
    }

    return fetch('/game/guess', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ gameId, guess })
    }).then(res => res.json());
  }

  /**
   * Update the colors on the board based on the current guesses.
   * @param game {GuessResponse}
   */
  function updateBoardColors(game) {
    for (let i = 0; i < game.guesses.length; i++) {
      const squares = document.querySelectorAll(`#row-${i} > .board-col`);
      const feedback = game.guesses[i];

      for (let j = 0; j < feedback.length; j++) {
        const square = squares[j];
        const guess = feedback[j];

        if (guess.isInCorrectPosition) {
          square.classList.add('correct-position');
        } else if (guess.isInWord) {
          square.classList.add('correct-letter');
        } else {
          square.classList.add('incorrect-letter');
        }
      }
    }
  }

  /**
   * Update the keyboard based on the current state of the game.
   * @param {GuessResponse} game
   */
  function updateKeyboard(game) {
    const letters = document.querySelectorAll('#keyboard button.btn');

    if (!game.canKeepGuessing) {
      letters.forEach(letter => (letter.disabled = true));
      // Display the result modal
      $('#resultModal').modal('show');

      // Determine whether the user won or lost and set the result message accordingly
      const userWon = game.won; // Set this based on your game logic
      const resultMessage = userWon
        ? 'Congratulations! You won the game!'
        : 'Sorry, you ran out of guesses!';

      // Display the result message in the modal body
      $('.modal-body').text(resultMessage);
      return;
    }

    const lettersInWord = game.guesses
      .flat()
      .filter(guess => guess.isInWord && !guess.isInCorrectPosition)
      .map(guess => guess.letter);

    const lettersInCorrectPosition = game.guesses
      .flat()
      .filter(guess => guess.isInCorrectPosition)
      .map(guess => guess.letter);

    const wrongLetters = game.guesses
      .flat()
      .filter(guess => !guess.isInWord && !guess.isInCorrectPosition)
      .map(guess => guess.letter);

    for (const el of letters) {
      const letter = el.innerHTML;

      if (lettersInWord.includes(letter)) {
        el.classList.add('correct-letter');
      } else if (lettersInCorrectPosition.includes(letter)) {
        el.classList.add('correct-position');
      } else if (wrongLetters.includes(letter)) {
        el.classList.add('incorrect-letter');
      }
    }

    // display success message if the user won the game
    if (game.won) {
      // Display the result modal
      $('#resultModal').modal('show');

      // Determine whether the user won or lost and set the result message accordingly
      const userWon = game.won; // Set this based on your game logic
      const resultMessage = userWon
        ? 'Congratulations! You guessed correctly!'
        : 'Sorry, you ran out of guesses!';

      // Display the result message in the modal body
      $('.modal-body').text(resultMessage);
    }
  }

  // handle physical keyboard events
  document.addEventListener('keyup', event => {
    if (event.key === 'Enter') {
      document.querySelector('#keyboard button.enter').click();
    } else if (event.key === 'Backspace') {
      document.querySelector('#keyboard button.delete').click();
    } else if (event.key.match(/[a-z]/i)) {
      const keys = document.querySelectorAll('#keyboard button.btn');
      keys.forEach(key => {
        if (key.innerHTML === event.key) {
          key.click();
        }
      });
    }
  });

  function disableAllInputs() {
    document.querySelectorAll('#keyboard button').forEach(el => {
      el.disabled = true;
    });
  }
})();
