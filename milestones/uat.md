# User Acceptance Testing (Lab 11)

## 3 Features: Register, Login, & Scoreboard

Feature | Test Cases/Test Data | Acceptance Criteria | Test Type | Test Results |
--- | --- | --- | --- | --- |
Register | <ul><li>User is not able to register with existing credentials</li><li>User is able to register with new credentials</li><li>Missing username</li><li>Missing password</li><li>Missing username and password</li><li>Username is not a string</li><li>Password is not a string</li></ul>  | A user can register if and only if they enter a username that does not already exist in the <code>users</code> table of the <code>wordle</code> database. They must also enter a password, and both of these inputs must be strings. The newly registered username and password will be stored in the <code>users</code> table. | Automated Unit Testing  | <ul><li>Return successful 200 response if first test case passes</li><li>Return 409 error if first test case fails</li><li>Return 400 error if any of the remaining 6 test cases fail</li></ul>  |
Login | <ul><li>User is able to login with correct credentials</li><li>User is not able to login with incorrect credentials</li><li>Missing username</li><li>Missing password</li><li>Missing username and password</li><li>Username is not a string</li><li>Password is not a string</li></ul>  | A user cannot Login unless they enter a string username and the corresponding string password that exist in the <code>users</code> table of the <code>wordle</code> database.  | Automated Unit Testing  | <ul><li>Return successful 200 response if first test case passes</li><li>Return 409 error if second test case fails</li><li>Return 400 error if any of the remaining 5 test cases fail</li></ul>  |
Scoreboard | <ul><li>Scoreboard correctly displays a descending leaderboard of players that include information on their average guesses per game and their all time points</li><li>Displays user's username</li><li>Scoreboard displays the individual user's position on the leaderboard</li><li>Displays the individual user's accumulated points across all games played</li><li>Displays individual user's average guesses per game</li><li>Displays total number of games played by user</li></ul>  | After winning or losing a game, the user should see the scoreboard. The scoreboard will display username, score for most recently played game, average points per game, number of games played, total points, and ranking for each player. All data needed for the scoreboard are from the <code>guesses</code> and <code>users</code> tables in the <code>wordle</code> database.  | Automated Unit Testing  | <ul><li>Return 200 OK response if all test cases pass</li><li>Return 500 Internal Server Error response if all test cases fail</li></ul>  |


## UAT Plan for Register Feature

When the user opens the application, they will be prompted to log in. If they do not already have an account, there will be button they can click to register their account. When the user registers, they will be asked for the following information:
* Username
* Password 
Once the user inputs this information, they will be redirected to the login page where they can now log in with their new account. The information received when a user registers is stored in the users table of the wordle database. The only time the application should allow the user to register a new account is when the user enters a username that does not already exist in the database. The username and password must both be strings.

Test cases for Register:

* Return 400 if:
    * username is missing
    * password is missing
    * both username and password are missing
    * username is not a string
    * password is not a string

* Return 409 if:
    * user attempts to register with an existing username


## UAT Plan for Login Feature

When the user is brought to the login page, they will be asked for the following information:
* Username
* Password
If they enter a username that does not exist in the users table or a password that does not match the username, an error message will be displayed. The user will then be asked to enter different login details. When a user logs in with correct information, they will be redirected to the home page of the application. 
In order to test the log in and signup features, we will have multiple test cases. The only time that the app should allow the user to log in is when the user enters an existing username and the corresponding password for that username. All of the information needed for a successful login is stored in the users table of the wordle database.

Test cases for Login:

* Return 400 if:
    * username is missing
    * password is missing
    * both username and password are missing
    * username is not a string
    * password is not a string
      

## UAT Plan for Scoreboard Feature

The scoreboard should display a leaderboard that includes the following:
* Each user’s average guesses/points per game
* A descending list of the players with the highest score to lowest score
* The individual user’s score
The scoreboard should also show that specific user’s all time stats which include:
* Their position on the leaderboard
* Their username
* Their total points across all games played
* Their average points/guesses per game
* The total number of games played
Information about the user’s guesses are pulled from the guesses table, and information about the user’s score is pulled from the games table, both of which are in the Wordle database.

