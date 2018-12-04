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
    Bodies = Matter.Bodies,
    Body = Matter.Body;


// create an engine
var engine = Engine.create();
var world = engine.world;
var snowflakes = [];
var ground;

let hands = [];

var dx;
var wind;
// P5 Variables

let leftWrist = {
    position: {
        x: 0,
        y: 0
    }
};
var img; // Declare variable 'img'.
var vWidth ;
var vHeight;

function setup() {
    createCanvas(windowWidth, windowHeight);

    video = createCapture(VIDEO);

    //  vWidth = windowWidth * 0.4;
    //  vHeight = windowHeight * 0.4;

    vWidth = 300 * (windowWidth/windowHeight);
    vHeight = 300  * (windowWidth/windowHeight);
    video.size(vWidth, vHeight);

    img = loadImage("images/skull.png"); // Load the image
    let poseOptions = {
        flipHorizontal: true,
        maxPoseDetections: 5,

    }

    // Create a new poseNet method with a single detection
    poseNet = ml5.poseNet(video, poseOptions, modelReady);
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
    ground = Bodies.rectangle(width/2, height, width + 10, 100, options);

    for(let i = 0; i < 6; i++) {
        var options = {
            friction: 1,
            restitution: 0,
          }

          let pair = []
          for(let j = 0; j < 2; j++) {
            pair.push(Bodies.rectangle(width/2,0, 80, 80, options))
            World.add(world, pair[j]);
            
          }

          hands.push(pair)
     

    }



    World.add(world, ground);



    setInterval(function() {
        if(snowflakes.length > 100) {return}
        for (var i = 0; i < random(10); i++) {
            let x = random(1, width);
            let y = random(-300);
            let radius = random(5, 20);
            snowflakes.push(new Snowflake(x, y, radius));
        }


    }, 500)

   

}

function modelReady() {
    // select('#status').html('Model Loaded');
}

function draw() {
    background("#006400");
    Engine.update(engine);
    // dx = map(sin(frameCount / 1000),-1,1,-0.0001,0.0001);
    // wind = {x: dx, y: 0};
 
    for (var i = 0; i < snowflakes.length; i++) {
        snowflakes[i].show();
        // Matter.Body.applyForce(snowflakes[i].body, {x: width/2, y: -400}, wind)
        if(snowflakes[i].isOffScreen()) {
            snowflakes[i].delete();
            snowflakes.splice(i, 1);
            i--;
        }
    }

    noStroke(255);
    fill(170);
    rectMode(CENTER);
    rect(ground.position.x, ground.position.y, width, 100);
    for(let pair in hands) {
        for(hand in hands[pair]) {
            push()
            translate(hands[pair][hand].position.x, hands[pair][hand].position.y);
            rectMode(CENTER);
            rotate(hands[pair][hand].angle)
            rect(0,0, 80, 80)
            pop()
        }
    }


    push();
    image(video, width - vWidth * 0.1, height - vHeight * 0.1, vWidth* 0.1, vHeight * 0.1);
    // translate(width / 4, 0)
    // We can call both functions to draw all keypoints and the skeletons
    // scale(windowWidth/vWidth, windowHeight/vHeight)
    // scale(0.7, 0.7)
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

                var xMod = keypoint.position.x * windowWidth/vWidth
                var yMod = keypoint.position.y * windowHeight/vHeight
                fill(255);
                noStroke();
                ellipse(xMod, yMod, 10, 10);
                // Nose
                fill(0, 255, 0)
                if (j === 0) {
                    ellipse(xMod, yMod, 50, 50)
                    imageMode(CENTER)
                    image(img, xMod + 30, yMod, img.width / 5, img.height / 5);

                }
                // Left Wrist
                console.log(i, hands[i]) 
                let leftHand = hands[i][0]

                if (j === 9) {
            

                    Body.translate(leftHand, {
                        x: (xMod - leftHand.position.x) * 0.8,
                        y: (yMod - leftHand.position.y) * 0.8
                    });
                    // Body.setPosition(hand, {x: xMod, y: yMod})
                    
                } else {//delete
                }
                // Right Wrist
                let rightHand = hands[i][1]

                if (j === 10) {
                    Body.translate(hands[i][1], {
                        x: (xMod - hands[i][1].position.x) * 0.8,
                        y: (yMod - hands[i][1].position.y) * 0.8
                    });
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

            var xMod = windowWidth/vWidth
            var yMod =  windowHeight/vHeight
            stroke(255);
            strokeWeight(3);
            
            line(partA.position.x * xMod, partA.position.y * yMod, partB.position.x *xMod, partB.position.y * yMod);
        }
    }
}


function mouseDragged() {
    let radius = random(1, 20);

    snowflakes.push(new Snowflake(mouseX, mouseY, radius));
}