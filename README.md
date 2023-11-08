# Wordle

## Description
A 5 letter word guessing game. You have six chances to guess the day's secret five-letter word. Type in a word as a guess, and the game tells you which letters are or aren't in the word as well as if the location of the letter in the word is correct. The aim is to figure out the secret word with the fewest guesses. The word is selected at random from the database. The user will never be able to guess the same word twice.

## Contributors
* [Aidan Youell](https://github.com/aidanyouell)
* [Ella Arnold](https://github.com/ellaarnold19)
* [Nathan So](https://github.com/nthnns)
* [Matayay "Tai" Karuna](https://github.com/matayay)
* [Fernando Picoral](https://github.com/feRpicoral)


## Tech Stack
* NodeJS
* Express
* PostrgreSQL
* EJS View Engine
* Bootstrap

## Running Locally

### Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop/)
- [NodeJS LTS](https://nodejs.org/en/)

### App

First, install the needed dependencies:

```bash
npm install
```

Next, be sure that you have created the `.env`:

```bash
cp .env.template .env # be sure to fill in the values
```

And run the app locally:

```bash
npm run start
```

To run using Docker, use:

```bash
docker compose up -d --build
```

Note that this will run the app in production mode. 

### Tests
To run the tests, use
```bash
npm run test
```

## Deployment
TODO



