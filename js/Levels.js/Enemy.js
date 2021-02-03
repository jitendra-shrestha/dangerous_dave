class Enemy extends Entity {
  constructor(game, x, y) {
    super(game, x, y);
    this.width = Tile.size;
    this.height = Tile.size;
    this.dead = false;
    this.direction = 1;
    this.sprite = "spider";
    this.vel = 1;
    this.orgX = this.x;
    this.orgY = this.y;
    this.destX = this.x + 1.5 * Tile.size;
    this.destY = this.y + Tile.size;
  }

  move() {
    if (this.x <= this.destX && this.y === this.orgY) {
      this.x += this.vel;
    }

    if (this.y <= this.destY && this.x === this.destX) {
      this.y += this.vel;
    }

    if (this.x >= this.orgX && this.y === this.destY) {
      this.x -= this.vel;
    }

    if (this.y >= this.orgY && this.x === this.orgX) {
      this.y -= this.vel;
    }
  }

  update() {
    this.move();
    this.direction = this.game.level.player.x < this.x ? -1 : 1;
    if (this.onScreen()) this.game.audio.play("enemyGunshot");
    this.shoot(3);
  }

  draw() {
    this.game.canvas.drawSprite(this.x, this.y, this.sprite);
  }

  kill() {
    this.dead = true;
    this.game.audio.play("enemyExplosion");
  }
}
