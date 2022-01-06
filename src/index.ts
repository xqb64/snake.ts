const PLAYGROUND_WIDTH: number = 25;
const PLAYGROUND_HEIGHT: number = 25;

const SCALE: number = 30;

class Vec2 {
  constructor(public x: number, public y: number) {}
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

  public snake: Snake;

  constructor() {
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    
    this.canvas.width = PLAYGROUND_WIDTH * SCALE;
    this.canvas.height = PLAYGROUND_HEIGHT * SCALE;

    this.snake = new Snake();
  }

  public drawSnake() {
    for (const piece of this.snake.body) {
      this.ctx.beginPath();
      this.ctx.fillStyle = 'black';
      this.ctx.rect(SCALE * piece.x, SCALE * piece.y, SCALE, SCALE)
      this.ctx.fill();
      this.ctx.closePath();
    }
  }

  public reDrawSnake() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawSnake();
  }
}

class Snake {
  private direction: Direction;
  public body: SnakeBody;

  constructor() {
    this.direction = Direction.Right;
    this.body = this.initializeBody();
  }

  private initializeBody() {
    const xOffset = PLAYGROUND_WIDTH / 2;
    const yOffset = PLAYGROUND_HEIGHT / 2;

    const body: SnakeBody = [];

    for (let i = -4; i < 3; i++) {
      body.push(new Vec2(xOffset + i, yOffset));
    }

    return body;
  }

  private getNextStep() {
    const nextStep = DIRECTIONS[this.direction]['coords'];
    const head = this.body[this.body.length - 1];
    return new Vec2(head.x + nextStep.x, head.y + nextStep.y);
  }

    public setDirection(direction: Direction) {
    this.direction = direction;
  }

  public crawl() {
    const nextStep = this.getNextStep();
    this.body.shift();
    this.body.push(nextStep);
  }
}

type SnakeBody = Vec2[];

async function main() {
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const game = new Game();

  game.drawSnake();

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
  });

  while (true) {
    game.snake.crawl();
    game.reDrawSnake();

    await delay(100);
  }
}

document.addEventListener('DOMContentLoaded', main);