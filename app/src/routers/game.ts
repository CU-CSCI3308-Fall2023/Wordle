import express from 'express';

import db from '../db';

const router = express.Router();

interface Word {
  id: number;
  word: string;
}

interface Guess {
  id: number;
  game_id: number;
  guess: string;
  created_at: Date;
}

interface Game {
  id: number;
  user_id: number;
  word_id: number;
  guessed_correctly: boolean;
  created_at: Date;
}

interface StartGameRequest {
  guess: string;
}

interface FollowUpRequest {
  gameId: number;
  guess: string;
}

interface GuessLetterFeedback {
  letter: string;
  index: number;
  guess: string;
  isInWord: boolean;
  isInCorrectPosition: boolean;
}

interface GuessResponse {
  gameId: number;
  remainingGuesses: number;
  canKeepGuessing: boolean;
  won: boolean;
  currentPoints: number;
  guesses: GuessLetterFeedback[][];
}

/**
 * Checks if the guess is valid, that is, only contains lowercase english letters and is 5 characters long.
 */
function isGuessValid(guess: unknown): boolean {
  return (
    typeof guess === 'string' && guess.length === 5 && /^[a-z]+$/.test(guess)
  );
}

function getGuessFeedback({
  word,
  guess
}: {
  word: string;
  guess: string;
}): GuessLetterFeedback[] {
  const feedback: GuessLetterFeedback[] = [];

  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i];
    const isInWord = word.includes(letter);
    const isInCorrectPosition = word[i] === letter;

    feedback.push({ letter, isInWord, isInCorrectPosition, index: i, guess });
  }

  return feedback;
}

function getAllGuessesFeedback(guesses: Guess[]): GuessLetterFeedback[][] {
  return guesses.map(g => getGuessFeedback({ word: '', guess: g.guess }));
}

router.post<StartGameRequest, GuessResponse>('/start', async (req, res) => {
  const guess = req.body.guess.toLowerCase();
  const userId = req.session.user!.id;

  if (!isGuessValid(guess)) {
    return res.status(400).end();
  }

  // pick a random word the user has npt guesses to be the answer
  const word = await db.oneOrNone<Word>(
    `
    SELECT *
    FROM words
    WHERE id NOT IN (SELECT word_id
                     FROM games
                     WHERE user_id = $1
                       AND guessed_correctly = TRUE)
    ORDER BY RANDOM()
    LIMIT 1;
  `,
    [userId]
  );

  // technically it can be null if the user won all the 2000+ words
  if (!word) {
    return res.status(418).end();
  }

  const gameId = await db.tx(async t => {
    // create a new game with the picked word
    const { id: gameId } = await t.one<{ id: number }>(
      `INSERT INTO games (user_id, word_id) VALUES ($1, $2) RETURNING id;`,
      [userId, word.id]
    );

    // create a new guess with the user's guess
    await t.none(`INSERT INTO guesses (game_id, guess) VALUES ($1, $2);`, [
      gameId,
      guess
    ]);

    return gameId;
  });

  const wonOnFirstGuess = guess === word.word;

  res.json({
    gameId,
    remainingGuesses: wonOnFirstGuess ? 0 : 5,
    canKeepGuessing: !wonOnFirstGuess,
    won: wonOnFirstGuess,
    currentPoints: wonOnFirstGuess ? 6 : 5,
    guesses: [getGuessFeedback({ word: word.word, guess })]
  });
});

router.post<FollowUpRequest, GuessResponse>('/guess', async (req, res) => {
  const { gameId } = req.body;
  const guess = req.body.guess.toLowerCase();
  const userId = req.session.user!.id;

  if (!isGuessValid(guess)) {
    return res.status(400).end();
  }

  type GameWordAndGuessesQuery = Omit<
    Game & Word & Guess,
    'id' | 'created_at'
  > & {
    'game.id': number;
    'word.id': number;
    'guess.id': number;
    'guess.created_at': Date;
    'game.created_at': Date;
  };

  // the only changing element in the array is the guess - word and game data will be the same for all of them
  // each element in the array represents a guess
  const gameWordAndGuesses = await db.any<GameWordAndGuessesQuery>(
    `SELECT *
     FROM games game
              JOIN words word ON game.word_id = word.id
              JOIN guesses guess ON guess.game_id = game.id -- Join instead of left join since we know at least one guess exists from /start
     WHERE game.id = 2
       AND game.user_id = 1
       AND game.guessed_correctly = FALSE
       AND (SELECT COUNT(*)
            FROM guesses
            WHERE game_id = 2) < 6
     ORDER BY guess.created_at;`,
    [gameId, userId]
  );

  if (gameWordAndGuesses.length === 0) {
    return res.status(404).end();
  }

  const winningWord = gameWordAndGuesses[0].word;

  const guesses = gameWordAndGuesses.map<Guess>(data => ({
    guess: data.guess,
    id: data['guess.id'],
    created_at: data['guess.created_at'],
    game_id: data['game.id']
  }));

  // if user has already tried this guess, return 400
  if (guesses.some(g => g.guess === guess)) {
    return res.status(400).end();
  }

  const won = await db.tx(async t => {
    // create a new guess with the user's guess
    const newGuess = await t.one<Guess>(
      `INSERT INTO guesses (game_id, guess) VALUES ($1, $2) RETURNING *;`,
      [gameId, guess]
    );

    guesses.push(newGuess);

    // check if the user won and update the game entry
    const won = guess === winningWord;

    if (won) {
      await t.none(`UPDATE games SET guessed_correctly = TRUE WHERE id = $1;`, [
        gameId
      ]);
    }

    return won;
  });

  res.json({
    gameId,
    remainingGuesses: won ? 0 : 6 - guesses.length,
    canKeepGuessing: !won && guesses.length < 6,
    won,
    currentPoints: 6 - guesses.length + 1, // +1 since if the user won at the second guess, they get 5 points and so on
    guesses: [
      ...getAllGuessesFeedback(guesses),
      getGuessFeedback({ word: winningWord, guess })
    ]
  });
});

export default router;
