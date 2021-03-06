class Bullet extends Entity {
  constructor(game, owner, x, y, direction, vel) {
    super(game, x, y);
    this.owner = owner;
    this.direction = direction;
    this.width = 14;
    this.height = 6;
    this.x = Math.round(x - this.width / 2);
    this.y = Math.round(y - this.height / 2);
    this.vel = vel;
    this.sprite = "bullet";
    if (this.direction === -1) {
      this.x -= this.width;
    }
    this.dead = false;
  }

  /**
   * updates bullet position
   */
  update() {
    this.x += this.direction * this.vel;

    if (
      this.clipped(this.direction === 1 ? "right" : "left") ||
      !this.onScreen()
    ) {
      this.die();
    }

    for (let i = 0; i < this.game.level.entities.length; ++i) {
      let entity = this.game.level.entities[i];
      if (entity == this || entity == this.owner) continue;
      if (this.hasCollided(entity)) {
        if (entity.kill()) {
          this.die();
        }
      }
    }
  }

  /**
   * draws bullet in screen
   */
  draw() {
    this.game.canvas.drawSprite(this.x, this.y, this.sprite);
  }

  /**
   * die when out of screen
   */
  die() {
    this.dead = true;
    this.owner.bullet = null;
  }
}
