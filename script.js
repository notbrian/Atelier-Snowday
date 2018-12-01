// Soup of Stars - Final Experiment
// Brian Nguyen, Michael Shefer, Andrew Ng-Lun, Rosh Leynes
// Body tracking based from: https://ml5js.org/docs/posenet-webcam
// Thanks to Daniel Shiffman and Matter.js


// PoseNet
let video;
let poseNet;
let poses = [];
let skeletons = [];


// Matter.js
// module aliases
var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies;

// create an engine
var engine = Engine.create();
var world = engine.world;
var snowflakes = [];
var ground;

// P5 Variables

let leftWrist = {
    position: {
        x: 0,
        y: 0
    }
};
var img; // Declare variable 'img'.


function setup() {
    createCanvas(windowWidth, windowHeight);

    video = createCapture(VIDEO);
    video.size(640, 480);
    img = loadImage("images/skull.png"); // Load the image

    // Create a new poseNet method with a single detection
    poseNet = ml5.poseNet(video, modelReady);
    // This sets up an event that fills the global variable "poses"
    // with an array every time new poses are detected
    poseNet.on('pose', function (results) {
        poses = results;
    });
    // Hide the video element, and just show the canvas
    video.hide();

    var options = {
        isStatic: true
    }
    ground = Bodies.rectangle(width/2, height, width, 100, options);

    World.add(world, ground);


}

function modelReady() {
    select('#status').html('Model Loaded');
}

function draw() {
    background("#006400");
    Engine.update(engine);

    for (var i = 0; i < snowflakes.length; i++) {
        snowflakes[i].show();
    }

    noStroke(255);
    fill(170);
    rectMode(CENTER);
    rect(ground.position.x, ground.position.y, width, 100);




    push();
    image(video, width - 640 * 0.2, height - 480 * 0.2, 640 * 0.2, 480 * 0.2);
    translate(width / 4, 0)
    // We can call both functions to draw all keypoints and the skeletons
    drawKeypoints();
    drawSkeleton();
    pop();


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
                if (j > 0 && j < 5) {
                    continue;
                }
                fill(255);
                noStroke();
                ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
                // Nose
                fill(0, 255, 0)
                if (j === 0) {
                    ellipse(keypoint.position.x, keypoint.position.y, 50, 50)
                    imageMode(CENTER)
                    image(img, keypoint.position.x + 30, keypoint.position.y, img.width / 5, img.height / 5);

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
            strokeWeight(3);
            line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
        }
    }
}


function mousePressed() {
    snowflakes.push(new Snowflake(mouseX, mouseY, random(10, 40)));
}