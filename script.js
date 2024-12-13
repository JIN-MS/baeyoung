// script.js

let score = 0;
let correctAnswer = 0;
let currentQuestion = '';  // 문제 문자열
let questionType = '';  // 문제 유형
let timer;  // 타이머 변수
let timeLeft = 20;  // 초기 시간 20초 설정
let questionHistory = [];  // 이전 문제와 답을 기록할 배열

// 문제를 랜덤으로 생성하는 함수
function generateQuestion() {
  // 난이도에 맞는 숫자 범위 설정 (세 자리 수를 초과하지 않도록 제한)
  let maxNum = 20;
  if (score >= 10 && score < 20) {
    maxNum = 50;  // 점수가 10 이상 20 미만일 때 최대 숫자를 50으로 설정
  } else if (score >= 20 && score < 30) {
    maxNum = 70;  // 점수가 20 이상 30 미만일 때 최대 숫자를 70으로 설정
  } else if (score >= 30) {
    maxNum = 90;  // 점수가 30 이상일 때 최대 숫자를 90으로 설정
  }

  const num1 = Math.floor(Math.random() * maxNum) + 1;  // 난이도에 맞는 랜덤 숫자
  const num2 = Math.floor(Math.random() * maxNum) + 1;  // 난이도에 맞는 랜덤 숫자
  const num3 = Math.floor(Math.random() * maxNum) + 1;  // 1차 방정식에 필요한 또 다른 숫자
  const types = ['addition', 'subtraction', 'multiplication', 'division', 'linearEquation', 'quadraticEquation'];
  questionType = types[Math.floor(Math.random() * types.length)];  // 문제 유형 랜덤 설정

  // 문제 유형에 따른 계산
  if (questionType === 'addition') {
    correctAnswer = num1 + num2;
    currentQuestion = `${num1} + ${num2} = ?`;
  } else if (questionType === 'subtraction') {
    correctAnswer = num1 - num2;
    currentQuestion = `${num1} - ${num2} = ?`;
  } else if (questionType === 'multiplication') {
    // 곱셈 결과가 세 자리를 넘지 않도록 조정
    correctAnswer = num1 * num2;
    if (correctAnswer > 100) {
      generateQuestion();  // 세 자리를 넘으면 다시 문제 생성
      return;
    }
    currentQuestion = `${num1} × ${num2} = ?`;
  } else if (questionType === 'division') {
    // 나누기 문제에서 세 자리를 넘지 않도록 조정
    correctAnswer = num1 * num2 / num2;  // 나누어 떨어지는 숫자 설정
    if (num1 * num2 > 100) {
      generateQuestion();  // 결과가 세 자리를 넘으면 다시 문제 생성
      return;
    }
    currentQuestion = `${num1 * num2} ÷ ${num2} = ?`;
  } else if (questionType === 'linearEquation') {
    // 1차 방정식 (ax + b = c 형태의 문제)
    const a = num1;
    const b = num2;
    let c = b + a * Math.floor(Math.random() * maxNum);  // (c - b) 가 a의 배수가 되도록 c 설정
    if (c > 100) {
      generateQuestion();  // c가 세 자리를 넘으면 다시 문제 생성
      return;
    }
    correctAnswer = (c - b) / a;  // x = (c - b) / a로 계산
    currentQuestion = `${a}x + ${b} = ${c} 형태의 방정식에서 x 값을 구하세요.`;
  } else if (questionType === 'quadraticEquation') {
    // 이차 방정식 (ax² + bx + c = 0 형태의 문제)
    const a = num1;
    const b = num2;
    const c = num3;

    // 판별식 (D = b² - 4ac)이 0 이상이어야만 실수 해가 존재
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) {
      generateQuestion();  // 실수 해가 없는 경우 다시 문제 생성
      return;
    }

    const sqrtDiscriminant = Math.sqrt(discriminant);
    const x1 = (-b + sqrtDiscriminant) / (2 * a);  // 첫 번째 해
    const x2 = (-b - sqrtDiscriminant) / (2 * a);  // 두 번째 해

    // 이차 방정식의 두 해를 모두 구하여 문제를 만든다
    // 소수점 이하는 반올림하여 정수로 표시
    correctAnswer = `${Math.round(x1)} 또는 ${Math.round(x2)}`;  // 소수점 이하를 반올림
    currentQuestion = `${a}x² + ${b}x + ${c} = 0 형태의 이차 방정식에서 x 값을 구하세요.`;
  }

  // 문제를 HTML에 표시
  document.getElementById('question').textContent = `문제: ${currentQuestion}`;
  resetTimer();  // 새로운 문제를 시작할 때 타이머를 초기화

  // 문제와 정답을 기록
  questionHistory.push({ question: currentQuestion, answer: correctAnswer });
}

// 답을 체크하는 함수
function checkAnswer() {
  const userAnswer = document.getElementById('answer').value.trim();

  // 사용자가 입력한 답을 정수로 변환하여 비교
  const parsedAnswer = userAnswer.split(' 또는 ').map(Number);

  // 정답이 맞는지 확인
  if (Array.isArray(parsedAnswer) && parsedAnswer.length > 0) {
    const isCorrect = parsedAnswer.some(answer => 
      correctAnswer.includes(answer.toString()) // 정답 배열과 비교
    );

    if (isCorrect) {
      // 문제를 맞힌 경우 점수 증가
      increaseScore();
      generateQuestion();  // 새로운 문제 생성
      document.getElementById('answer').value = '';  // 답 입력란 초기화
    } else {
      gameOver();  // 틀리면 게임 오버
    }
  } else {
    gameOver();  // 잘못된 답 형식이면 게임 오버
  }
}

// 점수 증가 함수
function increaseScore() {
  let points = 1; // 기본 점수는 1점 (덧셈, 뺄셈)

  // 문제 유형에 따라 점수 증가량을 다르게 설정
  if (questionType === 'multiplication' || questionType === 'division') {
    points = 2;  // 곱셈, 나눗셈은 2점
  } else if (questionType === 'linearEquation') {
    points = 3;  // 1차 방정식은 3점
  } else if (questionType === 'quadraticEquation') {
    points = 4;  // 이차 방정식은 4점
  }

  score += points;  // 점수 증가
  document.getElementById('score').textContent = `점수: ${score}`;  // 화면에 점수 표시
}

// 게임 오버 처리 함수
function gameOver() {
  clearInterval(timer);  // 타이머 정지
  document.getElementById('game-container').style.display = 'none';
  document.getElementById('game-over-container').style.display = 'block';
  document.getElementById('final-score').textContent = `최종 점수: ${score}`;
  
  // 게임 오버 시 문제와 정답을 표시
  const historyContainer = document.getElementById('question-history');
  historyContainer.innerHTML = '<h3>틀린 문제와 정답</h3>';
  questionHistory.forEach(item => {
    const div = document.createElement('div');
    div.textContent = `${item.question} 정답: ${item.answer}`;
    historyContainer.appendChild(div);
  });
}

// 게임 다시 시작 함수
function restartGame() {
  score = 0;  // 점수 초기화
  timeLeft = 20;  // 시간 초기화
  questionHistory = [];  // 문제 기록 초기화
  document.getElementById('score').textContent = `점수: ${score}`;
  document.getElementById('time-left').textContent = `남은 시간: 20초`;
  document.getElementById('game-container').style.display = 'block';
  document.getElementById('game-over-container').style.display = 'none';
  generateQuestion();  // 새로운 게임 시작
}

// 타이머를 시작하는 함수
function startTimer() {
  timer = setInterval(function() {
    timeLeft--;  // 1초씩 감소
    document.getElementById('time-left').textContent = `남은 시간: ${timeLeft}초`;

    if (timeLeft <= 0) {
      clearInterval(timer);  // 타이머 정지
      gameOver();  // 시간이 다 되면 게임 오버 처리
    }
  }, 1000);
}

// 타이머를 초기화하고 다시 시작하는 함수
function resetTimer() {
  timeLeft = 20;  // 타이머 초기화 (20초로 설정)
  document.getElementById('time-left').textContent = `남은 시간: ${timeLeft}초`;
  clearInterval(timer);  // 이전 타이머 정지
  startTimer();  // 새로운 타이머 시작
}

// 게임 시작
generateQuestion();
