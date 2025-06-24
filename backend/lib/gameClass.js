// This class is used to create and track the game state for each user playing the game.
module.exports = class GameState {
  constructor() {
    this.bet = 0;
    this.dealerHand = [];
    this.playerHand = [];
    this.deck = this.createDeck();
  }

  createDeck() {
    const suits = ["♠", "♥", "♦", "♣"];
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

  getScore(who) {
    let score = 0;
    if (who === "dealer") {
      score = this.dealerHand.reduce((sum, card) => sum + card.num, 0);
    } else if (who === "player") {
      score = this.playerHand.reduce((sum, card) => sum + card.num, 0);
    }

    if (score > 21) {
      // check for A cards
      if (who === "dealer") {
        for (let i = 0; i < this.dealerHand.length; i++) {
          if (this.dealerHand[i].num === 11) {
            // use the card value to ovoid converting a already converted card
            this.dealerHand[i].num = 1; // convert the first ace it sees to a 1
            break;
          }
        }

        score = this.dealerHand.reduce((sum, card) => sum + card.num, 0);
      } else if (who === "player") {
        for (let i = 0; i < this.playerHand.length; i++) {
          if (this.playerHand[i].num === 11) {
            this.playerHand[i].num = 1;
            break;
          }
        }

        score = this.playerHand.reduce((sum, card) => sum + card.num, 0);
      }
    }

    return score;
  }
};
