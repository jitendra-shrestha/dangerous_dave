class Player extends Entity {
  /**
   *
   * @param {object} game - object of game
   * @param {object} position - x and y of the player
   */
  constructor(game, position) {
    super(game, position.x * Tile.size, position.y * Tile.size);
    this.width = Tile.size - 4;
    this.height = Tile.size;
    this.direction = 1;
    this.blink = 1;
    this.velY = 0;
    this.isJumping = false;
    this.t = 0;
    this.dead = false;
    this.hasTrophy = false;
    this.hasGun = false;
    this.hasJetpack = false;
    this.jetpackFuel = 100;
    this.isUsingJetpack = false;
  }
  /**
   * updates player positions
   */

  update() {
    const { keys } = this.game.input;
    const vel = 2.5;

    if (this.isUsingJetpack) {
      if (keys.up.hold) {
        this.y -= vel;
        this.adjustJump();
      }
      if (keys.down.hold) {
        this.y += vel;
        this.adjustFall();
      }
      this.game.audio.play("jetpack");
      this.jetpackFuel -= 0.1;
    } else {
      if (keys.up.hold) {
        if (!this.isJumping && this.canJump()) {
          this.t = 5;
          this.isJumping = true;
          this.velY = vel;
          this.jumpGoal = this.y - 2 * Tile.size;
          this.game.audio.play("jump");
        }
      }

      if (!this.isJumping && !this.canJump()) {
        this.y += this.velY;
        this.velY += 0.05;
        this.blink = 0;

        if (this.velY >= vel) {
          this.velY = vel;
          this.blink = 1;
        }

        this.adjustFall();
      }

      if (this.isJumping) {
        this.y -= this.velY;
        this.velY -= 0.01;
        this.blink = 0;

        if (this.y <= this.jumpGoal) {
          this.y = this.jumpGoal;
          this.isJumping = false;
          this.velY = 0;
          this.blink = 1;
        }
        this.adjustJump();
      }
    }

    if (keys.right.hold) {
      this.x += vel;
      this.direction = 1;
      this.blink = 0;
      this.adjustWalk("right");
    }

    if (keys.left.hold) {
      this.x -= vel;
      this.direction = -1;
      this.blink = 0;
      this.adjustWalk("left");
    }

    if ((keys.left.hold || keys.right.hold) && this.canJump()) {
      this.game.audio.play("walk");
    }

    if (keys.z.pulse && this.hasGun) {
      this.game.audio.play("playerGunshot");
      this.shoot(5);
    }

    if (keys.x.pulse && this.hasJetpack) {
      this.isUsingJetpack = !this.isUsingJetpack;

      if (this.isUsingJetpack) {
        this.isJumping = false;
      }
    }

    if (this.jetpackFuel < 0) {
      this.hasJetpack = false;
      this.isUsingJetpack = false;
      this.jetpackFuel = 100;
    }

    this.touchTiles();
  }

  /**
   * checks player can jump or not
   */
  canJump() {
    this.y++;
    const ret = this.clipped("down");
    this.y--;
    return ret;
  }

  /**
   *
   * @param {number} direction - 1 if right or -1 if left
   */
  adjustWalk(direction) {
    if (this.clipped(direction)) {
      if (direction === "left") {
        this.x += this.width - 1;
      }
      this.x = Tile.size * Math.floor(this.x / Tile.size);
      if (direction === "right") {
        return (this.x += Tile.size - this.width);
      }
    } else {
      if (this.canJump()) {
        this.t++;
      }
    }
  }

  adjustJump() {
    if (this.clipped("up")) {
      this.y += Tile.size;
      this.y = Tile.size * Math.floor(this.y / Tile.size);
      this.isJumping = false;
      this.velY = 0;
    }
  }

  /**
   * player in tile after jump
   */
  adjustFall() {
    if (this.clipped("down")) {
      this.y = Tile.size * Math.floor(this.y / Tile.size);
    }
  }

  /**
   * Draws player
   */
  draw() {
    if (this.blink === 1) {
      let sprite = "player";
      this.game.canvas.drawSprite(this.x, this.y, sprite);
    } else {
      let sprite = "player";
      sprite += Math.floor(this.t / 5) % 2;
      sprite += this.direction === 1 ? "r" : "l";

      this.game.canvas.drawSprite(this.x, this.y, sprite);
    }

    if (this.isUsingJetpack) {
      let sprite = "playerj";
      sprite += this.direction === 1 ? "r" : "l";
      this.game.canvas.drawSprite(this.x, this.y, sprite);
    }
  }

  /**
   * check touch tiles by player
   */
  touchTiles() {
    const tiles = this.getTouchedTiles();
    for (let tile of tiles) {
      if (tile.tile === "T") {
        this.game.audio.play("trophy");
        this.hasTrophy = true;
      }

      if (tile.tile === "=") {
        if (this.hasTrophy) {
          this.hasTrophy = false;
          this.hasGun = false;
          this.hasJetpack = false;
          this.isUsingJetpack = false;
          this.game.input.clear();
          this.game.level.isLevelingUp = true;
          this.game.audio.play("door");
          this.x = Tile.size;
          this.y = 4 * Tile.size;
        }
      }

      if (tile.tile === "Z") {
        this.hasGun = true;
      }

      if (tile.tile === "J") {
        this.hasJetpack = true;
        this.hasGun = false;
      }

      if (Tile.isLethal(tile.tile)) {
        this.game.audio.play("playerExplosion");
        this.kill();
      }

      if (Tile.isPickable(tile.tile)) {
        this.game.audio.play("pickup");
        this.game.score.value += Tile.scoreValue(tile.tile);
        this.game.level.clearTile(tile.x, tile.y);
      }
    }
  }

  /**
   * decreases lives of player and restart
   */
  kill() {
    if (!this.dead) {
      this.dead = true;
      this.game.lives--;
      this.game.restart = true;
    }
  }
}
