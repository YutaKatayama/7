import Card from './Card';

/**
 * トランプデッキを表すクラス
 */
class Deck {
  /**
   * 新しいデッキを初期化する
   * @param {boolean} includeJokers - ジョーカーを含めるかどうか (デフォルトはfalse)
   */
  constructor(includeJokers = false) {
    this.cards = [];
    this.createDeck(includeJokers);
    this.shuffle();
  }

  /**
   * 52枚のカードを作成し、オプションでジョーカーを追加する
   * @param {boolean} includeJokers - ジョーカーを含めるかどうか
   */
  createDeck(includeJokers) {
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    
    // 各スートの各ランクのカードを追加
    for (const suit of suits) {
      for (let rank = 1; rank <= 13; rank++) {
        this.cards.push(new Card(suit, rank));
      }
    }
    
    // オプションでジョーカーを追加
    if (includeJokers) {
      this.cards.push(new Card('Joker', 0));
      this.cards.push(new Card('Joker', 0));
    }
  }

  /**
   * デッキをシャッフルする
   */
  shuffle() {
    // Fisher-Yatesシャッフルアルゴリズム
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  /**
   * デッキからカードを1枚引く
   * @returns {Card|null} 引いたカード、デッキが空の場合はnull
   */
  drawCard() {
    if (this.isEmpty()) {
      return null;
    }
    return this.cards.pop();
  }

  /**
   * 複数のカードを引く
   * @param {number} count - 引くカードの枚数
   * @returns {Card[]} 引いたカードの配列
   */
  drawCards(count) {
    const drawnCards = [];
    for (let i = 0; i < count; i++) {
      const card = this.drawCard();
      if (card) {
        drawnCards.push(card);
      } else {
        break; // デッキが空になったら終了
      }
    }
    return drawnCards;
  }

  /**
   * デッキにカードを追加する
   * @param {Card} card - 追加するカード
   */
  addCard(card) {
    this.cards.push(card);
  }

  /**
   * デッキに複数のカードを追加する
   * @param {Card[]} cards - 追加するカードの配列
   */
  addCards(cards) {
    this.cards.push(...cards);
  }

  /**
   * デッキが空かどうかを確認する
   * @returns {boolean} デッキが空の場合はtrue
   */
  isEmpty() {
    return this.cards.length === 0;
  }

  /**
   * デッキに残っているカードの枚数を取得する
   * @returns {number} 残っているカードの枚数
   */
  getCount() {
    return this.cards.length;
  }
}

export default Deck; 