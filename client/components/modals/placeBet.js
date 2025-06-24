import axios from "axios";

export default function PlaceBetModal({
  bet,
  setBet,
  money,
  setBalance,
  setDealerHand,
  setPlayerHand,
  setGameStage,
  setPlayerScore,
  setDealerScore,
  setTwentyOne,
}) {
  // NOTE -> nead to figure out a way to pass the state around
  async function placeBet() {
    try {
      const userInfo = await axios.post(
        "http://localhost:4000/game/bet",
        { username: "Testing123", bet: bet }, // NOTE remove username latter and replace backend with session.userId
        { withCredentials: true }
      );

      setBalance(userInfo.data.money);
      setPlayerHand(userInfo.data.playerHand);
      setDealerHand(userInfo.data.dealerHand);
      setPlayerScore(userInfo.data.playerScore);
      setDealerScore(userInfo.data.dealerScore);
      setGameStage(userInfo.data.game);
      setTwentyOne(userInfo.data.twentyOne);
      console.log(userInfo.data?.gameState); // prints gameState if sent (for development).
    } catch (error) {
      console.log(error.message);
    }
  }
  return (
    <div className="flex flex-col items-center bg-gray-500 px-6 py-4 border-black border-4 rounded-4xl ">
      <h2 className="text-[7vw] lg:text-[3.5vw] font-bold mb-5">Bet ${bet}</h2>

      <div className="flex items-center">
        <button
          className="bg-white chip"
          disabled={money < 1 || money - bet < 1}
          onClick={() => {
            setBet((prev) => prev + 1);
          }}
        >
          $1
        </button>

        <button
          className="bg-red-800 text-white chip"
          disabled={money < 5 || money - bet < 5}
          onClick={() => {
            setBet((prev) => prev + 5);
          }}
        >
          $5
        </button>

        <button
          className="bg-green-800 text-white chip"
          disabled={money < 25 || money - bet < 25}
          onClick={() => {
            setBet((prev) => prev + 25);
          }}
        >
          $25
        </button>

        <button
          className="bg-black text-white chip"
          disabled={money < 100 || money - bet < 100}
          onClick={() => {
            setBet((prev) => prev + 100);
          }}
        >
          $100
        </button>
      </div>

      <div className="flex justify-between my-8">
        <button
          className="bg-red-800 options"
          disabled={bet === 0}
          onClick={() => {
            setBet(0);
          }}
        >
          Reset
        </button>

        <button
          className="bg-blue-800 options"
          disabled={bet === money}
          onClick={() => {
            setBet(money);
          }}
        >
          All in
        </button>

        <button
          className="bg-green-700 options"
          disabled={bet === 0}
          onClick={placeBet}
        >
          Place Bet
        </button>
      </div>
    </div>
  );
}
