
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdSpace from '../components/AdSpace';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// Sudoku difficulty levels
const DIFFICULTY_LEVELS = {
  EASY: { name: 'Easy', emptyCells: 30 },
  MEDIUM: { name: 'Medium', emptyCells: 40 },
  HARD: { name: 'Hard', emptyCells: 50 },
};

const Sudoku: React.FC = () => {
  // Game state
  const [board, setBoard] = useState<number[][]>([]);
  const [initialBoard, setInitialBoard] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [difficulty, setDifficulty] = useState(DIFFICULTY_LEVELS.EASY);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [hints, setHints] = useState(3);

  // Generate a valid Sudoku board
  const generateSudokuBoard = useCallback(() => {
    // Create an empty 9x9 board
    const newBoard = Array(9).fill(null).map(() => Array(9).fill(0));
    
    // Solve the empty board to get a complete valid solution
    const success = solveSudoku(newBoard);
    
    if (!success) {
      // Should never happen with an empty board
      console.error("Failed to generate a valid Sudoku board");
      return newBoard;
    }

    // Create a copy of the solved board to use as the solution
    const solvedBoard = newBoard.map(row => [...row]);
    
    // Remove some numbers based on difficulty
    const boardWithRemovedCells = solvedBoard.map(row => [...row]);
    
    // Create a list of all cell positions
    const positions = [];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        positions.push([i, j]);
      }
    }
    
    // Shuffle the positions
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    
    // Remove cells based on difficulty
    for (let i = 0; i < difficulty.emptyCells && i < positions.length; i++) {
      const [row, col] = positions[i];
      boardWithRemovedCells[row][col] = 0;
    }
    
    return { playBoard: boardWithRemovedCells, solutionBoard: solvedBoard };
  }, [difficulty]);

  // Check if a number can be placed at a specific position
  const isValid = (board: number[][], row: number, col: number, num: number): boolean => {
    // Check row
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num) return false;
    }
    
    // Check column
    for (let i = 0; i < 9; i++) {
      if (board[i][col] === num) return false;
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[boxRow + i][boxCol + j] === num) return false;
      }
    }
    
    return true;
  };

  // Solve the Sudoku board using backtracking
  const solveSudoku = (board: number[][]): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          // Try placing numbers 1-9
          for (let num = 1; num <= 9; num++) {
            if (isValid(board, row, col, num)) {
              // Place the number
              board[row][col] = num;
              
              // Recursively try to solve the rest of the board
              if (solveSudoku(board)) {
                return true;
              }
              
              // If placing the number doesn't lead to a solution, backtrack
              board[row][col] = 0;
            }
          }
          
          // No valid number found for this cell
          return false;
        }
      }
    }
    
    // All cells are filled
    return true;
  };

  // Start a new game
  const startNewGame = () => {
    const { playBoard, solutionBoard } = generateSudokuBoard();
    setBoard(playBoard.map(row => [...row]));
    setInitialBoard(playBoard.map(row => [...row]));
    setSelectedCell(null);
    setIsGameOver(false);
    setTimeElapsed(0);
    setIsTimerRunning(true);
    setMistakes(0);
    setHints(3);
  };

  // Reset the current game
  const resetGame = () => {
    setBoard(initialBoard.map(row => [...row]));
    setSelectedCell(null);
    setTimeElapsed(0);
    setIsTimerRunning(true);
    setMistakes(0);
    setHints(3);
  };

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    // Only allow selecting empty cells or cells that were empty in the initial board
    if (!isGameOver && initialBoard[row][col] === 0) {
      setSelectedCell([row, col]);
    }
  };

  // Handle number input for selected cell
  const handleNumberInput = (num: number) => {
    if (!selectedCell || isGameOver) return;
    
    const [row, col] = selectedCell;
    
    // Only allow changing cells that were empty in the initial board
    if (initialBoard[row][col] !== 0) return;
    
    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = num;
    setBoard(newBoard);
    
    // Check if the move is valid by solving the board and comparing
    const { solutionBoard } = generateSudokuBoard();
    if (solutionBoard[row][col] !== num) {
      setMistakes(prevMistakes => prevMistakes + 1);
      toast.error("Incorrect move!");
      
      // Limit mistakes to 3 before game over
      if (mistakes >= 2) {
        setIsGameOver(true);
        setIsTimerRunning(false);
        toast.error("Game over! Too many mistakes.");
      }
    }
    
    // Check if the game is won
    if (!newBoard.some(row => row.includes(0))) {
      const isCorrect = newBoard.every((row, rowIdx) => 
        row.every((cell, colIdx) => cell === solutionBoard[rowIdx][colIdx])
      );
      
      if (isCorrect) {
        setIsGameOver(true);
        setIsTimerRunning(false);
        toast.success("Congratulations! You've solved the puzzle!");
        
        // Save high score
        const highScore = localStorage.getItem('sudokuHighScore') || '9999';
        if (timeElapsed < parseInt(highScore)) {
          localStorage.setItem('sudokuHighScore', timeElapsed.toString());
          toast("New high score!", {
            description: `You completed the puzzle in ${formatTime(timeElapsed)}!`,
          });
        }
      }
    }
  };

  // Use a hint
  const useHint = () => {
    if (!selectedCell || hints <= 0 || isGameOver) return;
    
    const [row, col] = selectedCell;
    
    // Only provide hints for empty cells
    if (board[row][col] !== 0) return;
    
    setHints(prevHints => prevHints - 1);
    
    // Solve the current board to find the correct number
    const { solutionBoard } = generateSudokuBoard();
    const correctNumber = solutionBoard[row][col];
    
    const newBoard = board.map(boardRow => [...boardRow]);
    newBoard[row][col] = correctNumber;
    setBoard(newBoard);
    
    toast("Hint used!", {
      description: `Correct number: ${correctNumber}`,
    });
    
    // Check if the game is won after using a hint
    if (!newBoard.some(row => row.includes(0))) {
      setIsGameOver(true);
      setIsTimerRunning(false);
      toast.success("Congratulations! You've solved the puzzle!");
    }
  };

  // Change difficulty level
  const changeDifficulty = (newDifficulty: typeof DIFFICULTY_LEVELS.EASY) => {
    setDifficulty(newDifficulty);
    toast(`Difficulty set to ${newDifficulty.name}`);
  };

  // Format time display (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer effect
  useEffect(() => {
    let timerId: number | undefined;
    
    if (isTimerRunning) {
      timerId = window.setInterval(() => {
        setTimeElapsed(prevTime => prevTime + 1);
      }, 1000);
    }
    
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [isTimerRunning]);

  // Initialize game on component mount and when difficulty changes
  useEffect(() => {
    startNewGame();
  }, [difficulty]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/" className="flex items-center text-funzone-purple hover:text-funzone-dark-purple transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            Back to Games
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Sudoku</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="mb-4 flex justify-between w-full max-w-md">
                <div className="text-lg">
                  <span className="font-bold">Time:</span> {formatTime(timeElapsed)}
                </div>
                <div className="text-lg">
                  <span className="font-bold">Mistakes:</span> {mistakes}/3
                </div>
                <div className="text-lg">
                  <span className="font-bold">Hints:</span> {hints}
                </div>
              </div>
              
              <div className="border-2 border-gray-300 mb-6 p-1 bg-white">
                <div className="grid grid-cols-9 gap-0.5 bg-gray-200">
                  {board.map((row, rowIdx) => 
                    row.map((cell, colIdx) => {
                      const isInitial = initialBoard[rowIdx][colIdx] !== 0;
                      const isSelected = selectedCell && selectedCell[0] === rowIdx && selectedCell[1] === colIdx;
                      const boxRow = Math.floor(rowIdx / 3);
                      const boxCol = Math.floor(colIdx / 3);
                      const isAlternateBox = (boxRow + boxCol) % 2 === 1;
                      
                      return (
                        <div 
                          key={`${rowIdx}-${colIdx}`}
                          className={`
                            w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center 
                            text-lg font-bold cursor-pointer select-none
                            ${isInitial ? 'bg-gray-100 text-black' : 'bg-white text-funzone-purple'}
                            ${isSelected ? 'bg-funzone-light-purple' : ''}
                            ${isAlternateBox ? 'bg-opacity-60' : ''}
                            ${(rowIdx + 1) % 3 === 0 && rowIdx < 8 ? 'border-b-2 border-gray-400' : ''}
                            ${(colIdx + 1) % 3 === 0 && colIdx < 8 ? 'border-r-2 border-gray-400' : ''}
                          `}
                          onClick={() => handleCellClick(rowIdx, colIdx)}
                        >
                          {cell !== 0 ? cell : ''}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-9 gap-1 mb-6 max-w-md">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button
                    key={num}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-funzone-purple text-white font-bold text-lg rounded hover:bg-funzone-dark-purple transition-colors"
                    onClick={() => handleNumberInput(num)}
                    disabled={isGameOver}
                  >
                    {num}
                  </button>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6 justify-center">
                <Button 
                  onClick={startNewGame}
                  variant="default" 
                  className="bg-funzone-purple hover:bg-funzone-dark-purple"
                >
                  New Game
                </Button>
                <Button 
                  onClick={resetGame}
                  variant="outline"
                >
                  Reset
                </Button>
                <Button 
                  onClick={useHint}
                  variant="outline"
                  disabled={hints <= 0 || !selectedCell || isGameOver}
                  className="text-funzone-orange border-funzone-orange hover:bg-funzone-orange/10"
                >
                  Use Hint ({hints})
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  onClick={() => changeDifficulty(DIFFICULTY_LEVELS.EASY)}
                  variant={difficulty === DIFFICULTY_LEVELS.EASY ? "default" : "outline"}
                  className={difficulty === DIFFICULTY_LEVELS.EASY ? "bg-funzone-purple hover:bg-funzone-dark-purple" : ""}
                >
                  Easy
                </Button>
                <Button
                  onClick={() => changeDifficulty(DIFFICULTY_LEVELS.MEDIUM)}
                  variant={difficulty === DIFFICULTY_LEVELS.MEDIUM ? "default" : "outline"}
                  className={difficulty === DIFFICULTY_LEVELS.MEDIUM ? "bg-funzone-purple hover:bg-funzone-dark-purple" : ""}
                >
                  Medium
                </Button>
                <Button
                  onClick={() => changeDifficulty(DIFFICULTY_LEVELS.HARD)}
                  variant={difficulty === DIFFICULTY_LEVELS.HARD ? "default" : "outline"}
                  className={difficulty === DIFFICULTY_LEVELS.HARD ? "bg-funzone-purple hover:bg-funzone-dark-purple" : ""}
                >
                  Hard
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How to Play</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Fill in the grid so that every row, column, and 3×3 box contains digits 1-9</li>
                  <li>Click on an empty cell and then click a number to fill it</li>
                  <li>You can't change the initial numbers</li>
                  <li>You're allowed 3 mistakes before the game ends</li>
                  <li>Use hints wisely - you only get 3 per game</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Best Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-2xl font-bold text-funzone-purple">
                    {localStorage.getItem('sudokuHighScore') 
                      ? formatTime(parseInt(localStorage.getItem('sudokuHighScore') || '0')) 
                      : "No record yet"}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Try to beat your best time!</p>
                </div>
              </CardContent>
            </Card>
            
            <AdSpace width="300px" height="250px" />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Sudoku;
