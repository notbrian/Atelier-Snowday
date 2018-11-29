// Soup of Stars - Final Experiment
// Brian Nguyen, Michael Shefer, Andrew Ng-Lun, Rosh Leynes
// Based on: https://ml5js.org/docs/posenet-webcam

let video;
let poseNet;
let poses = [];
let skeletons = [];
let snowflakes = []; // array to hold snowflake objects
let leftWrist = {
    position: {
        x: 0,
        y: 0
    }
};
var img;  // Declare variable 'img'.


function setup() {
    createCanvas(windowWidth, windowHeight);
    video = createCapture(VIDEO);
    video.size(640, 480);
    img = loadImage("images/skull.png");  // Load the image

    // Create a new poseNet method with a single detection
    poseNet = ml5.poseNet(video, modelReady);
    // This sets up an event that fills the global variable "poses"
    // with an array every time new poses are detected
    poseNet.on('pose', function (results) {
        poses = results;
    });
    // Hide the video element, and just show the canvas
    video.hide();
}

function modelReady() {
    select('#status').html('Model Loaded');
}

function draw() {
    background("#006400");
    push();
    image(video, width - 640 * 0.2, height - 480 * 0.2, 640 * 0.2, 480 * 0.2);
    translate(width / 4, 0)
    // We can call both functions to draw all keypoints and the skeletons
    drawKeypoints();
    drawSkeleton();
    pop();

  let t = frameCount / 60; // update time

  // create a random number of snowflakes each frame
  for (var i = 0; i < random(5); i++) {
    snowflakes.push(new snowflake()); // append snowflake object
  }

  // loop through snowflakes with a for..of loop
  for (let flake of snowflakes) {
    flake.update(t); // update snowflake position
    fill(255);
    flake.display(); // draw snowflake
    flake.collide();
  }

//   scale(-1,1);

}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
    // Loop through all the poses detected
    for (let i = 0; i < poses.length; i++) {
        // For each pose detected, loop through all the keypoints
        for (let j = 0; j < poses[i].pose.keypoints.length; j++) {
            // A keypoint is an object describing a body part (like rightArm or leftShoulder)
            let keypoint = poses[i].pose.keypoints[j];
            // Only draw an ellipse is the pose probability is bigger than 0.2
            if (keypoint.score > 0.2) {
                if(j > 0 && j < 5) {continue;}
                fill(255);
                noStroke();
                ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
                // Nose
                fill(0,255,0)
                if (j === 0) {
                    ellipse(keypoint.position.x, keypoint.position.y, 50, 50)
                    imageMode(CENTER)
                    image(img, keypoint.position.x + 30, keypoint.position.y , img.width/5, img.height/5);

                }
                // Left Wrist
                if (j === 9) {
                    leftWrist = keypoint;
                    // ellipse(keypoint.position.x, keypoint.position.y, 100, 100)
                }
                // Right Wrist
                if (j === 10) {
                    // ellipse(keypoint.position.x, keypoint.position.y, 100, 100)
                }
            }
        }
    }
}

// A function to draw the skeletons
function drawSkeleton() {
    // Loop through all the skeletons detected
    for (let i = 0; i < poses.length; i++) {
        // For every skeleton, loop through all body connections
        for (let j = 0; j < poses[i].skeleton.length; j++) {
            let partA = poses[i].skeleton[j][0];
            let partB = poses[i].skeleton[j][1];
            stroke(255);
            line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
        }
    }
}

// snowflake class
function snowflake() {
    // initialize coordinates
    this.posX = 0;
    this.posY = random(-50, 0);
    this.initialangle = random(0, 2 * PI);
    this.size = random(2, 5);
    this.color = color(255);
  
    // radius of snowflake spiral
    // chosen so the snowflakes are uniformly spread out in area
    this.radius = sqrt(random(pow(width / 1, 2)));
  
    this.update = function(time) {
      // x position follows a circle
      let w = 0.6; // angular speed
      let angle = w * time + this.initialangle;
      this.posX = width / 2 + this.radius * sin(angle);
  
      // different size snowflakes fall at slightly different y speeds
      this.posY += pow(this.size, 0.5);
  
      // delete snowflake if past end of screen
      if (this.posY > height) {
        let index = snowflakes.indexOf(this);
        snowflakes.splice(index, 1);
      }
    };
  
    this.display = function() {
      fill(this.color)
      ellipse(this.posX, this.posY, this.size);
    };

    this.collide = function() {
        if(dist(leftWrist.position.x, leftWrist.position.y, this.posX, this.posY) < 50) {
            this.color = color("006400")
        }
    }
  }
  