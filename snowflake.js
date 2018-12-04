function Snowflake(x, y, radius) {
    var options = {
      friction: 0,
      restitution: 0,
      frictionAir: 0.05,
      density: 0.00000000001,
      frictionStatic: 0.3
      // force: {x: random(-0.01, 0.01), y: random(-0.01, 0.01)}
    }
    this.body = Bodies.circle(x, y, radius, options);
    this.radius = radius
    World.add(world, this.body);
  
    this.show = function() {
      var pos = this.body.position;
      push();
      translate(pos.x, pos.y);
      noStroke();
      fill(255);
      ellipse(0, 0, radius * 2);
      pop();
    }

    this.delete = function() {
      World.remove(world, this.body);
    }

    this.isOffScreen = function() {
      var pos = this.body.position;
      return (pos.y > height + 100);
    }
  
  }