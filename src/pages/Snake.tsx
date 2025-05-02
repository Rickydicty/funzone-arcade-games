
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdSpace from '../components/AdSpace';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

type Direction = 'UP' | 'RIGHT' | 'DOWN' | 'LEFT';
interface Position {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 100;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];

const Snake: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(150);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const directionRef = useRef(direction);
  const gameLoopRef = useRef<number | null>(null);

  // Update direction ref when direction changes
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  // Initialize high score from local storage
  useEffect(() => {
    const storedHighScore = localStorage.getItem('snakeHighScore');
    if (storedHighScore) {
      setHighScore(parseInt(storedHighScore));
    }
  }, []);

  // Place food in random position that's not on the snake
  const placeFood = useCallback(() => {
    const newFood: Position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };

    // Check if food is on snake
    const isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    
    if (isOnSnake) {
      return placeFood();
    }
    
    setFood(newFood);
  }, [snake]);

  // Start a new game
  const startNewGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection('RIGHT');
    setIsGameOver(false);
    setIsPaused(false);
    setScore(0);
    placeFood();
    
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    
    lastUpdateTimeRef.current = 0;
    gameLoop();
  };

  // Handle keyboard events for controlling the snake
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent the default action for arrow keys to avoid page scrolling
      if (['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', ' '].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowRight':
          if (directionRef.current !== 'LEFT') setDirection('RIGHT');
          break;
        case 'ArrowDown':
          if (directionRef.current !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (directionRef.current !== 'RIGHT') setDirection('LEFT');
          break;
        case ' ':  // Space bar
          togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Toggle pause state
  const togglePause = () => {
    if (isGameOver) return;
    
    setIsPaused(prev => !prev);
    if (isPaused) {
      lastUpdateTimeRef.current = 0;
      gameLoop();
    } else if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  };

  // Draw game on canvas
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);
    
    // Draw grid lines
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }
    
    // Draw food
    ctx.fillStyle = '#f97316'; // Orange color for food
    ctx.fillRect(
      food.x * CELL_SIZE,
      food.y * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE
    );
    
    // Draw snake
    snake.forEach((segment, index) => {
      // Head is a different color
      if (index === 0) {
        ctx.fillStyle = '#7E69AB'; // Dark purple for head
      } else {
        ctx.fillStyle = '#9b87f5'; // Purple for body
      }
      
      ctx.fillRect(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    });
  }, [snake, food]);

  // Update game state
  const updateGame = useCallback(() => {
    if (isPaused || isGameOver) return;
    
    const head = { ...snake[0] };
    
    // Move head based on direction
    switch (directionRef.current) {
      case 'UP':
        head.y -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
    }
    
    // Check for collision with walls
    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    ) {
      handleGameOver();
      return;
    }
    
    // Check for collision with self
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      handleGameOver();
      return;
    }
    
    const newSnake = [head, ...snake];
    
    // Check if snake ate food
    if (head.x === food.x && head.y === food.y) {
      setScore(prev => prev + 10);
      placeFood();
    } else {
      // Remove tail if didn't eat
      newSnake.pop();
    }
    
    setSnake(newSnake);
  }, [snake, food, isPaused, isGameOver, placeFood]);

  // Handle game over
  const handleGameOver = () => {
    setIsGameOver(true);
    setIsPaused(true);
    
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snakeHighScore', score.toString());
      toast("New high score!", {
        description: `You scored ${score} points!`,
      });
    } else {
      toast("Game over!", {
        description: `You scored ${score} points!`,
      });
    }
    
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  };

  // Game loop with timing control
  const lastUpdateTimeRef = useRef(0);
  const gameLoop = useCallback(() => {
    const currentTime = performance.now();
    
    if (currentTime - lastUpdateTimeRef.current >= speed) {
      updateGame();
      lastUpdateTimeRef.current = currentTime;
    }
    
    drawGame();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [updateGame, drawGame, speed]);

  // Start game loop when component mounts
  useEffect(() => {
    placeFood();
    drawGame();
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

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
              <CardTitle className="text-2xl font-bold text-center">Snake Game</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="mb-4 flex justify-between w-full max-w-md">
                <div className="text-lg">
                  <span className="font-bold">Score:</span> {score}
                </div>
                <div className="text-lg">
                  <span className="font-bold">High Score:</span> {highScore}
                </div>
              </div>
              
              <div className="border border-gray-300 mb-6">
                <canvas 
                  ref={canvasRef} 
                  width={GRID_SIZE * CELL_SIZE} 
                  height={GRID_SIZE * CELL_SIZE}
                  className="bg-white"
                />
              </div>
              
              <div className="flex gap-4 mb-6">
                {isGameOver ? (
                  <Button 
                    onClick={startNewGame} 
                    variant="default" 
                    className="bg-funzone-purple hover:bg-funzone-dark-purple"
                  >
                    New Game
                  </Button>
                ) : (
                  <Button 
                    onClick={togglePause} 
                    variant="default" 
                    className="bg-funzone-purple hover:bg-funzone-dark-purple"
                  >
                    {isPaused ? "Start" : "Pause"}
                  </Button>
                )}
                
                <Button 
                  onClick={startNewGame} 
                  variant="outline"
                >
                  Reset
                </Button>
              </div>
              
              <div className="w-full max-w-md">
                <p className="mb-2">Speed: {Math.round(1000 / speed)} fps</p>
                <Slider 
                  min={50} 
                  max={300} 
                  step={10} 
                  value={[speed]} 
                  onValueChange={(value) => setSpeed(value[0])}
                  className="mb-6"
                />
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
                  <li>Use the arrow keys to control the snake</li>
                  <li>Eat the orange food to grow and gain points</li>
                  <li>Avoid hitting the walls or yourself</li>
                  <li>Press the space bar to pause/resume the game</li>
                  <li>Adjust the speed with the slider</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  <div></div>
                  <div className="bg-gray-100 p-2 rounded">↑</div>
                  <div></div>
                  <div className="bg-gray-100 p-2 rounded">←</div>
                  <div className="bg-gray-100 p-2 rounded">↓</div>
                  <div className="bg-gray-100 p-2 rounded">→</div>
                </div>
                <p className="text-center text-sm text-gray-500">Space bar - Pause/Resume</p>
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

export default Snake;
