require("dotenv").config();

const { err, log } = require("../tools/consoleTools");
const authMiddleware = require("../middleware/authMiddleware");
const placeBetMiddleware = require("../middleware/placeBetMiddleware");
const hitStandMiddleware = require("../middleware/hitStandMiddleware");
const UserInfo = require("../models/user");
// GameState class
const GameState = require("../lib/gameClass");

// This is used to easly add and remove users decks using the .set, .get, and .delete functions.
const gameState = new Map();

function getGameInstance(userId) {
  if (!gameState.has(userId)) {
    gameState.set(userId, new GameState()); // if deck instance dose not exist create one passing the userId
    log({
      message: `No game exists for user: ${userId}, new game created`,
      color: "green",
    });
  } else {
    log({ message: "User game instance found", color: "magenta" });
  }

  return gameState.get(userId);
}

// Helper functions

// NOTE -> nothing neads to be updated in the event of a loss as the bet has already bean taken out
async function updateBalance(username, action) {
  const user = await UserInfo.findOne({ username: username });
  if (!user) throw new Error("Failed to update user balance, user not found"); // will throw an error to the catch bock.

  let balance = user.money;

  const gameState = getGameInstance(username);

  // return bet to user
  if (action === "tie") {
    balance += gameState.bet;
  } else if (action === "win") {
    // give back double the bet
    balance += gameState.bet * 2;
  }

  // update the balance in mongoBD
  const updateUser = await UserInfo.updateOne(
    { username },
    { $set: { money: balance } }
  );
  if (updateUser.modifiedCount === 0)
    throw new Error(
      "Failed to updated users balance, user found but no value was changed"
    );

  return balance;
}

// REQUEST FUNCTIONS                       REQUEST FUNCTIONS                          REQUEST FUNCTIONS

const checkGameState = [
  authMiddleware,
  async (req, res) => {
    try {
      const session = req.session;

      let username = "";
      if (process.env.AUTH_DISABLED === "true") {
        username = req.body.username;
      } else {
        username = req.session.user;
      }

      // console.log(session);

      let game = "";

      if (!session) {
        log({
          message:
            "WARNING user auth is bypassed, and no game state detected, directing to start game",
          color: "yellow",
        });
        game = "start";
      } else {
        // session is detected, check what session is present
        if (session.gameStarted) {
          // if the game instance is present find the gameState.
          if (session.placeBet) {
            log({
              message: "Users game state found (placeBet)",
              color: "magenta",
            });
            game = "bet";
          } else if (session.hitStand) {
            log({
              message: "Users game state found (hitStand)",
              color: "magenta",
            });
            game = "hitStand";
          }
        } else {
          log({
            message:
              "User auth enabled, no game state detected, directing to start game",
            color: "green",
          });
          game = "start";
        }
      }

      if (game === "hitStand") {
        const gameState = getGameInstance(username);

        console.log(gameState.playerHand);
        const user = await UserInfo.findOne({ username });
        if (!user) {
          throw new Error("User not found");
        }

        return res.status(200).json({
          money: user.money,
          playerHand: gameState.playerHand,
          dealerHand: gameState.dealerHand,
          gameState: game,
        });
      }

      res.status(200).json({ gameState: game });
    } catch (error) {
      err(error.message);
      res.status(500).send(error.message);
    }
  },
];

const startGame = [
  authMiddleware,
  async (req, res) => {
    try {
      let username;
      // For development to bypass the session cookie in login and just pass a username in the req.
      if (process.env.AUTH_DISABLED === "true") {
        username = req.body.username;
      } else {
        username = req.session.user;
      }

      const user = await UserInfo.findOne({ username: username });
      if (!user) {
        log({ message: "WARNING invalid username", color: "yellow" });
        return res.status(401).json({ message: "Unatherised user not found" });
      }

      // Create new gameState instance
      const game = getGameInstance(user.username);
      game.shuffle();
      game.balance = user.money;

      log({
        message: "Game instance found, ready for bet",
        color: "magenta",
      });

      req.session.placeBet = true; // inforces that the game is played in the order expected.
      req.session.gameStarted = true; // used by the checkGameState route to render the correct gameState on the frontend to prevent jumping back to start game on page refresh.
      req.session.save();

      res.status(200).json({
        message: "Game started, waiting for bet to be placed",
        username: user.username,
        money: user.money,
      });
    } catch (error) {
      err(error.message);
      res.status(500).send(error.message);
    }
  },
];

const placeBet = [
  placeBetMiddleware,
  async (req, res) => {
    let username;
    try {
      if (process.env.AUTH_DISABLED === "true") {
        username = req.body.username;
      } else {
        username = req.session.user;
      }

      const bet = req.body.bet;

      if (bet === 0 || bet < 0) {
        throw new Error("Invalid bet in request");
      }

      const user = await UserInfo.findOne({ username: username });
      if (!user) {
        log({ message: "WARNING invalid username", color: "yellow" });
        return res.status(404).json({ message: "User not found" });
      }

      if (bet > user.money) {
        throw new Error("Insufficient funds, cannot process bet");
      }

      let balance = user.money - bet;

      const updateUser = await UserInfo.updateOne(
        { username },
        { $set: { money: balance } }
      );
      if (updateUser.modifiedCount === 0) {
        throw new Error(
          "Failed to updated users balance, user found but no value was changed"
        );
      }

      const gameState = getGameInstance(user.username);

      gameState.bet = bet; // update bet in the game state to use in later functions

      // if deck is down to 30% reset and reshuffle
      // NOTE -> This is the ideal place to do this as the players and dealers hands are empty
      if (gameState.deck.length < 16) {
        log({
          message: "Cards less than 30% left, reseting",
          color: "magenta",
        });
        gameState.resetDeck();
        gameState.shuffle();
      }

      gameState.draw("dealer");
      gameState.draw("player");
      gameState.draw("player");

      let game = "";

      // IMPORTANT NOTE -> If player gets blackjack on draw dont generate or delete session cookie, game
      // will go back to place bet step. Also if the player gets 21 on draw the dealer just reveals the hidden
      // card and dose not draw any cards.
      if (gameState.getScore("player") === 21) {
        gameState.draw("dealer"); // reveal hidden card

        if (gameState.getScore("dealer") === 21) {
          game = "tie";
        } else {
          game = "win";
        }
      } else {
        game = "hitStand"; // continue game
      }

      if (game === "tie" || game === "win") {
        // NOTE -> No user session updated neaded, as game will return to bet route

        gameState.resetHands();

        balance = await updateBalance(username, game);
      } else {
        delete req.session.placeBet; // delete the session to prevent out of order requests

        req.session.hitStand = true; // allow access to hit.stand routes
        req.session.save();

        log({ message: "Bet placed, ready for hit/stand", color: "magenta" });
      }

      res.status(200).json({
        money: balance,
        gameState: gameState, // remove in production
        playerHand: gameState.playerHand,
        dealerHand: gameState.dealerHand,
        game: game,
      });
    } catch (error) {
      err(error.message);
      res.status(500).send(error.message);
    }
  },
];

const hit = [
  hitStandMiddleware,
  async (req, res) => {
    try {
      let username;
      if (process.env.AUTH_DISABLED === "true") {
        username = req.body.username;
      } else {
        username = req.session.user;
      }

      const gameState = getGameInstance(username);

      gameState.draw("player");

      let playerScore = gameState.getScore("player");

      let game = "";

      // NOTE -> No lose senario if the player hits into 21 only win or tie.
      if (playerScore === 21) {
        // will draw cards until score is 17 or greater
        while (gameState.getScore("dealer") < 17) {
          gameState.draw("dealer");
        }

        if (gameState.getScore("dealer") === 21) {
          game = "tie";
        } else {
          // if dealer bust or under 21
          game = "win";
        }
      } else if (playerScore > 21) {
        game = "bust";
      } else {
        // player score < 21 (continue)
        game = "hitStand";
      }

      if (game === "bust" || game === "win" || game === "tie") {
        delete req.session.hitStand; // remove access to hit/stand routes

        gameState.resetHands();

        req.session.placeBet = true; // give access to place bet route
        req.session.save();
      }

      let responce = {};
      if (game === "bust" || game === "hitStand") {
        // NOTE -> no nead to update balance

        if (game === "bust") {
          gameState.resetHands();
        }

        responce = {
          // NOTE -> If no money object is sent the money state on the client will not change.
          gameState: gameState, // remove in production
          playerHand: gameState.playerHand,
          dealerHand: gameState.dealerHand,
          game: game,
        };
      } else {
        // Win or Tie
        const balance = await updateBalance(username, game);

        gameState.resetHands();

        responce = {
          money: balance,
          gameState: gameState, // remove in production
          playerHand: gameState.playerHand,
          dealerHand: gameState.dealerHand,
          game: game,
        };
      }

      res.status(200).json(responce);
    } catch (error) {
      err(error.message);
      res.status(500).send(error.message);
    }
  },
];

const stand = [
  hitStandMiddleware,
  async (req, res) => {
    try {
      let username;
      if (process.env.AUTH_DISABLED === "true") {
        username = req.body.username;
      } else {
        username = req.session.user;
      }

      const gameState = getGameInstance(username);

      gameState.draw("dealer"); // flip hidden card

      // will draw cards until score is 17 or greater
      while (gameState.getScore("dealer") < 17) {
        gameState.draw("dealer");
      }

      const playerScore = gameState.getScore("player");

      const dealerScore = gameState.getScore("dealer");

      let game = "";

      if (dealerScore <= 21 && dealerScore > playerScore) {
        // player loses
        game = "lose";
      } else if (dealerScore > 21 || dealerScore < playerScore) {
        // dealer bust or score < player, player wins
        game = "win";
      } else if (dealerScore === playerScore) {
        // tie return players bet
        game = "tie";
      }

      let responce = {};
      if (game === "lose") {
        // if loose send no money object so the UI balance dose not change.
        responce = {
          gameState: gameState, // remove in production
          playerHand: gameState.playerHand,
          dealerHand: gameState.dealerHand,
          game: game,
        };
      } else {
        // if not loose then return win or tie with the updated balance
        const balance = await updateBalance(username, game);

        responce = {
          money: balance,
          gameState: gameState, // remove in production
          playerHand: gameState.playerHand,
          dealerHand: gameState.dealerHand,
          game: game,
        };
      }

      gameState.resetHands();

      delete req.session.hitStand;
      req.session.placeBet = true;
      req.session.save();

      res.status(200).json(responce);
    } catch (error) {
      err(error.message);
      res.status(500).send(error.message);
    }
  },
];

module.exports = { checkGameState, startGame, placeBet, hit, stand };
