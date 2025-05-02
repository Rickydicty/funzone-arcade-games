
import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from '../components/Header';
import Footer from '../components/Footer';

const Game2048: React.FC = () => {
  const [board, setBoard] = useState<number[][]>([]);
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);

  // Initialize game board
  useEffect(() => {
    initializeGame();
    // Add keyboard event listeners
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Load best score from localStorage
  useEffect(() => {
    const storedBestScore = localStorage.getItem('2048-best-score');
    if (storedBestScore) {
      setBestScore(parseInt(storedBestScore));
    }
  }, []);

  // Update best score
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('2048-best-score', score.toString());
    }
  }, [score]);

  const initializeGame = () => {
    const newBoard = Array(4).fill(0).map(() => Array(4).fill(0));
    
    // Add two random tiles to start
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
  };

  const addRandomTile = (currentBoard: number[][]) => {
    const emptyCells: [number, number][] = [];
    
    // Find all empty cells
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (currentBoard[i][j] === 0) {
          emptyCells.push([i, j]);
        }
      }
    }
    
    if (emptyCells.length > 0) {
      // Choose a random empty cell
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      // Place a 2 (90% chance) or 4 (10% chance)
      currentBoard[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (gameOver || gameWon) return;
    
    let moved = false;
    let newBoard = JSON.parse(JSON.stringify(board));
    let newScore = score;
    
    switch (e.key) {
      case 'ArrowUp':
        [newBoard, newScore, moved] = moveUp(newBoard, newScore);
        break;
      case 'ArrowDown':
        [newBoard, newScore, moved] = moveDown(newBoard, newScore);
        break;
      case 'ArrowLeft':
        [newBoard, newScore, moved] = moveLeft(newBoard, newScore);
        break;
      case 'ArrowRight':
        [newBoard, newScore, moved] = moveRight(newBoard, newScore);
        break;
      default:
        return;
    }
    
    if (moved) {
      addRandomTile(newBoard);
      setBoard(newBoard);
      setScore(newScore);

      // Check if player has won
      if (hasWon(newBoard)) {
        setGameWon(true);
        toast.success("Congratulations! You reached 2048!");
      }
      // Check if game is over
      else if (isGameOver(newBoard)) {
        setGameOver(true);
        toast.error("Game over! No more moves available.");
      }
    }
  };

  const moveUp = (currentBoard: number[][], currentScore: number): [number[][], number, boolean] => {
    let moved = false;
    let newScore = currentScore;
    
    for (let col = 0; col < 4; col++) {
      let lastMergeRow = -1; // Track last merged row to prevent double merges
      
      for (let row = 1; row < 4; row++) {
        if (currentBoard[row][col] !== 0) {
          let targetRow = row;
          
          // Move up as far as possible
          while (targetRow > 0 && currentBoard[targetRow - 1][col] === 0) {
            targetRow--;
          }
          
          // Check if we can merge with the cell above
          if (targetRow > 0 && 
              currentBoard[targetRow - 1][col] === currentBoard[row][col] && 
              lastMergeRow !== targetRow - 1) {
            // Merge with cell above
            currentBoard[targetRow - 1][col] *= 2;
            currentBoard[row][col] = 0;
            newScore += currentBoard[targetRow - 1][col];
            lastMergeRow = targetRow - 1; // Mark this row as merged
            moved = true;
          } else if (targetRow !== row) {
            // Move to empty space
            currentBoard[targetRow][col] = currentBoard[row][col];
            currentBoard[row][col] = 0;
            moved = true;
          }
        }
      }
    }
    
    return [currentBoard, newScore, moved];
  };

  const moveDown = (currentBoard: number[][], currentScore: number): [number[][], number, boolean] => {
    let moved = false;
    let newScore = currentScore;
    
    for (let col = 0; col < 4; col++) {
      let lastMergeRow = 4; // Track last merged row to prevent double merges
      
      for (let row = 2; row >= 0; row--) {
        if (currentBoard[row][col] !== 0) {
          let targetRow = row;
          
          // Move down as far as possible
          while (targetRow < 3 && currentBoard[targetRow + 1][col] === 0) {
            targetRow++;
          }
          
          // Check if we can merge with the cell below
          if (targetRow < 3 && 
              currentBoard[targetRow + 1][col] === currentBoard[row][col] && 
              lastMergeRow !== targetRow + 1) {
            // Merge with cell below
            currentBoard[targetRow + 1][col] *= 2;
            currentBoard[row][col] = 0;
            newScore += currentBoard[targetRow + 1][col];
            lastMergeRow = targetRow + 1; // Mark this row as merged
            moved = true;
          } else if (targetRow !== row) {
            // Move to empty space
            currentBoard[targetRow][col] = currentBoard[row][col];
            currentBoard[row][col] = 0;
            moved = true;
          }
        }
      }
    }
    
    return [currentBoard, newScore, moved];
  };

  const moveLeft = (currentBoard: number[][], currentScore: number): [number[][], number, boolean] => {
    let moved = false;
    let newScore = currentScore;
    
    for (let row = 0; row < 4; row++) {
      let lastMergeCol = -1; // Track last merged column to prevent double merges
      
      for (let col = 1; col < 4; col++) {
        if (currentBoard[row][col] !== 0) {
          let targetCol = col;
          
          // Move left as far as possible
          while (targetCol > 0 && currentBoard[row][targetCol - 1] === 0) {
            targetCol--;
          }
          
          // Check if we can merge with the cell to the left
          if (targetCol > 0 && 
              currentBoard[row][targetCol - 1] === currentBoard[row][col] && 
              lastMergeCol !== targetCol - 1) {
            // Merge with cell to the left
            currentBoard[row][targetCol - 1] *= 2;
            currentBoard[row][col] = 0;
            newScore += currentBoard[row][targetCol - 1];
            lastMergeCol = targetCol - 1; // Mark this column as merged
            moved = true;
          } else if (targetCol !== col) {
            // Move to empty space
            currentBoard[row][targetCol] = currentBoard[row][col];
            currentBoard[row][col] = 0;
            moved = true;
          }
        }
      }
    }
    
    return [currentBoard, newScore, moved];
  };

  const moveRight = (currentBoard: number[][], currentScore: number): [number[][], number, boolean] => {
    let moved = false;
    let newScore = currentScore;
    
    for (let row = 0; row < 4; row++) {
      let lastMergeCol = 4; // Track last merged column to prevent double merges
      
      for (let col = 2; col >= 0; col--) {
        if (currentBoard[row][col] !== 0) {
          let targetCol = col;
          
          // Move right as far as possible
          while (targetCol < 3 && currentBoard[row][targetCol + 1] === 0) {
            targetCol++;
          }
          
          // Check if we can merge with the cell to the right
          if (targetCol < 3 && 
              currentBoard[row][targetCol + 1] === currentBoard[row][col] && 
              lastMergeCol !== targetCol + 1) {
            // Merge with cell to the right
            currentBoard[row][targetCol + 1] *= 2;
            currentBoard[row][col] = 0;
            newScore += currentBoard[row][targetCol + 1];
            lastMergeCol = targetCol + 1; // Mark this column as merged
            moved = true;
          } else if (targetCol !== col) {
            // Move to empty space
            currentBoard[row][targetCol] = currentBoard[row][col];
            currentBoard[row][col] = 0;
            moved = true;
          }
        }
      }
    }
    
    return [currentBoard, newScore, moved];
  };

  const handleSwipe = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver || gameWon) return;
    
    let moved = false;
    let newBoard = JSON.parse(JSON.stringify(board));
    let newScore = score;
    
    switch (direction) {
      case 'up':
        [newBoard, newScore, moved] = moveUp(newBoard, newScore);
        break;
      case 'down':
        [newBoard, newScore, moved] = moveDown(newBoard, newScore);
        break;
      case 'left':
        [newBoard, newScore, moved] = moveLeft(newBoard, newScore);
        break;
      case 'right':
        [newBoard, newScore, moved] = moveRight(newBoard, newScore);
        break;
    }
    
    if (moved) {
      addRandomTile(newBoard);
      setBoard(newBoard);
      setScore(newScore);

      if (hasWon(newBoard)) {
        setGameWon(true);
        toast.success("Congratulations! You reached 2048!");
      }
      else if (isGameOver(newBoard)) {
        setGameOver(true);
        toast.error("Game over! No more moves available.");
      }
    }
  };

  const hasWon = (currentBoard: number[][]): boolean => {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (currentBoard[row][col] === 2048) {
          return true;
        }
      }
    }
    return false;
  };

  const isGameOver = (currentBoard: number[][]): boolean => {
    // Check if there are any empty cells
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (currentBoard[row][col] === 0) {
          return false;
        }
      }
    }
    
    // Check if any adjacent cells have the same value
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const value = currentBoard[row][col];
        
        // Check right
        if (col < 3 && currentBoard[row][col + 1] === value) {
          return false;
        }
        
        // Check down
        if (row < 3 && currentBoard[row + 1][col] === value) {
          return false;
        }
      }
    }
    
    return true;
  };

  const getTileColorClass = (value: number): string => {
    switch (value) {
      case 2: return 'bg-[#eee4da] text-gray-700';
      case 4: return 'bg-[#ede0c8] text-gray-700';
      case 8: return 'bg-[#f2b179] text-white';
      case 16: return 'bg-[#f59563] text-white';
      case 32: return 'bg-[#f67c5f] text-white';
      case 64: return 'bg-[#f65e3b] text-white';
      case 128: return 'bg-[#edcf72] text-white';
      case 256: return 'bg-[#edcc61] text-white';
      case 512: return 'bg-[#edc850] text-white';
      case 1024: return 'bg-[#edc53f] text-white';
      case 2048: return 'bg-[#edc22e] text-white';
      default: return 'bg-gray-200 text-transparent';
    }
  };

  const getTileFontSize = (value: number): string => {
    if (value < 100) return 'text-3xl';
    if (value < 1000) return 'text-2xl';
    return 'text-xl';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-funzone-purple mb-2">2048</h1>
          <p className="text-gray-600">
            Join the numbers and get to the 2048 tile!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Game Board</span>
                  <div className="flex gap-2">
                    <span className="text-sm font-normal bg-funzone-light-purple text-funzone-dark-purple px-3 py-1 rounded-full">
                      Score: {score}
                    </span>
                    <span className="text-sm font-normal bg-gray-200 text-gray-700 px-3 py-1 rounded-full">
                      Best: {bestScore}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="bg-[#bbada0] p-3 rounded-lg">
                    {/* Game Board */}
                    <div className="grid grid-cols-4 gap-3">
                      {board.map((row, rowIndex) => 
                        row.map((cell, colIndex) => (
                          <div 
                            key={`${rowIndex}-${colIndex}`}
                            className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center rounded-md shadow-inner 
                              ${getTileColorClass(cell)} ${getTileFontSize(cell)} font-bold transition-all duration-200`}
                          >
                            {cell !== 0 ? cell : ''}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Game Status Message */}
                  {gameWon && (
                    <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md font-medium">
                      Congratulations! You reached 2048!
                    </div>
                  )}
                  {gameOver && (
                    <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md font-medium">
                      Game over! No more moves available.
                    </div>
                  )}

                  {/* Game Controls */}
                  <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                    <Button 
                      onClick={initializeGame} 
                      className="bg-funzone-purple hover:bg-funzone-dark-purple"
                    >
                      New Game
                    </Button>

                    {/* Mobile Swipe Controls */}
                    <div className="grid grid-cols-3 gap-1 sm:gap-2">
                      <div></div>
                      <Button 
                        onClick={() => handleSwipe('up')} 
                        variant="outline"
                        className="text-funzone-dark-purple"
                      >
                        ↑
                      </Button>
                      <div></div>
                      
                      <Button 
                        onClick={() => handleSwipe('left')} 
                        variant="outline"
                        className="text-funzone-dark-purple"
                      >
                        ←
                      </Button>
                      <div></div>
                      <Button 
                        onClick={() => handleSwipe('right')} 
                        variant="outline"
                        className="text-funzone-dark-purple"
                      >
                        →
                      </Button>
                      
                      <div></div>
                      <Button 
                        onClick={() => handleSwipe('down')} 
                        variant="outline"
                        className="text-funzone-dark-purple"
                      >
                        ↓
                      </Button>
                      <div></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>How to Play</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-gray-600">
                <p>
                  Use your <span className="font-medium">arrow keys</span> or the direction buttons to move all tiles.
                </p>
                <p>
                  Tiles with the same number <span className="font-medium">merge into one</span> when they touch.
                </p>
                <p>
                  Add them up to reach <span className="font-medium">2048!</span>
                </p>
                <div className="pt-3">
                  <h3 className="text-lg font-semibold text-funzone-dark-purple mb-2">Tips</h3>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Keep your largest tiles in a corner</li>
                    <li>Work in a specific direction</li>
                    <li>Don't rush - plan your moves</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default Game2048;
