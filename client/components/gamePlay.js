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
  const [gameStage, setGameStage] = useState(gameState); // states (bet, hitStand, 21, win, tie, bust, lose)
  const [bet, setBet] = useState(0);
  const [playerHand, setPlayerHand] = useState(player);
  const [dealerHand, setDealerHand] = useState(dealer);
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
      console.log(error);
    }
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
      setDealerHand(userInfo.data.dealerHand);
      setDealerScore(userInfo.data.dealerScore);
      setTimeout(() => {
        setGameStage(userInfo.data.game);
      }, 3000);
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
      setDealerHand(userInfo.data.dealerHand);
      setPlayerScore(userInfo.data.playerScore);
      setDealerScore(userInfo.data.dealerScore);
      if (userInfo.data.game !== "hitStand") {
        setTimeout(() => {
          setGameStage(userInfo.data.game);
        }, 3000);
      }
      console.log(userInfo.data?.gameState);
    } catch (error) {
      console.log(error.message);
    }
  }

  useEffect(() => {
    if (gameStage !== "bet" && gameStage !== "hitStand") {
      setTimeout(() => {
        setGameStage("bet");
        setBet(0);
        setStanding(false);
        setTwentyOne(false);
      }, 2000);
    }
  }, [gameStage]);

  return (
    <div className="flex flex-col h-[100vh]">
      <header>
        <h2>{username}</h2>
        <h2>Total ${balance}</h2>
        <button onClick={logout}>Logout</button>
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
            <div className="flex justify-center h-[30vh] relative">
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
                      y: `${index}vh`,
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

            <h2 className="text-[3vh] font-bold">Score: {playerScore}</h2>

            <div className="flex justify-center h-[30vh] relative">
              {dealerHand.map((card, index) => {
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
                      y: `${index}vh`,
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

            <h2 className="text-[3vh] font-bold">Dealer: {dealerScore}</h2>
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
