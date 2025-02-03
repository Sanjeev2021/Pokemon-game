"use client";
import { useScroll } from "framer-motion";
import { The_Nautigal } from "next/font/google";
import { useState, useEffect } from "react";

export default function PokemonCards() {
  const [pokemons, setPokemons] = useState([]);
  const [revealed, setRevealed] = useState({});
  const [userSelection, setUserSelection] = useState([]);
  const [computerSelection, setComputerSelection] = useState([]);
  const [battleStarted, setBattleStarted] = useState(false);
  const [battleMusic, setBattleMusic] = useState(null);
  const [battlePhase, setBattlePhase] = useState(false);
  const [battleResult, setBattleResult] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [curtainsVisible, setCurtainsVisible] = useState(false);
  const [curtainsState, setCurtainsState] = useState(""); // 'in', 'out', ''
  const [currentPokemon, setCurrentPokemon] = useState({});
  const [showPokemon, setShowPokemon] = useState(false);
  const [clickable, setClickable] = useState(true);
  const [animationPlaying, setAnimationPlaying] = useState(false);
  const[mute, setMute] = useState(false)
  const[mouseClickSound, setMouseClickSound] = useState(null)

  const slideInCurtains = () => {
    setCurtainsState("in");
    setCurtainsVisible(true);
  };

  const slideOutCurtains = () => {
    setCurtainsState("out");
    setTimeout(function () {
      setCurtainsVisible(false);
      setShowPokemon(false);
    }, 1500);
  };

  useEffect(() => {
    setMouseClickSound(new Audio("/mouse-click.mp3"))
  // only run once on the first render on the client
  }, [])

  useEffect(() => {
    async function fetchPokemon() {
      const offset = Math.floor(Math.random() * 500);
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=10&offset=${offset}`
      );
      const data = await res.json();
      const detailedData = await Promise.all(
        data.results.map(async (pokemon) => {
          const res = await fetch(pokemon.url);
          const details = await res.json();
          return {
            name: pokemon.name,
            image: details.sprites.front_default,
            hp: details.stats.find((stat) => stat.stat.name === "hp").base_stat,
            attack: details.stats.find((stat) => stat.stat.name === "attack")
              .base_stat,
            defense: details.stats.find((stat) => stat.stat.name === "defense")
              .base_stat,
          };
        })
      );
      setPokemons(detailedData);
    }
    fetchPokemon();
  }, []);

  const playFlipSound = () => {
    const flipSound = new Audio("/flip-sound.mp3");
    flipSound.play();
  };

  const handleAnimation = (_callback) => {
    slideInCurtains();
    setTimeout(function () {
      playFlipSound();
      setTimeout(function () {
        setShowPokemon(true);
        if (userSelection.length >= 2) {
          setClickable(false);
        }
        slideOutCurtains();
        _callback();
      }, 1000);
    }, 1500);
  };

  const handleClick = (pokemon, index) => {
    if (animationPlaying) {
      return;
    }
    setAnimationPlaying(true);
    mouseClickSound.play();
    if (!revealed[index]) {
      handleAnimation(function () {
        setCurrentPokemon(pokemons[index]);
        setRevealed((prev) => ({ ...prev, [index]: true }));
        setAnimationPlaying(false);
      });
    }
    if (userSelection.length < 3 && !userSelection.includes(pokemon)) {
      setUserSelection([...userSelection, pokemon]);
    }
  };

  const startBattle = () => {
    const availablePokemons = pokemons.filter(
      (pokemon) => !userSelection.includes(pokemon)
    );
    const shuffled = availablePokemons.sort(() => 0.5 - Math.random());
    setComputerSelection(shuffled.slice(0, 3));
    setBattleStarted(true);
    const music = new Audio("/battle-music.mp3");
    music.loop = true;
    music.play();
    setBattleMusic(music);
  };

  const exitBattle = () => {
    setBattleStarted(false);
    setBattlePhase(false);
    setUserSelection([]);
    setComputerSelection([]);
    setRevealed({});
    setBattleResult(null);
    setCurrentRound(0);
    setUserScore(0);
    setComputerScore(0);
    setClickable(true);
    if (battleMusic) battleMusic.pause();
  };

  const nextRound = () => {
    if (currentRound < 3) {
      const userPokemon = userSelection[currentRound];
      const computerPokemon = computerSelection[currentRound];

      if (
        userPokemon.attack + userPokemon.defense >
        computerPokemon.attack + computerPokemon.defense
      ) {
        setUserScore((prev) => prev + 1);
      } else if (
        computerPokemon.attack + computerPokemon.defense >
        userPokemon.attack + userPokemon.defense
      ) {
        setComputerScore((prev) => prev + 1);
      }

      setCurrentRound((prev) => prev + 1);
      if (currentRound === 2) {
        setTimeout(declareWinner, 2000)
      }
    }
  };

  const toggleVolume = () => {
    if (battleMusic.volume == 0) {
      battleMusic.volume = 1;
      setMute(false);
    } else {
      battleMusic.volume = 0;
      setMute(true);
    }
  }

  const declareWinner = () => {
    console.log(userScore, computerScore)
    if (userScore > computerScore) {
      setBattleResult("You win!")
    } else {
      setBattleResult("You lost!")
    }
    setBattlePhase(false);
  };

  return (
    <>
      {curtainsVisible && (
        <>
          <div className={"curtainContainer"}>
            <div
              className={`curtainLeft ${
                curtainsState === "out" ? "slideOutLeft" : ""
              }`}
            ></div>
            <div
              className={`curtainRight ${
                curtainsState === "out" ? "slideOutRight" : ""
              }`}
            ></div>
          </div>

          {showPokemon ? (
            <main className="cardContainer">
              <div
                className={`relative w-56 h-72 bg-gray-800 rounded-2xl cursor-pointer shadow-2xl border-4 transition-transform duration-500 transform hover:scale-105 hover:shadow-yellow-500 border-yellow-400 fade-in`}
              >
                {currentPokemon.image && (
                  <>
                    <img
                      src={currentPokemon.image}
                      alt={currentPokemon.name}
                      className="mt-4 w-32 h-32 mx-auto transition-opacity duration-500 opacity-100 drop-shadow-lg"
                    />
                    <h2 className="mt-2 text-2xl font-extrabold capitalize text-white text-center drop-shadow-md">
                      {currentPokemon.name}
                    </h2>
                    <p className="text-white text-lg text-center w-full">
                      HP: {currentPokemon.hp}
                    </p>
                    <p className="text-white text-lg text-center w-full">
                      Attack: {currentPokemon.attack}
                    </p>
                    <p className="text-white text-lg text-center w-full">
                      Defense: {currentPokemon.defense}
                    </p>
                  </>
                )}
              </div>
            </main>
          ) : (
            <></>
          )}
        </>
      )}

      <div
        className="text-center p-4 min-h-screen bg-cover bg-center"
        style={{ backgroundImage: "url('/pokemon-bg.jpg')" }}
      >
        <h1 className="text-white text-4xl font-extrabold mb-8 uppercase">
          PokéBattle
        </h1>
        {!battleStarted ? (
          <>
            <p className="text-white text-2xl font-bold mb-6">
              Choose your 3 Pokémons
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-6">
              {pokemons.map((pokemon, index) => (
                <div key={index}>
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    {!revealed[index] ? (
                      <img
                        src="/pokeball.png"
                        className={`relative w-100 h-100 p-6 ${
                          clickable ? "cursor-pointer" : "cursor-default"
                        } transition-transform duration-500 transform ${
                          clickable ? "hover:scale-110" : "hover:scale-100"
                        } ${clickable ? "opacity-100" : "opacity-30"}`}
                        onClick={() => {
                          clickable
                            ? handleClick(pokemon, index)
                            : () => {
                                return;
                              };
                        }}
                      ></img>
                    ) : (
                      <>
                        <div
                          className={`relative w-56 h-72 bg-gray-800 rounded-2xl cursor-pointer shadow-2xl border-4 transition-transform duration-500 transform hover:scale-105 hover:shadow-yellow-500 border-yellow-400 `}
                          onClick={() => handleClick(pokemon, index)}
                        >
                          <img
                            src={pokemon.image}
                            alt={pokemon.name}
                            className="mt-4 w-32 h-32 mx-auto transition-opacity duration-500 opacity-100 drop-shadow-lg"
                          />
                          <h2 className="mt-2 text-2xl font-extrabold capitalize text-white text-center drop-shadow-md">
                            {pokemon.name}
                          </h2>
                          <p className="text-white text-lg">HP: {pokemon.hp}</p>
                          <p className="text-white text-lg">
                            Attack: {pokemon.attack}
                          </p>
                          <p className="text-white text-lg">
                            Defense: {pokemon.defense}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="mt-6 px-6 py-3 bg-red-500 text-white text-xl font-bold rounded-lg hover:bg-red-700 transition"
              onClick={startBattle}
              disabled={userSelection.length < 3}
            >
              Enter the BattleGround
            </button>
          </>
        ) : (
          <>
            <button></button>
            <div className="text-white text-2xl font-bold mt-6">
              {battlePhase ? (
                <>
                  <h2 className="text-3xl mb-4">Battle in Progress...</h2>
                  <button
                    className="px-6 py-3 bg-green-500 text-white rounded-lg mt-4 hover:bg-green-700"
                    onClick={nextRound}
                  >
                    Next Round
                  </button>
                  <button
                    className="ml-4 px-6 py-3 bg-red-500 text-white rounded-lg mt-4 hover:bg-red-700"
                    onClick={exitBattle}
                  >
                    Exit Battle
                  </button>
                </>
              ) : (
                <>
                  <button className="w-[48px] h-[48px] fixed top-[3%] left-[95.5%] bg-neutral-900 rounded-lg hover:bg-neutral-950 hover:scale-110 duration-200 place-items-center" onClick={toggleVolume}>
                    <img alt="mute/unmute button" src={`${mute ? '/mute.png' : '/volume.png'}`} className={'w-[80%] h-[80%]'} />
                  </button>
                  {currentRound < 3 ? (
                    <div>
                      <h2 className="text-3xl mb-4">
                        Round {currentRound + 1}
                      </h2>
                      <div className="flex justify-around items-center gap-10">
                        <div className="bg-zinc-800 p-4 rounded-lg w-[300px] h-[400px] shadow-2xl">
                          <img
                            src={userSelection[currentRound].image}
                            alt={userSelection[currentRound].name}
                            className="w-[75%] h-auto ml-[12.5%]"
                          />
                          <h3 className="text-white text-xl font-bold">
                            {userSelection[currentRound].name}
                          </h3>
                          <p className="text-white">
                            Attack: {userSelection[currentRound].attack}
                          </p>
                          <p className="text-white">
                            Defense: {userSelection[currentRound].defense}
                          </p>
                        </div>
                        <h2 className="text-5xl font-extrabold">VS</h2>
                        <div className="bg-zinc-800 p-4 rounded-lg w-[300px] h-[400px] shadow-2xl">
                          <img
                            src={computerSelection[currentRound].image}
                            alt={computerSelection[currentRound].name}
                            className="w-[75%] h-auto ml-[12.5%]"
                          />
                          <h3 className="text-white text-xl font-bold">
                            {computerSelection[currentRound].name}
                          </h3>
                          <p className="text-white">
                            Attack: {computerSelection[currentRound].attack}
                          </p>
                          <p className="text-white">
                            Defense: {computerSelection[currentRound].defense}
                          </p>
                        </div>
                      </div>
                      <button
                        className="mt-6 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-700"
                        onClick={nextRound}
                      >
                        Next Round
                      </button>
                    </div>
                  ) : (
                    <>
                      <h2 className="mt-6 text-4xl">{battleResult}</h2>
                      <p className="text-xl mt-4">
                        Final Score - You: {userScore}, Computer:{" "}
                        {computerScore}
                      </p>
                      <button
                        className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
                        onClick={exitBattle}
                      >
                        Play Again
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
