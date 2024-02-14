var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var input = document.getElementById("current-frame");

var mouseX = 0;
var mouseY = 0;
var mouseDown = false;
var shiftDown = false;
var ctlDown = false;
var selectedVertex = -1;

var graph = {};
var positions = [{}];

var currentFrame = 0;
var currentPositions = {};
var largestVertex = 0;

var vertexColor = "white";

var playing = false;
var rewinding = false;
var step = false;
var currentTime = 0;

var jsonData = [];
var togHelp = false;

canvas.addEventListener("mousemove", function(e) { 
    var rect = canvas.getBoundingClientRect();
  
    mouseX = Math.round(e.clientX - rect.left);
    mouseY = Math.round(e.clientY - rect.top); 
});

canvas.addEventListener("mousedown", function(e) {
  mouseDown = true;
});

canvas.addEventListener("mouseup", function(e) {
  var endVertex = -1;
  
  if(selectedVertex != -1 && shiftDown) {
    for(var i = 1; i <= largestVertex; i ++) {
      var vx = positions[currentFrame][i][0];
      var vy = positions[currentFrame][i][1];

      if(Math.sqrt(Math.pow(mouseX - vx, 2) + Math.pow(mouseY - vy, 2)) <= 8) {
        endVertex = i;
      }
    }

    if(endVertex != -1 && endVertex != selectedVertex && !graph[selectedVertex].includes(endVertex)) {
      graph[selectedVertex].push(endVertex);
    }
  }
  
  selectedVertex = -1;
  mouseDown = false;
});

document.addEventListener("keydown", function(e) {
  if(e.keyCode == 16) {
    shiftDown = true;
  }

  if(e.keyCode == 17) {
    ctlDown = true;
  }
});

document.addEventListener("keyup", function(e) {
  if(e.keyCode == 16) {
    shiftDown = false;
  }

  if(e.keyCode == 17) {
    ctlDown = false;
  }
});

function randomXPos() {
  return (Math.random() * (canvas.width - 200)) + 100;
}

function randomYPos() {
  return (Math.random() * (canvas.height - 200)) + 100;
}

function addVertex() {
  largestVertex ++;
  
  graph[largestVertex] = [];

  var pos = [randomXPos(), randomYPos()];

  for(var i = 0; i < positions.length; i ++) {
    positions[i][largestVertex] = pos;
  }
}

function removeVertex() {
  if(largestVertex > 0) {
    delete graph[largestVertex];

    for(var i = 1; i <= largestVertex - 1; i ++) {
      for(var ii = 0; ii < graph[i].length; ii ++) {
        if(graph[i][ii] == largestVertex) {
          graph[i].splice(ii, 1);
        }
      }
    }
    
    for(var i = 0; i < positions.length; i ++) {
      delete positions[i][largestVertex];
    }
  
    largestVertex --;
  }
}

function addFrame() {
  var tempFrame = {};

  for(var i = 1; i <= largestVertex; i ++) {
    tempFrame[i] = [];
    tempFrame[i].push(currentPositions[i][0]);
    tempFrame[i].push(currentPositions[i][1]);
  }

  positions.push(tempFrame);
  currentFrame ++;
  input.value = currentFrame + 1;
}

function removeFrame() {
  if(positions.length > 1) {
    positions.pop();
  }

  if(currentFrame >= positions.length) {
    currentFrame --;
    input.value --;
  }
}

function play() {
  playing = true;
  rewinding = false;
  step = false;
  currentTime = 0.0;
  currentPositions = JSON.parse(JSON.stringify(positions[currentFrame]));
}

function rewind() {
  playing = false;
  rewinding = true;
  step = false;
  currentTime = 0.0;
  currentPositions = JSON.parse(JSON.stringify(positions[currentFrame]));
}

function rewindStep() {
  rewind();
  step = true;
}

function playStep() {
  play();
  step = true;
}

function stop() {
  playing = false;
  rewinding = false;
}

function save() {
  var data = {"max": largestVertex, "graph": graph, "positions": positions};
  var text = JSON.stringify(data);
  
  download(text, "UntitledGraph.gf", "text/plain");
}

function load() {
  var fileInput = document.getElementById("file");

  if(fileInput.files.length > 0) {
    var reader = new FileReader();

    reader.addEventListener("load", (e) => {
      jsonData = JSON.parse(reader.result);
      
      graph = jsonData["graph"];
      positions = jsonData["positions"];
      largestVertex = jsonData["max"];
      currentFrame = 0;
      currentPositions = positions[currentFrame];
    });
    
    reader.readAsText(fileInput.files[0]);
  }
}

function help() {
  if(togHelp) {
    togHelp = false;
    document.getElementById("toggle-help").innerHTML = "Show Help";
    document.getElementById("guide").innerHTML = "";
  } else {
    togHelp = true;
    document.getElementById("toggle-help").innerHTML = "Hide Help";
    document.getElementById("guide").innerHTML = 
      "\nTo create a graph, create vertices by clicking Add Vertex, and connect vertices by holding Shift and clicking and dragging from one vertex to another.<br><br>To watch the graph re-arrange from one shape to another, click New Frame, then click and drag vertices to arrange the graph in a new way. You can make as many frames as you want, each with different graph arrangements.<br><br>Press the play button to watch the graph animate from the current frame to the last frame.<br><br>Press ▶| to watch one step of the animation. The same goes for the reverse buttons.<br><br>You can change the current frame you are viewing and the animation speed, in seconds per frame.<br><br>To save an animation, click Save and rename the file or move it to a memorable location. Click Choose File to choose a file and load it.";
  }
}

function renderGraph(acceptInput) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for(var i = 1; i <= largestVertex; i ++) {
    var vx = currentPositions[i][0];
    var vy = currentPositions[i][1];

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#25507D";

    for(var ii = 0; ii < graph[i].length; ii ++) {
      ctx.moveTo(vx, vy);
      ctx.lineTo(currentPositions[graph[i][ii]][0], currentPositions[graph[i][ii]][1]);
      ctx.stroke();
    }

    ctx.closePath();
  }
  
  for(var i = 1; i <= largestVertex; i ++) {
    var vx = currentPositions[i][0];
    var vy = currentPositions[i][1];

    if((Math.sqrt(Math.pow(mouseX - vx, 2) + Math.pow(mouseY - vy, 2)) <= 8) && mouseDown && selectedVertex == -1 && acceptInput) {
      selectedVertex = i;
    }

    if(selectedVertex == i && mouseDown && acceptInput) {
      if(shiftDown) {
        ctx.beginPath();
        ctx.moveTo(vx, vy);
        ctx.lineTo(mouseX, mouseY);
        ctx.strokeStyle = "orange";
        ctx.stroke();
        ctx.closePath();
      } else if(ctlDown) {
        graph[selectedVertex] = [];

        for(var j = 1; j <= largestVertex; j ++) {
          if(graph[j].includes(selectedVertex)) {
            graph[j].splice(graph[j].indexOf(selectedVertex), 1);
          }
        }
      } else {
        positions[currentFrame][i][0] = mouseX;
        positions[currentFrame][i][1] = mouseY;
      }
    }
    
    ctx.beginPath();
    ctx.arc(vx, vy, 9, 0, 6.28);
    ctx.fillStyle = vertexColor;
    ctx.fill();
    ctx.font = "bold 10pt Jost";
    ctx.fillStyle = "black";
    ctx.fillText(i, vx - (ctx.measureText(i).width / 2), vy + 5);
    ctx.closePath();
  }
}

function printPositions() {
  console.log("===");
  
  for(var i = 0; i < positions.length; i ++) {
    console.log("frame: " + i);

    for(var ii = 1; ii <= largestVertex; ii ++) {
      console.log(ii + ": " + positions[i][ii]);
    }
  }
}

function render() {
  if(playing || rewinding) {
    currentTime += 0.05;
    
    var speed = document.getElementById("speed").value;

    if(playing) {
      if(currentFrame == positions.length - 1) {
        playing = false;
      } else {
        for(var i = 1; i <= largestVertex; i ++) {
          var vx = (positions[currentFrame + 1][i][0] - positions[currentFrame][i][0] * 1.00) / speed;
          var vy = (positions[currentFrame + 1][i][1] - positions[currentFrame][i][1] * 1.00) / speed;
          
          vx *= 0.05;
          vy *= 0.05;
          
          currentPositions[i][0] += vx;
          currentPositions[i][1] += vy;
        }
      }

      if(currentTime >= speed) {
        if(step) {
          playing = false;
        }
        
        currentTime = 0.0;
        currentFrame ++;
        input.value = currentFrame + 1;
      }
    } else if(rewinding) {
      if(currentFrame == 0) {
        rewinding = false;
      } else {
        for(var i = 1; i <= largestVertex; i ++) {
          var vx = (positions[currentFrame - 1][i][0] - positions[currentFrame][i][0] * 1.00) / speed;
          var vy = (positions[currentFrame - 1][i][1] - positions[currentFrame][i][1] * 1.00) / speed;
          
          vx *= 0.05;
          vy *= 0.05;
          
          currentPositions[i][0] += vx;
          currentPositions[i][1] += vy;
        }
      }

      if(currentTime >= speed) {
        if(step) {
          rewinding = false;
        }
        
        currentTime = 0.0;
        currentFrame --;
        input.value = currentFrame + 1;
      }
    }
  } else {
    input.max = positions.length;
    currentFrame = input.value - 1;
    currentPositions = JSON.parse(JSON.stringify(positions[currentFrame]));
  }
  
  renderGraph((!playing) && !rewinding);
}

setInterval(render, 50);
