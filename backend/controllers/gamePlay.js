const { err, log } = require("../helpers/consoleTools");
const authMiddleware = require("../middleware/authMiddleware");

// This class is used to create unique instances of the deck of cards for each player curently playing the game.
class userDeck {
  constructor() {
    this.deck = this.createDeck();
  }

  createDeck() {
    const suits = ["hearts", "diamonds", "spades", "clubs"];
    const values = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
    ];

    const cards = [];

    for (const suit of suits) {
      for (const value of values) {
        cards.push({ suit, value });
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

  draw() {
    return this.deck.pop(); // remove the last element in the array.
  }

  reset() {
    this.deck = this.createDeck();
  }
}

// This is used to easly add and remove users decks using the .set, .get, and .delete functions.
const decks = new Map();

function getDeckForUser(userId) {
  if (!decks.has(userId)) {
    decks.set(userId, new userDeck()); // if deck instance dose not exist create one passing the userId
    log({
      message: `No deck exists for user: ${userId}, new deck created`,
      color: "green",
    });
  }

  return decks.get(userId);
}

// REQUEST FUNCTIONS                       REQUEST FUNCTIONS                          REQUEST FUNCTIONS

// deal a card
const deal = [
  authMiddleware,
  (req, res) => {
    try {
      const { userId } = req.body;

      const deck = getDeckForUser(userId); // will create a deck if it dose not exist.
      deck.shuffle();

      const card = deck.draw();
      log({ message: `Card drawn for user: ${userId}`, color: "blue" });

      res.status(200).json({ card });
    } catch (error) {
      err(error.message);
      res.status(500).send(error.message);
    }
  },
];

// Reset deck
const reset = [
  authMiddleware,
  (req, res) => {
    try {
      const { userId } = req.body;

      if (decks.has(userId)) {
        const deck = decks.get(userId);
        deck.reset();
        log({ message: `Deck reset for user: ${userId}`, color: "blue" });
        return res.status(200).json({ message: "Deck has bean reset" });
      }

      log({
        message: `WARNING no deck found for user: ${userId}`,
        color: "yellow",
      });
      res.status(404).json("Deck not found");
    } catch (error) {
      err(error.message);
      res.status(500).send(error.message);
    }
  },
];

// This is a clean up function to prevent the users deck instance from sitting in ram when not activly playing.
const removeDeck = [
  authMiddleware,
  (req, res) => {
    try {
      const { userId } = req.body;

      if (decks.has(userId)) {
        decks.delete(userId);
        log({ message: `Deck removed for user: ${userId}`, color: "magenta" });
        return res.status(200).json({ message: "Deck removed successfully" });
      }

      log({
        message: `WARNING deck not found for user: ${userId}`,
        color: "yellow",
      });

      res.status(404).json({ message: "Deck not found" });
    } catch (error) {
      err(error.message);
      res.status(500).send(error.message);
    }
  },
];

module.exports = { deal, reset, removeDeck };
