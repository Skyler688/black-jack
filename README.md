# **Project Overview**

## Setup

- This project uses two servers, one for the backend API, and one for the frontend UI. Both will nead to be started individually.

- Navigate into the backend directory and run the command (npm install), this will install all necessary dependencies.

- Navigate into the client directory and run the command (npm install).

- Add a .env file to the backend directory, then add your mongoDB atlas URI with the tag (MONGO_URI = "your URI key"), as well as a tag (AUTH_DISABLED = false). This is used in development to bypass user auth middleware for testing the API. Then in the client directory add a .env file with the tag (AUTH_DISABLED = false) as well.

- Once each directory is set up you can run (npm run dev) in the backend and client directorys. This will start both servers and the search url will be displayed inside of the client terminal.

## How To Play

To play the game you will first nead to create an account, this can be done through the "New" button on the login page. Once the account is created and loged in, you can get chips by clicking the "Cage" button. Note, you do not nead to enter any card info as the checkout is just for show, just select the amount you want in the "Buy In" input and click the Buy Chips button (max amount is 10,000). After that you should be able to place bets and play the game.

## API

* /user/create, type: post, body: json{ username, password }. Creates a user in the data base.
* /user/login, type: post, body: json{ username, password }. Vaidates user and creates a session cookie.
* /user/check, type: post, body: null. Checks if cookie is valid (used buy the frontend server to inshure cookie is valid).
* /user/logout, type: post, body: null, with credentials. Deletes users game instance and sessions.
* /user/buy, type: post, body: json{ amount }, with credentials. Updates users balance.
* /user/cashout, type: post, body: null, with credentials. Sets balance to 0. (Just for show)
* /game/check/state, type: post, body: null, with credentials. Used to find users game stage in the event of a refresh.
* /game/start, type: post, body: null, with credentials. Creates or finds userd game state.
* /game/bet, type: post, body: json{ bet }, with credentials. Places bet and gives access to hit/stand routes, or resolves game if 21.
* /game/hit, type: post, null, with credentials. Gives card to player/resolves game if win or bust.
* /game/stand, type: post, null, with credentials. Dealer draws cards until over score over 17 and game resolves.

## About

This project uses a backend API that tracks the games state for each user loged in. This was done to prevent cheating and create a secure system. The backend game play routes are protected with session middleware to both check if the user is valid as well as renforcing the game order. The front end uses axios to send requests to the backend, as well as the framer motions library to animate the cards and bet modale.
