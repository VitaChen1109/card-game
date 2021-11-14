// 宣告遊戲狀態

const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished"
};

// 宣告變數Symbols，依序放入"黑桃"/"愛心"/"方塊"/"梅花"圖片網址陣列
const Symbols = [
  "https://res.cloudinary.com/dqfxgtyoi/image/upload/v1636095891/cardgame/symbol-of-spade_ph6gah.png", // 黑桃
  "https://res.cloudinary.com/dqfxgtyoi/image/upload/v1636095891/cardgame/symbol-of-heart_jifvj5.png", // 愛心
  "https://res.cloudinary.com/dqfxgtyoi/image/upload/v1636095891/cardgame/symbol-of-diamond_zzvz1o.png", // 方塊
  "https://res.cloudinary.com/dqfxgtyoi/image/upload/v1636095891/cardgame/symbol-of-club_ty9tst.png" // 梅花
];

// 與 view 相關函式

const view = {
  // 宣告getCardElement函式並產生牌背
  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`;
  },

  // 宣告getCardContent函式並產生正面資訊 (數字與花色)
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1); // 產生數字
    const symbol = Symbols[Math.floor(index / 13)]; // 產生花色

    return `
      <p>${number}</p>
      <img src="${symbol}" />
      <p>${number}</p>
    `;
  },
  // 宣告transformNumber函式，將"1"/"11"/"12"/"13"轉換成"A"/"J"/"Q"/"k"
  transformNumber(number) {
    switch (number) {
      case 1:
        return "A";
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        return number;
    }
  },

  // 宣告displayCards函式並產生1~52個數字
  displayCards(indexes) {
    const rootElement = document.querySelector("#cards");
    rootElement.innerHTML = indexes
      .map((index) => this.getCardElement(index))
      .join("");
  },

  // 宣告翻牌函式
  flipCards(...cards) {
    // 當牌是背面時，先移除背面並傳入getCardCotent函式產生卡牌正面資訊
    cards.map((card) => {
      if (card.classList.contains("back")) {
        card.classList.remove("back");
        card.innerHTML = this.getCardContent(Number(card.dataset.index));
        return;
      }
      // 如果是正面，就將牌面資訊清空並加入back的class
      card.classList.add("back");
      card.innerHTML = null;
    });
  },

  // 宣告pairCard函式並加入paired的class
  pairCards(...cards) {
    cards.map((card) => {
      card.classList.add("paired");
    });
  },

  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },

  renderTriedTimes(times) {
    document.querySelector(
      ".tried"
    ).textContent = `You've tried: ${times} times`;
  },

  // 宣告函式appendWrongAnimation
  appendWrongAnimation(...cards) {
    cards.map((card) => {
      card.classList.add("wrong");
      card.addEventListener(
        "animationend",
        (event) => event.target.classList.remove("wrong"),
        { once: true }
      );
    });
  },

  // 宣告showGameFinished函式
  // 顯示遊戲結束時的畫面
  showGameFinished() {
    const div = document.createElement("div");

    div.classList.add("completed");
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `;
    const header = document.querySelector("#header");
    header.before(div);
  }
};

// 宣告model
const model = {
  // 先存入翻牌的卡片
  revealedCards: [],

  // 宣告isRevelCardMatched函式並回傳revealedCards中的兩張卡牌數字是否相同
  // 相同回傳true,不等於回傳false
  isRevealedCardsMatched() {
    return (
      this.revealedCards[0].dataset.index % 13 ===
      this.revealedCards[1].dataset.index % 13
    );
  },

  // 宣告變數並放入零
  score: 0,
  triedTimes: 0
};

// 宣告變數controller並放入狀態與控制函式
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52));
  },

  dispatchCardAction(card) {
    if (!card.classList.contains("back")) {
      return;
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card);
        model.revealedCards.push(card);
        this.currentState = GAME_STATE.SecondCardAwaits;
        break;

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes);

        view.flipCards(card);
        model.revealedCards.push(card);

        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          // 配對成功
          view.renderScore((model.score += 10));

          this.currentState = GAME_STATE.CardsMatched;
          view.pairCards(...model.revealedCards);
          model.revealedCards = [];

          if (model.score === 260) {
            console.log("showGameFinished");
            this.currentState = GAME_STATE.GameFinished;
            view.showGameFinished();
            return;
          }

          this.currentState = GAME_STATE.FirstCardAwaits;
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed;
          view.appendWrongAnimation(...model.revealedCards);
          setTimeout(this.resetCards, 1000);
        }
        break;
    }
    console.log("this.currentState", this.currentState);
    console.log(
      "revealedCards",
      model.revealedCards.map((card) => card.dataset.index)
    );
  },

  resetCards() {
    view.flipCards(...model.revealedCards);
    model.revealedCards = [];
    controller.currentState = GAME_STATE.FirstCardAwaits;
  }
};

// 宣告變數utility並放入函式getRandomNumberArray，功能是每次重新整理就會隨機洗牌
// 拿出最後一張牌跟隨機抽取出來的牌交換位置，直到第二張牌為止，藉此達成每張牌都會交換過一次
const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys());
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index]
      ];
    }
    return number;
  }
};

// 請controller調用 generateCards 函式
controller.generateCards();

// 選出所有的card並利用forEach在每張card加上監聽器
// 而handler則放入flipCard函式
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", (event) => {
    controller.dispatchCardAction(card);
  });
});
