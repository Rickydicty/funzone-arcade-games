
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Header from '../components/Header';
import Footer from '../components/Footer';
import { toast } from "sonner";

interface SudokuBoard {
  playBoard: number[][];
  solutionBoard: number[][];
}

const generateSudokuBoard = (difficulty: 'easy' | 'medium' | 'hard'): SudokuBoard => {
  // Generate a completed Sudoku board
  const completedBoard = generateCompletedBoard();
  
  // Create a copy of the completed board
  const playBoard = JSON.parse(JSON.stringify(completedBoard));
  
  // Remove numbers based on difficulty
  const cellsToRemove = difficulty === 'easy' ? 35 : difficulty === 'medium' ? 45 : 55;
  
  // Remove random numbers from the board
  let removedCount = 0;
  while (removedCount < cellsToRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    
    if (playBoard[row][col] !== 0) {
      playBoard[row][col] = 0;
      removedCount++;
    }
  }
  
  return { playBoard, solutionBoard: completedBoard };
};

// Helper function to generate a completed Sudoku board
const generateCompletedBoard = (): number[][] => {
  // Start with an empty 9x9 board
  const board = Array(9).fill(0).map(() => Array(9).fill(0));
  
  // Fill the board using backtracking algorithm
  solveSudoku(board);
  
  return board;
};

// Backtracking algorithm to solve a Sudoku board
const solveSudoku = (board: number[][]): boolean => {
  // Find an empty cell
  let row = -1;
  let col = -1;
  let isEmpty = false;
  
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === 0) {
        row = i;
        col = j;
        isEmpty = true;
        break;
      }
    }
    if (isEmpty) break;
  }
  
  // If there are no empty cells, the board is solved
  if (!isEmpty) return true;
  
  // Try placing digits 1-9 in the empty cell
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  shuffleArray(numbers); // Randomize the order to generate different boards
  
  for (const num of numbers) {
    if (isSafe(board, row, col, num)) {
      board[row][col] = num;
      
      if (solveSudoku(board)) {
        return true;
      }
      
      board[row][col] = 0; // Backtrack if the current configuration doesn't lead to a solution
    }
  }
  
  return false;
};

// Check if it's safe to place a number at a specific position
const isSafe = (board: number[][], row: number, col: number, num: number): boolean => {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }
  
  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }
  
  // Check 3x3 box
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }
  
  return true;
};

// Helper function to shuffle an array (Fisher-Yates algorithm)
const shuffleArray = (array: number[]): void => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const Sudoku: React.FC = () => {
  const [board, setBoard] = useState<SudokuBoard>({ playBoard: [], solutionBoard: [] });
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [timer, setTimer] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [mistakes, setMistakes] = useState<number>(0);
  const [originalCells, setOriginalCells] = useState<boolean[][]>([]);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  
  // Initialize game
  useEffect(() => {
    startNewGame();
  }, []);
  
  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && !gameOver) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, gameOver]);
  
  const startNewGame = () => {
    const newBoard = generateSudokuBoard(difficulty);
    setBoard(newBoard);
    setSelectedCell(null);
    setTimer(0);
    setIsRunning(true);
    setGameOver(false);
    setMistakes(0);
    setHintsUsed(0);
    
    // Track which cells were originally filled
    const originalArray = Array(9).fill(0).map(() => Array(9).fill(false));
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (newBoard.playBoard[i][j] !== 0) {
          originalArray[i][j] = true;
        }
      }
    }
    setOriginalCells(originalArray);
  };
  
  const handleCellClick = (row: number, col: number) => {
    if (!gameOver && !originalCells[row][col]) {
      setSelectedCell([row, col]);
    }
  };
  
  const handleNumberInput = (num: number) => {
    if (selectedCell && !gameOver) {
      const [row, col] = selectedCell;
      
      if (originalCells[row][col]) return;
      
      const newBoard = { ...board };
      
      // Check if the move is valid
      if (num === board.solutionBoard[row][col]) {
        newBoard.playBoard[row][col] = num;
        setBoard(newBoard);
        
        // Check if the puzzle is solved
        if (isBoardComplete(newBoard.playBoard)) {
          setGameOver(true);
          setIsRunning(false);
          toast.success("Congratulations! You've solved the puzzle!");
        }
      } else {
        // Incorrect number
        setMistakes((prev) => {
          const newMistakes = prev + 1;
          if (newMistakes >= 3) {
            setGameOver(true);
            setIsRunning(false);
            toast.error("Game Over! You made too many mistakes.");
          }
          return newMistakes;
        });
      }
    }
  };
  
  const handleHint = () => {
    if (selectedCell && !gameOver && hintsUsed < 3) {
      const [row, col] = selectedCell;
      
      if (originalCells[row][col] || board.playBoard[row][col] !== 0) return;
      
      const newBoard = { ...board };
      newBoard.playBoard[row][col] = board.solutionBoard[row][col];
      setBoard(newBoard);
      setHintsUsed((prev) => prev + 1);
      
      // Check if the puzzle is solved
      if (isBoardComplete(newBoard.playBoard)) {
        setGameOver(true);
        setIsRunning(false);
        toast.success("Puzzle solved!");
      }
    } else if (hintsUsed >= 3) {
      toast.info("You've used all your hints!");
    }
  };
  
  const isBoardComplete = (playBoard: number[][]): boolean => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (playBoard[i][j] === 0) {
          return false;
        }
      }
    }
    return true;
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-funzone-purple mb-2">Sudoku</h1>
          <p className="text-gray-600">
            Fill in the grid with numbers 1-9 so that each row, column, and 3×3 box contains every digit.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Game Board</span>
                <div className="flex space-x-2">
                  <span className="text-sm font-normal bg-funzone-light-purple text-funzone-dark-purple px-3 py-1 rounded-full">
                    Time: {formatTime(timer)}
                  </span>
                  <span className="text-sm font-normal bg-red-100 text-red-600 px-3 py-1 rounded-full">
                    Mistakes: {mistakes}/3
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className="bg-white p-2 border border-gray-300 rounded-lg shadow-inner">
                  <div className="grid grid-cols-9 gap-1">
                    {Array(9).fill(0).map((_, rowIndex) => (
                      Array(9).fill(0).map((_, colIndex) => {
                        const isSelected = selectedCell && selectedCell[0] === rowIndex && selectedCell[1] === colIndex;
                        const isOriginal = originalCells[rowIndex]?.[colIndex];
                        const cellValue = board.playBoard[rowIndex]?.[colIndex] || 0;
                        
                        return (
                          <div 
                            key={`${rowIndex}-${colIndex}`} 
                            onClick={() => handleCellClick(rowIndex, colIndex)}
                            className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-sm sm:text-lg font-medium border 
                              ${isSelected ? 'bg-funzone-light-purple border-funzone-purple' : 'bg-white border-gray-300'} 
                              ${(rowIndex % 3 === 0 && rowIndex > 0) ? 'border-t-2 border-t-gray-500' : ''} 
                              ${(colIndex % 3 === 0 && colIndex > 0) ? 'border-l-2 border-l-gray-500' : ''} 
                              ${isOriginal ? 'text-gray-800 font-bold' : 'text-funzone-blue'} 
                              cursor-pointer transition-colors`}
                          >
                            {cellValue !== 0 ? cellValue : ''}
                          </div>
                        );
                      })
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Number input pad */}
              <div className="mt-6">
                <div className="flex justify-center">
                  <div className="grid grid-cols-9 gap-1 sm:gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <Button
                        key={num}
                        variant="outline"
                        className="w-8 h-8 sm:w-10 sm:h-10 text-sm sm:text-lg"
                        onClick={() => handleNumberInput(num)}
                        disabled={gameOver}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-3">
              <Button 
                onClick={startNewGame} 
                className="bg-funzone-purple hover:bg-funzone-dark-purple"
              >
                New Game
              </Button>
              <Button 
                onClick={handleHint} 
                variant="outline" 
                disabled={gameOver || hintsUsed >= 3}
              >
                Hint ({3 - hintsUsed})
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Game Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Difficulty</h3>
                <div className="flex flex-col space-y-2">
                  {['easy', 'medium', 'hard'].map((level) => (
                    <div key={level} className="flex items-center">
                      <input 
                        type="radio" 
                        id={level} 
                        name="difficulty" 
                        checked={difficulty === level} 
                        onChange={() => setDifficulty(level as 'easy' | 'medium' | 'hard')} 
                        className="mr-2" 
                      />
                      <label htmlFor={level} className="capitalize">{level}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={startNewGame} 
                className="w-full bg-funzone-purple hover:bg-funzone-dark-purple"
              >
                Start New Game
              </Button>
              
              <div className="mt-6 bg-gray-100 p-3 rounded-lg">
                <h3 className="font-medium mb-2">How to Play</h3>
                <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                  <li>Fill the grid so every row, column and 3×3 box contains digits 1-9</li>
                  <li>Click a cell, then select a number</li>
                  <li>You have 3 hints to use</li>
                  <li>Watch out for mistakes - you're limited to 3!</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Sudoku;
