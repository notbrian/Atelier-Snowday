// Soup of Stars - Final Experiment
// Brian Nguyen, Michael Shefer, Andrew Ng-Lun, Rosh Leynes
// Body tracking based from: https://ml5js.org/docs/posenet-webcam
// Thanks to Daniel Shiffman, Matter.js and Ml5js.

// PoseNet Variables
let video;
let poseNet;
let poses = [];

// Matter.js
// Module aliases
const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;

// Create a Matter.js engine with a world
const engine = Engine.create();
const world = engine.world;

// Array to contain snowflake objects
const snowflakes = [];
// Variable to contain ground entity
let ground;

// Array that stores block entities to represent hands
const hands = [];

// P5 Variables
// Image variable stores img of skeleton Santa
let img;

// Video dimensions
let vWidth;
let vHeight;

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);

  // Resolution downscaling code
  // Used when developing on weaker hardware
  //  vWidth = windowWidth * 0.4;
  //  vHeight = windowHeight * 0.4;
  //  vWidth = 300 * (windowWidth/windowHeight);
  //  vHeight = 300  * (windowWidth/windowHeight);

  // Sets the width and height of the source webcam video
  vWidth = 640;
  vHeight = 480;
  video.size(vWidth, vHeight);

  // Loads skull.png into img variable
  img = loadImage('images/skull.png');

  // Configuration options for PoseNet
  const poseOptions = {
    // Flips video horizontally, mirrors movement
    flipHorizontal: true,
    // Sets max number of poses to detect, doesn't work however
    maxPoseDetections: 2,

  };

  // Initalizes PoseNet, feeding in the video stream, and options
  poseNet = ml5.poseNet(video, poseOptions);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected

  // On pose event, export the results to the poses variable
  poseNet.on('pose', (results) => {
    poses = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();

  // Sets the ground to be a static physics object
  const groundOptions = {
    isStatic: true,
  };
    // Creates a rectangle shaped entity for the ground
  ground = Bodies.rectangle(width / 2, height, width + 10, 100, groundOptions);

  // Add the ground to the Matter.js world
  World.add(world, ground);

  // For loop that creates 4 physical block entities to be used to interact with the snow
  // Adds them to the structed hands array
  // Hands --> Pair per pose --> Two hands
  for (let i = 0; i < 2; i += 1) {
    // Options object for hands
    const options = {
      // Friction set to 0
      friction: 0,
      // Bounce set to 0
      restitution: 0,
    };

    // Pair array to push to hands array
    const pair = [];

    // For loop that creates two hands
    for (let j = 0; j < 2; j += 1) {
      // Pushes a hand to the pair array
      pair.push(Bodies.rectangle(width / 2, 0, 20, 80, options));
      // Adds the hand to the world
      World.add(world, pair[j]);
    }
    // Pushes the pair to the hands array
    hands.push(pair);
  }

  // Interval to spawn snowflakes every 500ms
  setInterval(() => {
    // Limits the amount of Snowflakes on screen
    if (snowflakes.length > 300) {
      return;
    }
    // For loop to generate ranomdized snowflakes
    for (let i = 0; i < random(10); i += 1) {
      const x = random(1, width);
      const y = random(-300);
      const radius = random(5, 20);
      snowflakes.push(new Snowflake(x, y, radius));
    }
  }, 500);
}


function draw() {
  background('#006400');
  // Triggers the physics engine to timestep
  Engine.update(engine);
  // Cycles through the snowflakes array and updates their state
  for (let i = 0; i < snowflakes.length; i += 1) {
    snowflakes[i].show();
    // Removes snowflakes that have fallen offscreen
    if (snowflakes[i].isOffScreen()) {
      snowflakes[i].delete();
      // Shifts the array to prevent gaps
      snowflakes.splice(i, 1);
      // Moves the index back by 1 to correctly cycle through
      i -= 1;
    }
  }

  // Draws the ground object to the canvas
  noStroke(255);
  fill(0);
  rectMode(CENTER);
  rect(ground.position.x, ground.position.y, width, 100);

  // Draws each hand entity
  // (I know its bad practice to do it this way but it works)
  for (const pair in hands) {
    for (hand in hands[pair]) {
      fill(170);
      push();
      translate(hands[pair][hand].position.x, hands[pair][hand].position.y);
      rectMode(CENTER);
      rotate(hands[pair][hand].angle);
      rect(0, 0, 80, 80);
      pop();
    }
  }

  push();
  // Draws the webcam in the bottom right corner
  image(video, width - vWidth * 0.1, height - vHeight * 0.1, vWidth * 0.1, vHeight * 0.1);

  // Draws keypoints from PoseNet
  drawKeypoints();
  // Draws skeleton from PoseNet
  drawSkeleton();

  pop();
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i += 1) {
    // For each pose detected, loop through all the keypoints
    for (let j = 0; j < poses[i].pose.keypoints.length; j += 1) {
      const keypoint = poses[i].pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        // Ignore body parts we dont care about
        if (j > 0 && j < 5) {
          continue;
        }
        // Keypoint positions translated to fit entire canvas
        const xMod = keypoint.position.x * windowWidth / vWidth;
        const yMod = keypoint.position.y * windowHeight / vHeight;
        fill(255);
        noStroke();
        ellipse(xMod, yMod, 10, 10);

        // Nose (when j === 0)
        fill(0, 255, 0);
        if (j === 0) {
          // Draws skull image where the nose of a pose is
          ellipse(xMod, yMod, 50, 50);
          imageMode(CENTER);
          image(img, xMod + 30, yMod, img.width / 5, img.height / 5);
        }

        // Ignore drawing the hands for poses other than the first two
        // Fixes bug in ml5 library where it detects more poses than maxPoseDetections
        if (i >= 2) {
          break;
        }

        // Left Wrist
        if (j === 9) {
          // Left hand object assoicated with this pose
          const leftHand = hands[i][0];
          // Translates the hand object to where PoseNet says the hand is
          // Does it gradually to counteract the twitching PoseNet values
          Body.translate(leftHand, {
            x: (xMod - leftHand.position.x) * 0.5,
            y: (yMod - leftHand.position.y) * 0.5,
          });
        }

        // Right Wrist
        // Same as the left wrist
        if (j === 10) {
          const rightHand = hands[i][1];
          Body.translate(hands[i][1], {
            x: (xMod - hands[i][1].position.x) * 0.5,
            y: (yMod - hands[i][1].position.y) * 0.5,
          });
        }
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i += 1) {
    // For every skeleton, loop through all body connections
    for (let j = 0; j < poses[i].skeleton.length; j += 1) {
      const partA = poses[i].skeleton[j][0];
      const partB = poses[i].skeleton[j][1];
      // Translates position to the canvas
      const xMod = windowWidth / vWidth;
      const yMod = windowHeight / vHeight;

      // Draws the skeleton to the canvas
      stroke(255);
      strokeWeight(6);
      line(partA.position.x * xMod, partA.position.y * yMod, partB.position.x * xMod, partB.position.y * yMod);
    }
  }
}


// When mouse is dragged create a new Snowflake
function mouseDragged() {
  const radius = random(1, 20);

  snowflakes.push(new Snowflake(mouseX, mouseY, radius));
}
