const question = document.getElementById("question");
const game = document.getElementById("game");
const loader = document.getElementById("loader");
const progressText = document.getElementById("progressText");
const scoreText = document.getElementById("score");
const progressBarFull = document.getElementById("progressBarFull");


// convert the HTML collection of "choice-text" into an array
const choices = Array.from(document.getElementsByClassName("choice-text"));
const choicesContainer = Array.from(
  document.getElementsByClassName("choice-container")
);

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuesions = [];

let questions = [];

// fetch questions from the tech category
fetch("https://opentdb.com/api.php?amount=10&category=18&type=multiple")
  .then((res) => {
    return res.json();
  })
  .then((loadedQuestions) => {
    questions = loadedQuestions.results.map((loadedQuestion) => {
      const formattedQuestion = {
        question: loadedQuestion.question,
      };
      const answerChoices = [...loadedQuestion.incorrect_answers];
      formattedQuestion.answer = Math.floor(Math.random() * 4) + 1;
      answerChoices.splice(
        formattedQuestion.answer - 1,
        0,
        loadedQuestion.correct_answer
      );

      answerChoices.forEach((choice, index) => {
        formattedQuestion["choice" + (index + 1)] = choice;
      });
      return formattedQuestion;
    });

    startGame();
  })
  .catch((err) => {
    console.error(err);
  });

// constants
const CORRECT_BONUS = 10;
const MAX_QUESTIONS = 10;

startGame = () => {
  questionCounter = 0;
  score = 0;
  availableQuesions = [...questions];
  getNewQuestion();
  game.classList.remove("hidden");
  loader.classList.add("hidden");
};

getNewQuestion = () => {
  if (availableQuesions.length === 0 || questionCounter >= MAX_QUESTIONS) {
    localStorage.setItem("mostRecentScore", score);
    // go to the end page
    return window.location.assign("/end.html");
  }

  // questionCounter keeps track of the number of questions that have been rendered so far
  questionCounter++;
  progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;

  //increase progress bar in CSS
  progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

  //questionIndex is a random number between 0 and the current length of the available questions
  const questionIndex = Math.floor(Math.random() * availableQuesions.length);
  // currentQuestion is at the current index of available questions
  currentQuestion = availableQuesions[questionIndex];
  question.innerHTML = currentQuestion.question;

  choices.forEach((choice) => {
    const number = choice.dataset["number"];
    choice.innerHTML = currentQuestion["choice" + number];
  });
  // remove already answered question
  availableQuesions.splice(questionIndex, 1);
  // start accepting answers
  acceptingAnswers = true;
};

choices.forEach((choice) => {
  choice.addEventListener("click", (e) => {
    console.log(e.target);
    if (!acceptingAnswers) return;

    acceptingAnswers = false;
    const selectedChoice = e.target;
    const selectedAnswer = selectedChoice.dataset["number"];

    const classToApply =
      +selectedAnswer === currentQuestion.answer ? "correct" : "incorrect";

    if (classToApply === "correct") {
      incrementScore(CORRECT_BONUS);
    }

    selectedChoice.parentElement.classList.add(classToApply);
    document.getElementById(currentQuestion.answer).classList.add("correct");

    setTimeout(() => {
      selectedChoice.parentElement.classList.remove(classToApply);
      document
        .getElementById(currentQuestion.answer)
        .classList.remove("correct");

      getNewQuestion();
    }, 1000);
  });
});

incrementScore = (num) => {
  score += num;
  scoreText.innerText = score;
};
