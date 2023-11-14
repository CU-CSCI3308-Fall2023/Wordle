import express from 'express';

import db from '../db';

const router = express.Router();

interface ScoreboardEntry {
  position: number;
  username: string;
  totalPoints: number;
  avgPointsPerGame: number;
  gamesPlayed: number;
}

interface ScoreboardQuery {
  /**
   * 1-indexed position of the user in the scoreboard based on their total points.
   */
  position: number;
  username: string;
  /**
   * The points per game is defined as 7 - number of guesses.
   */
  total_points: number;
  avg_points_per_game: number;
  games_played: number;
}

router.get<never, ScoreboardEntry[]>('/', async (req, res) => {
  const scoreboard = await db.any<ScoreboardQuery>(`
      WITH user_games AS (SELECT u.id                                  AS user_id,
                                 u.username,
                                 g.id                                  AS game_id,
                                 COALESCE(7 - COUNT(guesses.guess), 7) AS points
                          FROM users u
                                   INNER JOIN games g ON u.id = g.user_id
                                   LEFT JOIN guesses ON g.id = guesses.game_id
                          GROUP BY u.id, u.username, g.id),
           user_scores AS (SELECT user_id,
                                 username,
                                 SUM(points)    AS total_points,
                                 AVG(points)    AS avg_points_per_game,
                                 COUNT(game_id) AS games_played
                          FROM user_games
                          GROUP BY user_id, username)
      SELECT ROW_NUMBER() OVER (ORDER BY total_points DESC) AS position,
             username,
             total_points,
             avg_points_per_game,
             games_played
      FROM user_scores
      ORDER BY total_points DESC;
  `);

  const userEntry = scoreboard.find(
    entry => entry.username === req.session.user!.username
  );

  if (userEntry) {
    scoreboard.unshift(userEntry);
  }

  // TODO: Replace JSON with UI render when we have the page
  res.json(
    scoreboard.map(
      ({
        position,
        total_points,
        avg_points_per_game,
        games_played,
        username
      }) => ({
        position,
        username,
        totalPoints: total_points,
        avgPointsPerGame: avg_points_per_game,
        gamesPlayed: games_played
      })
    )
  );
});

export default router;
