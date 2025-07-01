"use client";

import { useState, useEffect } from "react";

import axios from "axios";
import { motion, AnimatePresence, color } from "framer-motion";
import { useRouter } from "next/navigation";

import PlaceBetModal from "./modals/placeBet";

export default function GamePlay({
  gameState,
  username,
  money,
  dealer,
  player,
  pScore,
  dScore,
}) {
  const [balance, setBalance] = useState(money);
  const [displayBalance, setDisplayBalance] = useState(money);
  const [gameStage, setGameStage] = useState(gameState); // states (bet, hitStand, 21, win, tie, bust, lose)
  const [bet, setBet] = useState(0);
  const [playerHand, setPlayerHand] = useState(player);
  const [dealerHand, setDealerHand] = useState(dealer);
  const [tempDealerHand, setTempDealerHand] = useState(dealer);
  const [playerScore, setPlayerScore] = useState(pScore);
  const [dealerScore, setDealerScore] = useState(dScore);
  const [standing, setStanding] = useState(false);
  const [twentyOne, setTwentyOne] = useState(false);

  const router = useRouter();

  async function logout() {
    try {
      await axios.post(
        "http://localhost:4000/user/logout",
        {},
        { withCredentials: true }
      );

      router.push("/");
    } catch (error) {
      console.log(error.message);
    }
  }

  async function cage() {
    router.push("/cage");
  }

  async function stand() {
    try {
      const userInfo = await axios.post(
        "http://localhost:4000/game/stand",
        { username: "Testing123" },
        { withCredentials: true }
      );

      // if the money changes it will send the object, else the object will not be sent.
      if (userInfo.data?.money !== undefined) {
        setBalance(userInfo.data.money);
      }
      setPlayerHand(userInfo.data.playerHand);
      setTempDealerHand(userInfo.data.dealerHand);
      setDealerHand((prev) => {
        const updated = [...prev];
        updated[0].num = userInfo.data.dealerHand[0].num;
        return updated;
      });
      const handLen = userInfo.data.dealerHand.length;
      // setDealerScore(userInfo.data.dealerScore);
      if (userInfo.data.game !== "hitStand") {
        setTimeout(() => {
          setGameStage(userInfo.data.game);
        }, handLen * 1000);
        console.log(handLen * 1000);
      }
      console.log(userInfo.data);
    } catch (error) {
      console.error(error.message);
    }
  }

  async function hit() {
    try {
      const userInfo = await axios.post(
        "http://localhost:4000/game/hit",
        { username: "Testing123" }, // remove later
        { withCredentials: true }
      );

      // if the money changes it will send the object, else the object will not be sent.
      if (userInfo.data?.money !== undefined) {
        setBalance(userInfo.data.money);
      }
      setPlayerHand(userInfo.data.playerHand);
      setTempDealerHand(userInfo.data.dealerHand);
      setDealerHand((prev) => {
        const updated = [...prev];
        updated[0].num = userInfo.data.dealerHand[0].num;
        return updated;
      }); // to fix bug if first card is ace and value gets converted to 1 on the backend to update the first card to get acurate score calculation.
      setPlayerScore(userInfo.data.playerScore);
      // setDealerScore(userInfo.data.dealerScore);
      if (userInfo.data.game !== "hitStand") {
        setTimeout(() => {
          setGameStage(userInfo.data.game);
        }, (tempDealerHand.length + 1) * 1000);
      }
      console.log(userInfo.data?.gameState);
    } catch (error) {
      console.log(error.message);
    }
  }

  useEffect(() => {
    if (tempDealerHand.length > dealerHand.length) {
      for (let i = dealerHand.length; i < tempDealerHand.length; i++) {
        const delay = (i - dealerHand.length + 1) * 1000;
        setTimeout(() => {
          setDealerHand((prev) => {
            const updated = [...prev, tempDealerHand[i]];

            let score = updated.reduce((sum, card) => sum + card.num, 0);
            setDealerScore(score);

            return updated; // sets dealer hand after score updated
          }); // used to prevent stale values when calculating the score
        }, delay);
      }
      setTempDealerHand([]);
    }

    if (twentyOne) {
      setTimeout(() => {
        setTwentyOne(false);
      }, 3000);
    }

    if (gameStage !== "bet" && gameStage !== "hitStand" && !twentyOne) {
      setTimeout(() => {
        setDisplayBalance(balance);
      }, 1000);
      setTimeout(() => {
        setGameStage("bet");
        setBet(0);
        setStanding(false);
      }, 2000);
    }
  }, [
    tempDealerHand,
    dealerHand,
    gameStage,
    twentyOne,
    displayBalance,
    balance,
  ]);

  return (
    <div className="flex flex-col h-[100vh]">
      <header className="flex justify-between items-center">
        <div className="flex items-center">
          <button className="bg-gray-600 options" onClick={cage}>
            Cage
          </button>
          <h2 className="text-[4vw] lg:text-[2.5vw] mt-[2vw] font-extrabold">
            Total ${displayBalance}
          </h2>
        </div>
        <div className="flex items-center">
          <h2 className="text-[3vw] lg:text-[1.5vw] font-bold mt-[1.5vw] lg:mt-[2vw]">
            {username}
          </h2>
          <button onClick={logout} className="bg-red-700 options">
            Logout
          </button>
        </div>
      </header>

      <AnimatePresence>
        {gameStage === "bet" && (
          <motion.div
            initial={{ y: "100vh" }}
            animate={{ y: "45vh" }}
            exit={{ y: "100vh" }}
            transition={{ duration: 0.5 }}
            className="flex justify-center w-[100vw]"
            style={{
              position: "fixed",
            }}
          >
            <PlaceBetModal
              bet={bet}
              setBet={setBet}
              money={balance}
              setBalance={setBalance}
              setDealerHand={setDealerHand}
              setTempDealerHand={setTempDealerHand}
              setPlayerHand={setPlayerHand}
              setGameStage={setGameStage}
              setPlayerScore={setPlayerScore}
              setDealerScore={setDealerScore}
              setTwentyOne={setTwentyOne}
            ></PlaceBetModal>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(gameStage === "hitStand" || twentyOne) && (
          <div className="flex flex-col-reverse items-center mt-auto">
            <div className="mb-[12vh]">
              <button
                onClick={() => {
                  stand();
                  setStanding(true);
                }}
                disabled={playerScore >= 21 || standing}
                className="bg-blue-800 options"
              >
                Stand
              </button>
              <button
                onClick={hit}
                disabled={playerScore >= 21 || standing}
                className="bg-red-700 options"
              >
                Hit
              </button>
            </div>
            <div className="flex justify-center h-[25vh] relative">
              {playerHand.map((card, index) => {
                const overlapOffset = 30;
                const centerOffset =
                  ((playerHand.length - 1) / 2) * overlapOffset;
                const x = overlapOffset * index - centerOffset;
                return (
                  <motion.div
                    key={`${card.display}-${card.suit}-${index}`}
                    initial={{ x: "50vw" }}
                    animate={{
                      x: `${x}px`,
                      y: `${index / 2}vh`,
                    }}
                    // exit={{ x: "50vw" }}
                    transition={{ duration: 0.5 }}
                    className="w-[14vh] h-[20vh] bg-white absolute border-black border-2 rounded-[1vh]"
                  >
                    {(card.suit === "♠" || card.suit === "♣") && (
                      <div className="flex flex-col">
                        <span className="font-bold text-[2vh] mx-[0.6vh]">
                          {card.display}
                        </span>
                        <span className="text-[1.5vh] mx-[0.6vh]">
                          {card.suit}
                        </span>
                      </div>
                    )}

                    {(card.suit === "♥" || card.suit === "♦") && (
                      <div className="text-red-600 flex flex-col">
                        <span className="font-bold text-[2vh] mx-[0.6vh]">
                          {card.display}
                        </span>
                        <span className="text-[1.5vh] mx-[0.6vh]">
                          {card.suit}
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {playerScore <= 21 ? (
              <h2 className="text-[3vh] font-bold">Score: {playerScore}</h2>
            ) : (
              <h2 className="text-red-700 text-[3vh] font-bold">
                Score: {playerScore}
              </h2>
            )}

            <div className="flex justify-center h-[25vh] relative">
              {dealerHand.map((card, index) => {
                const overlapOffset = 30;
                const centerOffset =
                  ((dealerHand.length - 1) / 2) * overlapOffset;
                const x = overlapOffset * index - centerOffset;

                return (
                  <motion.div
                    key={`${card.display}-${card.suit}-${index}`}
                    initial={{ x: "50vw" }}
                    animate={{
                      x: `${x}px`,
                      y: `${index / 2}vh`,
                    }}
                    // exit={{ x: "50vw" }}
                    transition={{ duration: 0.5 }}
                    className="w-[14vh] h-[20vh] bg-white absolute border-black border-2 rounded-[1vh]"
                  >
                    {(card.suit === "♠" || card.suit === "♣") && (
                      <div className="flex flex-col">
                        <span className="font-bold text-[2vh] mx-[0.6vh]">
                          {card.display}
                        </span>
                        <span className="text-[1.5vh] mx-[0.6vh]">
                          {card.suit}
                        </span>
                      </div>
                    )}

                    {(card.suit === "♥" || card.suit === "♦") && (
                      <div className="text-red-600 flex flex-col">
                        <span className="font-bold text-[2vh] mx-[0.6vh]">
                          {card.display}
                        </span>
                        <span className="text-[1.5vh] mx-[0.6vh]">
                          {card.suit}
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {dealerScore <= 21 ? (
              <h2 className="text-[3vh] font-bold">Dealer: {dealerScore}</h2>
            ) : (
              <h2 className="text-red-700 text-[3vh] font-bold">
                Dealer: {dealerScore}
              </h2>
            )}
          </div>
        )}
      </AnimatePresence>

      {gameStage === "bust" && !twentyOne && (
        <div className="flex justify-center items-center h-[100vh]">
          <h1 className="text-7xl">Bust!</h1>
        </div>
      )}

      {gameStage === "lose" && !twentyOne && (
        <div className="flex justify-center items-center h-[100vh]">
          <h1 className="text-7xl">Dealer wins!</h1>
        </div>
      )}

      {gameStage === "win" && !twentyOne && (
        <div className="flex justify-center items-center h-[100vh]">
          <h1 className="text-7xl">You win!</h1>
        </div>
      )}

      {gameStage === "tie" && !twentyOne && (
        <div className="flex justify-center items-center h-[100vh]">
          <h1 className="text-7xl">Tie!</h1>
        </div>
      )}
    </div>
  );
}
