# User Acceptance Testing (Lab 11)


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

