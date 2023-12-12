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

#### Docker

The recommended way to run the app locally is to use Docker. To run it, start up the `docker-compose.yml` file:

```bash
docker compose up -d
```

The app will now be live at `http://localhost:3000`.

#### Directly

First, install the needed dependencies:

```bash
npm install
```

Next, be sure that you have created the `.env`:

```bash
cp .env.template .env # be sure to fill in the values
```

Then start the database:

```bash
docker compose up -d db
```

And run the app locally:

```bash
npm run start
```

#### Production

The above will run the applicaton in development mode; to run it in production mode, use the `docker-compose.production.yml` file:

```bash
docker compose -f docker-compose.production.yml up -d --build
```

### Tests

#### Docker

To run the tests using docker, run the following command:

```bash
docker compose -f docker-compose.test.yml up -d --build
```

If the container exits gracefully, the tests have passed.

#### Locally

To run the tests locally, be sure that you have all the dependencies in place. Check the [Running Locally](#running-locally) section for more information.

Then, run the tests:

```bash
npm run test
```

## Deployment

http://recitation-12-team-05.eastus.cloudapp.azure.com:3000/login


