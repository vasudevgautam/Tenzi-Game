import React, { useState, useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import Confetti from "react-confetti";
import { useWindowSize } from "@react-hook/window-size";

function generateNewDie() {
  return {
    id: nanoid(),
    value: Math.ceil(Math.random() * 6),
    isHeld: false,
  };
}

function allNewDice() {
  return Array.from({ length: 10 }, generateNewDie);
}

function Die({ value, isHeld, holdDie }) {
  return (
    <div
      className={`w-12 h-12 flex items-center justify-center rounded-md text-xl font-bold cursor-pointer ${
        isHeld ? "bg-green-400" : "bg-white"
      }`}
      onClick={holdDie}
    >
      {value}
    </div>
  );
}

export default function App() {
  const [dice, setDice] = useState(allNewDice);
  const [tenzies, setTenzies] = useState(false);
  const [name, setName] = useState("");
  const [playerName, setPlayerName] = useState(null);

  const [time, setTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [bestTime, setBestTime] = useState(
    () => JSON.parse(localStorage.getItem("bestTime")) || null
  );
  const timerRef = useRef(null);
  const [width, height] = useWindowSize();

  const winAudio = useRef(new Audio("/win.mp3.wav")); // Add win.mp3 in your public folder

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  useEffect(() => {
    const allHeld = dice.every((die) => die.isHeld);
    const firstValue = dice[0].value;
    const allSameValue = dice.every((die) => die.value === firstValue);
    if (allHeld && allSameValue) {
      setTenzies(true);
      setTimerActive(false);
      winAudio.current.play();

      if (!bestTime || time < bestTime) {
        setBestTime(time);
        localStorage.setItem("bestTime", JSON.stringify(time));
      }
    }
  }, [dice]);

  function rollDice() {
    if (tenzies) {
      setDice(allNewDice());
      setTenzies(false);
      setTime(0);
      setTimerActive(true);
    } else {
      setDice((oldDice) =>
        oldDice.map((die) => (die.isHeld ? die : generateNewDie()))
      );
    }
  }

  function holdDie(id) {
    setDice((oldDice) =>
      oldDice.map((die) =>
        die.id === id ? { ...die, isHeld: !die.isHeld } : die
      )
    );
  }

  function startGame(e) {
    e.preventDefault();
    if (name.trim()) {
      setPlayerName(name.trim());
      setTime(0);
      setTimerActive(true);
    }
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  const diceElements = dice.map((die) => (
    <Die key={die.id} {...die} holdDie={() => holdDie(die.id)} />
  ));

  // Show name input screen
  if (!playerName) {
    return (
      <main className="h-screen flex flex-col items-center justify-center bg-blue-100">
        <h1 className="text-3xl font-bold mb-4">🎲 Welcome to Tenzi!</h1>
        <form onSubmit={startGame} className="flex flex-col gap-4 items-center">
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-2 rounded-md border border-gray-300"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
          >
            Start Game
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col items-center justify-center bg-blue-100 gap-4 relative overflow-hidden px-4 text-center">
      {tenzies && <Confetti width={width} height={height} />}
      <h1 className="text-2xl font-bold">Player: {playerName}</h1>
      <h2 className="text-3xl font-bold">🎲 Tenzi Game</h2>
      <p className="text-lg text-gray-700">
        Roll until all dice are the same. Click a die to hold its value.
      </p>
      <div className="text-md font-medium">
        ⏱ Time: {formatTime(time)}{" "}
        {bestTime !== null && (
          <span className="ml-4 text-green-700">
            🏆 Best Time: {formatTime(bestTime)}
          </span>
        )}
      </div>
      <div className="grid grid-cols-5 gap-4">{diceElements}</div>
      <button
        onClick={rollDice}
        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
      >
        {tenzies ? "Play Again" : "Roll"}
      </button>
    </main>
  );
}
