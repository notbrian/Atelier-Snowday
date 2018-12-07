// Function to create new Snowflakes
function Snowflake(x, y, radius) {
  // Physics definition of a Snowflake
  const options = {
    friction: 0,
    restitution: 0,
    frictionAir: 0.05,
    density: 0.00000000001,
    frictionStatic: 0.3,
  };
  this.radius = radius;
  // Creates a circle physics entity and adds it to the world
  this.body = Bodies.circle(x, y, radius, options);
  World.add(world, this.body);

  // Function to draw the snowflake
  this.show = function show() {
    const pos = this.body.position;
    push();
    translate(pos.x, pos.y);
    noStroke();
    fill(255);
    ellipse(0, 0, radius * 2);
    pop();
  };

  // Function to remove the snowflake from Matter.js
  this.delete = function () {
    World.remove(world, this.body);
  };

  // Function to check if the snowflake is off screen
  this.isOffScreen = function () {
    const pos = this.body.position;
    return (pos.y > height + 100);
  };
}
