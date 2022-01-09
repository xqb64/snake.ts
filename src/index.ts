import * as _ from 'lodash';

const PLAYGROUND_WIDTH: number = 25;
const PLAYGROUND_HEIGHT: number = 25;

const SCALE: number = 20;

class Vec2 {
  constructor(public x: number, public y: number) {}

  public isEqual(vector: Vec2): boolean {
    return this.x === vector.x && this.y === vector.y;
  }
}

enum Direction {
  Up,
  Down,
  Left,
  Right,
}

const DIRECTIONS = {
  0: {
    'coords': new Vec2(0, -1),
    'forbidden': Direction.Down,
  },
  1: {
    'coords': new Vec2(0, 1),
    'forbidden': Direction.Up,
  },
  2: {
    'coords': new Vec2(-1, 0),
    'forbidden': Direction.Right,
  },
  3: {
    'coords': new Vec2(1, 0),
    'forbidden': Direction.Left,
  }
}

class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private score: number = 0;

  public snake: Snake;
  public food: Food;
  public gameOver: boolean;


  constructor() {
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    
    this.canvas.width = PLAYGROUND_WIDTH * SCALE;
    this.canvas.height = PLAYGROUND_HEIGHT * SCALE;
    this.canvas.style.background = '#7c9d05';

    this.outlineCanvas(this.canvas);

    this.snake = new Snake(this);
    this.food = new Food(this.snake.body);
    this.gameOver = false;

    this.drawSnake();
    this.drawFood();
  }

  private outlineCanvas(canvas: HTMLCanvasElement) {
    canvas.style.border = '5px solid black';
  }

  public updateScore() {
    this.score += 10;
    document.getElementById('score')!.innerText = `SCORE: ${this.score}`;
  }

  public drawSnake() {
    for (const piece of this.snake.body) {
      this.drawSquare(piece);
    }
  }

  public drawFood() {
    this.drawSquare(this.food);
  }

  private drawSquare(coord: Vec2) {
    this.ctx.beginPath();
    this.ctx.fillStyle = '#1f2c13';
    this.ctx.strokeStyle = '#7c9d05';
    this.ctx.rect(SCALE * coord.x, SCALE * coord.y, SCALE, SCALE);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.closePath();
  }

  public reDraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawSnake();
    this.drawFood();
  }

  public showGameOverScreen() {
    const text = 'GAME OVER!';
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillText(
      'GAME OVER!',
      SCALE * (PLAYGROUND_WIDTH / 2) - SCALE * 2,
      SCALE * (PLAYGROUND_HEIGHT / 2),
      3 * SCALE,
    );
  }
}

class Snake {
  private game: Game;

  public direction: Direction;
  public body: SnakeBody;

  constructor(game: Game) {
    this.game = game;
    this.direction = Direction.Right;
    this.body = this.initializeBody();
  }

  private initializeBody(): SnakeBody {
    const xOffset = Math.floor(PLAYGROUND_WIDTH / 2);
    const yOffset = Math.floor(PLAYGROUND_HEIGHT / 2);

    const body: SnakeBody = [];

    for (let i = -4; i < 3; i++) {
      body.push(new Vec2(xOffset + i, yOffset));
    }

    return body;
  }

  private getNextStep(): Vec2 {
    const nextStep = DIRECTIONS[this.direction]['coords'];
    const head = this.body[this.body.length - 1];
    return new Vec2(
      modulo((head.x + nextStep.x), PLAYGROUND_WIDTH),
      modulo((head.y + nextStep.y), PLAYGROUND_HEIGHT),
    );
  }

  public setDirection(direction: Direction) {
    if (direction !== DIRECTIONS[this.direction]['forbidden']) {
      this.direction = direction;
    }
  }

  public crawl() {
    const nextStep = this.getNextStep();

    if (this.isAboutToCollide(nextStep)) {
      this.game.gameOver = true;
      return;
    }

    this.body.push(nextStep);

    if (this.game.food.isEqual(this.body.at(-1)!)) {
      this.game.updateScore();
      this.game.food = new Food(this.body);
    } else {
      this.body.shift();
    }
  }

  private isAboutToCollide(nextStep: Vec2): boolean {
    for (const piece of this.body) {
      if (piece.isEqual(nextStep)) {
        return true;
      }
    }
    return false;
  }
}

type SnakeBody = Vec2[];

class Food extends Vec2 {
  private snakeBody: SnakeBody;

  constructor(snakeBody: SnakeBody) {
    const x = _.random(1, PLAYGROUND_WIDTH - 1);
    const y = _.random(1, PLAYGROUND_HEIGHT - 1)
    
    super(x, y);

    this.snakeBody = snakeBody;
    
    while (this.overlapsSnake()) {
      this.x = _.random(1, PLAYGROUND_WIDTH - 1);
      this.y = _.random(1, PLAYGROUND_HEIGHT - 1);
    }
  }

  public overlapsSnake() {
    return this.snakeBody.includes(new Vec2(this.x, this.y));
  }
}

async function main() {
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const game = new Game();

  document.addEventListener('keydown', event => {
    switch (event.code) {
    case 'ArrowUp':
      game.snake.setDirection(Direction.Up);
      break;
    case 'ArrowDown':
      game.snake.setDirection(Direction.Down);
      break;
    case 'ArrowLeft':
      game.snake.setDirection(Direction.Left);
      break;
    case 'ArrowRight':
      game.snake.setDirection(Direction.Right);
      break;
    }
    game.snake.crawl();
    game.reDraw();
  });

  while (!game.gameOver) {
    game.snake.crawl();
    game.reDraw();

    await delay(150);
  }

  game.showGameOverScreen();
  
  await delay(2500);

  await main();
}

function modulo(a: number, b: number): number {
  return ((a % b) + b) % b;
}

document.addEventListener('DOMContentLoaded', main);