let inputField = document.getElementById("answer-input");
let questionField = document.getElementById("question-text");
let timeplayBtn = document.getElementById("time-play-btn");
let accuplayBtn = document.getElementById("accu-play-btn");
let scorefield = document.getElementById("score-field");
let timeField = document.getElementById("timer");
let highestField = document.getElementById("highest-score");
let myBest = (parseInt(localStorage.getItem("highscore")) || 0);

//===============================================
let is_question = false;
let is_run = 0;
let correctAnswer = 0;
let score = 0;
let playtime = 120;
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
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
        let c = a*b;
        correctAnswer = a;
        questionField.value = c+" / "+b;
    }
    is_question = true;
}

function reset() {
    is_run = 0;
    is_question = false;
    inputField.value = "";
    questionField.value = "Click Play!";
    timeField.value = playtime;
    scorefield.value = 0;
}

timeField.addEventListener("input", function() {
    if (is_run !=0) return;
    let val = parseInt(timeField.value);
    if (!isNaN(val) && val > 0) {
        playtime = val;
    }
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
});


reset();
highestField.value = myBest
