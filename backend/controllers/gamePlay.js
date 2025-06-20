require("dotenv").config();

const { err, log } = require("../helpers/consoleTools");
const authMiddleware = require("../middleware/authMiddleware");
const placeBetMiddleware = require("../middleware/placeBetMiddleware");
const hitStandMiddleware = require("../middleware/hitStandMiddleware");
const UserInfo = require("../models/user");

// This class is used to create and track the game state for each user playing the game.
class GameState {
  constructor() {
    this.bet = 0;
    this.dealerHand = [];
    this.playerHand = [];
    this.deck = this.createDeck();
  }

  createDeck() {
    const suits = ["hearts", "diamonds", "spades", "clubs"];
    const values = [
      {
        display: "A",
        num: 11,
      },
      {
        display: "2",
        num: 2,
      },
      {
        display: "3",
        num: 3,
      },
      {
        display: "4",
        num: 4,
      },
      {
        display: "5",
        num: 5,
      },
      {
        display: "6",
        num: 6,
      },
      {
        display: "7",
        num: 7,
      },
      {
        display: "8",
        num: 8,
      },
      {
        display: "9",
        num: 9,
      },
      {
        display: "10",
        num: 10,
      },
      {
        display: "J",
        num: 10,
      },
      {
        display: "Q",
        num: 10,
      },
      {
        display: "K",
        num: 10,
      },
    ];

    const cards = [];

    for (const suit of suits) {
      for (const value of values) {
        cards.push({ suit, display: value.display, num: value.num });
      }
    }

    return cards;
  }

  // Fisher-Yates shuffle algorithm.
  shuffle() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]]; // swap positions to random deck position.
    }
  }

  resetDeck() {
    this.deck = this.createDeck();
  }

  draw(who) {
    const card = this.deck.pop(); // remove the last element in the array.
    if (who === "dealer") this.dealerHand.push(card);
    if (who === "player") this.playerHand.push(card);
  }

  resetHands() {
    this.dealerHand = [];
    this.playerHand = [];
  }
}

// This is used to easly add and remove users decks using the .set, .get, and .delete functions.
const gameState = new Map();

function getDeckForUser(userId) {
  if (!gameState.has(userId)) {
    gameState.set(userId, new GameState()); // if deck instance dose not exist create one passing the userId
    log({
      message: `No game exists for user: ${userId}, new game created`,
      color: "green",
    });
  }

  return gameState.get(userId);
}

// REQUEST FUNCTIONS                       REQUEST FUNCTIONS                          REQUEST FUNCTIONS

const startGame = [
  authMiddleware,
  async (req, res) => {
    try {
      // For development to bypass the session cookie in login and just pass a username in the req.
      if (process.env.AUTH_DISABLED === "true") {
        const { username } = req.body;

        const user = await UserInfo.findOne({ username: username });
        if (!user) {
          log({ message: "WARNING invalid username", color: "yellow" });
          return res
            .status(401)
            .json({ message: "Unatherised user not found" });
        }

        // Create new gameState instance
        const game = getDeckForUser(user.username);
        game.shuffle();

        log({
          message: "Game instance found, ready for bet",
          color: "magenta",
        });

        req.session.placeBet = true; // inforces that the game is played in the order expected.

        res.status(200).json({
          message: "Game started, waiting for bet to be placed",
          username: user.username,
          money: user.money,
        });
      } else {
        // Actual production code that uses the session cookie.
        const userId = req.session.userId;

        const user = await UserInfo.findOne({ _id: userId });
        if (!user) {
          log({ message: "WARNING invalid _id", color: "yellow" });
          return res
            .status(401)
            .json({ message: "Unatherised user not found" });
        }

        const game = getDeckForUser(userId);
        game.shuffle();

        log({
          message: "Game instance found, ready for bet",
          color: "magenta",
        });

        req.session.placeBet = true; // inforces that the game is played in the order expected.

        res.status(200).json({
          message: "Game started, waiting for bet to be placed",
          username: user.username,
          money: user.money,
        });
      }
    } catch (error) {
      err(error.message);
      res.status(500).send(error.message);
    }
  },
];

const placeBet = [
  placeBetMiddleware,
  async (req, res) => {
    try {
      if (process.env.AUTH_DISABLED === "true") {
        const { username, bet } = req.body;

        const user = await UserInfo.findOne({ username: username });
        if (!user) {
          log({ message: "WARNING invalid username", color: "yellow" });
          return res
            .status(401)
            .json({ message: "Unauthorized user not found" });
        }

        if (bet > user.money) {
          log({
            message:
              "WARNING users bet exceeds amount of money, request rejected",
            color: "yellow",
          });
          return res.status(403).json({ message: "Bet exceeds limit" });
        }

        const balance = user.money - bet;

        const updatedUser = await UserInfo.findOneAndUpdate(
          { username: username },
          { $set: { money: balance } }
        );
        if (!updatedUser) {
          log({
            message: "WARNING failed to update users balance",
            color: "yellow",
          });

          res.status(404).json({
            message: "Failed to update users balance, user not found",
          });
        }

        const gameState = getDeckForUser(user.username);

        gameState.bet = bet; // update bet in the game state

        // if deck is down to 30% reset and reshuffle
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

        const playerScore =
          gameState.playerHand[0].num + gameState.playerHand[1].num;

        // IMPORTANT NOTE -> If player gets blackjack on draw dont generate or delete session cookie, game
        // will go back to place bet step.
        if (playerScore === 21) {
          game.State.draw("dealer");

          let dealerScore =
            gameState.dealerHand[0].num + gameState.dealerHand[1].num;

          if (dealerScore === 21) {
            const returnBet = await UserInfo.findOneAndUpdate(
              { username: username },
              { $set: { money: user.money } } // set back to original value before bet was proccessed
            );
            if (!returnBet) {
              log({
                message:
                  "WARNING failed to return users bet from tie with dealer",
                color: "yellow",
              });

              return res.status(404).json({
                message:
                  "Failed to return users bet becuase of tie, user not found",
              });
            }

            return res.status(200).json({
              money: user.money,
              gameState: gameState,
              dealerHand: gameState.dealerHand,
              playerHand: gameState.playerHand,
              game: "tie",
            });
          }

          // Updated users balance if win
          const winBalance = updatedUser.money + bet * 2;

          const giveWinnings = await UserInfo.findOneAndUpdate(
            { username: username },
            { $set: { money: winBalance } }
          );
          if (!giveWinnings) {
            log({
              message: "WARNING failed to update user winnings",
              color: "yellow",
            });

            return res.status(404).json({
              message: "Failed to update users winnings, user not found",
            });
          }

          return res.status(200).json({
            money: winBalance,
            gameState: gameState,
            dealerHand: gameState.dealerHand,
            playerHand: gameState.playerHand,
            game: "win",
          });
        }

        delete req.session.placeBet; // delete the session to prevent out of order requests

        req.session.hitStand = true; // create new session for next step in the game

        log({ message: "Bet placed, ready for hit/stand", color: "magenta" });

        res.status(200).json({
          money: balance,
          gameState: gameState, // remove in production
          playerHand: gameState.playerHand,
          dealerHand: gameState.dealerHand,
          game: "continue",
        });
      } else {
        // ADD PRODUCTON CODE USING SESSION USERID AFTER DEVELOPMENT AND TESTING
      }
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
      if (process.env.AUTH_DISABLED === "true") {
        const { username } = req.body;
      } else {
        // ADD PRODUCTON CODE USING SESSION USERID AFTER DEVELOPMENT AND TESTING
      }

      res.status(200).json({ message: "Hit proccesed" });
    } catch (error) {
      err(error.message);
      res.status(500).send(error.message);
    }
  },
];

module.exports = { startGame, placeBet, hit };
