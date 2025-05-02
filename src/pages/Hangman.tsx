
import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Header from '../components/Header';
import Footer from '../components/Footer';

const WORDS = [
  'JAVASCRIPT', 'REACTJS', 'TYPESCRIPT', 'VITE', 'TAILWIND',
  'COMPONENT', 'FUNCTION', 'VARIABLE', 'INTERFACE', 'SHADCN',
  'PROGRAMMING', 'DEVELOPER', 'WEBSITE', 'FRONTEND', 'BACKEND',
  'DATABASE', 'ALGORITHM', 'FRAMEWORK', 'LIBRARY', 'MIDDLEWARE'
];

const MAX_ATTEMPTS = 6;

const HANGMAN_STAGES = [
  // 0: Empty gallows
  `
  +---+
  |   |
      |
      |
      |
      |
=========`,
  // 1: Head
  `
  +---+
  |   |
  O   |
      |
      |
      |
=========`,
  // 2: Head and torso
  `
  +---+
  |   |
  O   |
  |   |
      |
      |
=========`,
  // 3: Head, torso, and one arm
  `
  +---+
  |   |
  O   |
 /|   |
      |
      |
=========`,
  // 4: Head, torso, and both arms
  `
  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========`,
  // 5: Head, torso, both arms, and one leg
  `
  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========`,
  // 6: Full hangman (game over)
  `
  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========`
];

const Hangman: React.FC = () => {
  const [word, setWord] = useState<string>('');
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongAttempts, setWrongAttempts] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [score, setScore] = useState<number>(0);
  const [gamesPlayed, setGamesPlayed] = useState<number>(0);
  const [gamesWon, setGamesWon] = useState<number>(0);

  // Choose a random word at the start of the game
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setWord(randomWord);
    setGuessedLetters(new Set());
    setWrongAttempts(0);
    setGameStatus('playing');
  };

  // Check if the player has won
  const isWon = word.split('').every(letter => guessedLetters.has(letter));

  // Check if the player has lost
  const isLost = wrongAttempts >= MAX_ATTEMPTS;

  // Update game status when win/lose conditions are met
  useEffect(() => {
    if (isWon && gameStatus === 'playing') {
      setGameStatus('won');
      const newScore = score + 100 - wrongAttempts * 10;
      setScore(newScore);
      setGamesWon(gamesWon + 1);
      setGamesPlayed(gamesPlayed + 1);
      toast.success("Congratulations! You won!");
    } else if (isLost && gameStatus === 'playing') {
      setGameStatus('lost');
      setGamesPlayed(gamesPlayed + 1);
      toast.error(`Game over! The word was: ${word}`);
    }
  }, [isWon, isLost, gameStatus]);

  const handleLetterGuess = (letter: string) => {
    if (gameStatus !== 'playing') return;

    // If letter already guessed, do nothing
    if (guessedLetters.has(letter)) {
      toast.info("You've already guessed this letter!");
      return;
    }

    // Add letter to guessed letters
    const newGuessedLetters = new Set(guessedLetters);
    newGuessedLetters.add(letter);
    setGuessedLetters(newGuessedLetters);

    // Check if the guessed letter is in the word
    if (!word.includes(letter)) {
      setWrongAttempts(wrongAttempts + 1);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-funzone-purple mb-2">Hangman</h1>
          <p className="text-gray-600">
            Guess the word one letter at a time. Be careful - you only have 6 wrong attempts!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Game Board</span>
                <span className="text-sm font-normal bg-funzone-light-purple text-funzone-dark-purple px-3 py-1 rounded-full">
                  Wrong Attempts: {wrongAttempts}/{MAX_ATTEMPTS}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-inner border border-gray-200">
                  <pre className="font-mono text-xs sm:text-sm md:text-base text-gray-700">
                    {HANGMAN_STAGES[wrongAttempts]}
                  </pre>
                </div>
                
                <div className="flex flex-col justify-center items-center">
                  <div className="mb-8 flex justify-center">
                    {word.split('').map((letter, index) => (
                      <div 
                        key={index} 
                        className="w-8 h-10 mx-1 border-b-2 border-funzone-purple flex justify-center items-center text-xl font-bold"
                      >
                        {guessedLetters.has(letter) ? letter : ''}
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-center mb-4">
                    <p className="text-lg font-medium mb-2">
                      {gameStatus === 'won' ? 'Congratulations! You won!' : 
                       gameStatus === 'lost' ? `Game over! The word was: ${word}` : 
                       'Select a letter to guess'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <div className="grid grid-cols-9 sm:grid-cols-13 gap-1 sm:gap-2 justify-center">
                  {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
                    <Button
                      key={letter}
                      variant={
                        guessedLetters.has(letter)
                          ? word.includes(letter)
                            ? "default"
                            : "destructive"
                          : "outline"
                      }
                      className={`w-8 h-8 sm:w-10 sm:h-10 text-sm sm:text-base font-medium ${
                        guessedLetters.has(letter) ? 'cursor-not-allowed' : ''
                      }`}
                      disabled={guessedLetters.has(letter) || gameStatus !== 'playing'}
                      onClick={() => handleLetterGuess(letter)}
                    >
                      {letter}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                onClick={startNewGame} 
                className="bg-funzone-purple hover:bg-funzone-dark-purple"
              >
                {gameStatus === 'playing' ? 'New Game' : 'Play Again'}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Game Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-funzone-light-purple rounded-lg p-4">
                  <p className="text-sm text-funzone-dark-purple font-medium">Current Score</p>
                  <p className="text-3xl font-bold text-funzone-purple">{score}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-100 rounded-lg p-4">
                    <p className="text-sm text-gray-600 font-medium">Games Played</p>
                    <p className="text-2xl font-bold">{gamesPlayed}</p>
                  </div>
                  
                  <div className="bg-gray-100 rounded-lg p-4">
                    <p className="text-sm text-gray-600 font-medium">Games Won</p>
                    <p className="text-2xl font-bold">{gamesWon}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">How to Play</h2>
          <div className="space-y-2">
            <p className="text-gray-600">1. A random word is chosen at the start of each game.</p>
            <p className="text-gray-600">2. Click on a letter to guess if it's in the word.</p>
            <p className="text-gray-600">3. Correct guesses reveal the letter in the word.</p>
            <p className="text-gray-600">4. Incorrect guesses add a part to the hangman drawing.</p>
            <p className="text-gray-600">5. You win by guessing all letters in the word before the hangman is complete.</p>
            <p className="text-gray-600">6. You lose if the hangman drawing is completed (6 wrong guesses).</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default Hangman;
