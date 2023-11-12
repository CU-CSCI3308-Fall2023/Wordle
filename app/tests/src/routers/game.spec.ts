describe('GameRouter', () => {
  describe('POST /start', () => {
    it.skip('should return 400 if the guess is not valid');
    it.skip('should not use words that the user has already guessed');
    it.skip('should return the correct response if the first guess is correct');
    it.skip(
      'should return the correct response if the first guess is incorrect'
    );
  });

  describe('POST /guess', () => {
    it.skip('should return 400 if the guess is not valid');
    it.skip("should return 404 if the user doesn't own the game");
    it.skip('should return 404 if the user has already won the game');
    it.skip('should return 404 if the user has already lost the game');
    it.skip('should return 400 if the user tries the same guess twice');
    it.skip('should ignore the case of the guess');
    it.skip(
      'should update the guessed_correctly column if the guess is correct'
    );
    it.skip(
      'should return the feedback for all the guesses in chronological order'
    );
    it.skip('should compute the points based on the number of guesses');
    it.skip('should return if the user can still guess');
  });
});
