function Snowflake(x, y, radius) {
    var options = {
      friction: 0.3,
      restitution: 0.6
    }
    this.body = Bodies.circle(x, y, radius, options);
    this.radius = radius
    World.add(world, this.body);
  
    this.show = function() {
      var pos = this.body.position;
      push();
      translate(pos.x, pos.y);
      strokeWeight(1);
      stroke(255);
      fill(180);
      ellipse(0, 0, radius * 2);
      pop();
    }
  
  }