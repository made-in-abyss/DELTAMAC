let inputField = document.getElementById("answer-input");
let questionField = document.getElementById("question-text");
let timeplayBtn = document.getElementById("time-play-btn");
let accuplayBtn = document.getElementById("accu-play-btn");
let scorefield = document.getElementById("score-field");
let timeField = document.getElementById("timer");
let tips = document.getElementById("tips");
let highestField = document.getElementById("highest-score");
let myBest = (parseInt(localStorage.getItem("highscore")) || 0);
let canvas = document.getElementById("bg-canvas");
let ctx = canvas.getContext("2d");
let audioCtx, analyser, dataArray;
let isAudioInit = false;
let bgm = new Audio("delta.mp3");
bgm.loop = true;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//===============================================
let is_question = false;
let is_run = 0;
let correctAnswer = 0;
let score = 0;
let playtime = 120;
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let tiplist = [
    "KNOWS-NO-BOUND",
    "WE-ARE-HEADING-TOWARDS-A-NUCLEAR-STAR",
    "KNOWS-NO-LIMIT",
    "ARITH//METICS",
    "ADDI//TIVE",
    "MULTIPL//ICATIVE",
    "LET-ME-SEE-THE-STAR",
    "LET-ME-SEE-THE-FUTURE",
    "NOW-YOU-ARE-A-DREAMER",
    "AND-WE'LL-FLY-FOR-THE-DELTA",
]
let deltas = []
function initAudio() {
    if (isAudioInit) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(bgm);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    isAudioInit = true;
}

function spawndelta(){
    let trig = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 20 + 10,
        speed: Math.random() * 0.1 + 0.2,
        rot: Math.random() * Math.PI,
        dir: ((Math.random()*2 - 1)>=0)? 1:-1 ,
    };
    deltas.push(trig);
}
let energy = 0;
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let energy = 0;
    if (isAudioInit==true) {
        analyser.getByteFrequencyData(dataArray);
        let count = dataArray.length;
        let stickWidth = canvas.width/count;
        ctx.fillStyle = "#0bd700";
        for (let i = 0; i <count;i++) {
            let stickHeight = ((dataArray[i]/255)*5)**4;
            energy+=dataArray[i]/255;
            let x = i * stickWidth;
            let y = canvas.height - stickHeight;
            ctx.fillRect(x + 2, y, stickWidth - 4, stickHeight);
        }
        energy = energy/(count-3);
    }
    ctx.strokeStyle = "#0bd700";
    ctx.lineWidth = 1.5;
    for(let d of deltas){
        let csize = d.size*(1+energy);
        let cspeed = d.speed*(1+energy);
        d.y -= cspeed;
        d.rot += d.dir*(0.005*(1+energy));
        if (d.y < -50) d.y = canvas.height + 50;
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rot);
        ctx.beginPath();
        ctx.moveTo(0, -csize);
        ctx.lineTo(-csize, csize);
        ctx.lineTo(csize, csize);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }
    requestAnimationFrame(draw);
}
for(let i = 1;i<=15;i+=1){
    spawndelta();
}
draw();

//===============================================
function getSafeRange(lowerId, higherId, defaultLow, defaultHigh, minAllowed = 1) {
    let lowerEl = document.getElementById(lowerId);
    let higherEl = document.getElementById(higherId);
    let low = parseInt(lowerEl ? lowerEl.value : NaN);
    let high = parseInt(higherEl ? higherEl.value : NaN);
    if (isNaN(low)) low = defaultLow;
    if (isNaN(high)) high = defaultHigh;
    low = Math.max(minAllowed, low);
    high = Math.max(minAllowed, high);
    if (low > high) {
        let temp = low;
        low = high;
        high = temp;
    }

    return [low, high];
}
function arange() {
    let [a_low, a_high] = getSafeRange("a-add-lower", "a-add-higher", 2, 100, 0);
    let [b_low, b_high] = getSafeRange("b-add-lower", "b-add-higher", 2, 100, 0);
    return [a_low, a_high, b_low, b_high];
}

function mrange() {
    let [a_low, a_high] = getSafeRange("a-mul-lower","a-mul-higher", 2, 12, 1);
    let [b_low, b_high] = getSafeRange("b-mul-lower","b-mul-higher", 2, 12, 1);
    return [a_low, a_high, b_low, b_high];
}

function generateProblem() {
    let type = getRandomNumber(1, 4);
    if (type == 1) {
        let r = arange();
        let a = getRandomNumber(r[0],r[1]);
        let b = getRandomNumber(r[2],r[3]);
        correctAnswer = a + b;
        questionField.value = a + " + " +b;
    } 
    else if (type == 2) {
        let r = arange();
        let a = getRandomNumber(r[0], r[1]);
        let b = getRandomNumber(r[2], r[3]);
        let big = Math.max(a, b);
        let small = Math.min(a, b);
        correctAnswer = big - small;
        questionField.value = big + " - " + small;
    } 
    else if (type == 3) {
        let r = mrange();
        let a = getRandomNumber(r[0],r[1]);
        let b = getRandomNumber(r[2],r[3]);
        correctAnswer = a * b;
        questionField.value = a + " * "+b;
    } 
    else if (type == 4) {
        let r = mrange();
        let a = getRandomNumber(r[0],r[1]);
        let b = getRandomNumber(r[2],r[3]);
        correctAnswer = b;
        questionField.value = a*b+" / "+a;
    }
    is_question = true;
}

function reset() {
    is_run = 0;
    is_question = false;
    inputField.value = "";
    questionField.value = "NO INPUT";
    tips.textContent = tiplist[getRandomNumber(0,tiplist.length-1)];
    timeField.value = playtime;
    scorefield.value = 0;
    bgm.pause();
    energy = 0;
    bgm.currentTime = 0;
}

timeField.addEventListener("input", function() {
    if (is_run !=0) return;
    let val = parseInt(timeField.value);
    if (!isNaN(val) && val > 0) {
        playtime = val;
    }
});

tips.addEventListener("click",function(){
    tips.textContent = tiplist[getRandomNumber(0,tiplist.length-1)];
});

//==========TIME MODE=============

inputField.addEventListener("input", function() {
    if (is_question == false || is_run != 1) return;
    
    if (parseInt(inputField.value) === correctAnswer) {
        is_question = false;
        score = score + 1;
        scorefield.value = score;
        inputField.value = "";
        generateProblem();
    }
});

timeplayBtn.addEventListener("click", function() {
    if (is_run !=0) return;
    is_run = 1;
    score = 0;
    generateProblem();
    inputField.value = "";
    inputField.focus();
    let timeLeft = playtime;
    let timer = setInterval(function() {
        timeLeft = timeLeft - 1;
        timeField.value = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            alert("Game Over! Your final score is: " + score);
            myBest = Math.max(myBest,score)
            highestField.value = myBest
            localStorage.setItem("highscore",myBest)
            reset();
        }
    },1000);
});

//===========ACCU MODE=============
let timeLeft = 10;
inputField.addEventListener("keydown", function(event) {
    if (is_question == false || is_run != 2) return;
    if (event.key != "Enter") return;
    
    if (parseInt(inputField.value) === correctAnswer) {
        score = score + 1;
        scorefield.value = score;
    }
    is_question = false;
    inputField.value = "";
    if (timeLeft-1>0) {
        timeLeft--;
        timeField.value = timeLeft;
        generateProblem();
    }
    else{
        alert("Game Over! Out of " + playtime + " question" + (playtime>1?"s":"") +", your ACCURACY is: \n" + (score/playtime)*100 +"%");
        reset();
    }
});

accuplayBtn.addEventListener("click", function() {
    if (is_run !=0) return;
    is_run = 2;
    score = 0;
    timeLeft = playtime;
    inputField.value = "";
    inputField.focus();
    generateProblem();
    initAudio();
    audioCtx.resume();
    bgm.play();
    
});


reset();
highestField.value = myBest
