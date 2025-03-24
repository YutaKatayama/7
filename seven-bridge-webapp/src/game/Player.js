/**
 * セブンブリッジのプレイヤーを表すクラス
 */
class Player {
  /**
   * プレイヤーを初期化する
   * @param {string} name - プレイヤーの名前
   * @param {boolean} isAI - AIプレイヤーかどうか
   * @param {number} id - プレイヤーのID
   */
  constructor(name, isAI = false, id = null) {
    this.name = name;
    this.hand = []; // 手札
    this.melds = []; // 場に出した役のリスト
    this.isAI = isAI; // AIプレイヤーかどうか
    this.id = id || Math.random().toString(36).substr(2, 9); // ランダムなIDを生成
  }

  /**
   * カードを手札に追加する
   * @param {Card} card - 追加するカード
   */
  addToHand(card) {
    this.hand.push(card);
  }

  /**
   * 複数のカードを手札に追加する
   * @param {Card[]} cards - 追加するカードの配列
   */
  addCardsToHand(cards) {
    this.hand.push(...cards);
  }

  /**
   * カードを手札から削除する
   * @param {Card} card - 削除するカード
   * @returns {Card|null} 削除されたカード、見つからない場合はnull
   */
  removeFromHand(card) {
    const index = this.hand.findIndex(c => c.id === card.id);
    if (index !== -1) {
      return this.hand.splice(index, 1)[0];
    }
    return null;
  }

  /**
   * 複数のカードを手札から削除する
   * @param {Card[]} cards - 削除するカードの配列
   * @returns {Card[]} 削除されたカードの配列
   */
  removeCardsFromHand(cards) {
    const removedCards = [];
    for (const card of cards) {
      const removedCard = this.removeFromHand(card);
      if (removedCard) {
        removedCards.push(removedCard);
      }
    }
    return removedCards;
  }

  /**
   * メルド（役）を追加する
   * @param {Card[]} cards - メルドを構成するカードの配列
   */
  addMeld(cards) {
    this.melds.push([...cards]);
  }

  /**
   * 既存のメルドにカードを追加する
   * @param {number} meldIndex - メルドのインデックス
   * @param {Card} card - 追加するカード
   */
  addCardToMeld(meldIndex, card) {
    if (meldIndex >= 0 && meldIndex < this.melds.length) {
      this.melds[meldIndex].push(card);
    }
  }

  /**
   * 手札が空かどうかをチェック（勝利条件）
   * @returns {boolean} 手札が空の場合はtrue
   */
  hasEmptyHand() {
    return this.hand.length === 0;
  }

  /**
   * 手札のカードの合計点数を計算する
   * @returns {number} 手札の合計点数
   */
  calculateHandPoints() {
    let points = 0;
    for (const card of this.hand) {
      let value = card.getPointValue();
      // 7のカードは2倍の得点
      if (card.rank === 7) {
        value *= 2;
      }
      points += value;
    }
    return points;
  }

  /**
   * 手札をソートする（スート順、そしてランク順）
   */
  sortHand() {
    this.hand.sort((a, b) => {
      if (a.suit !== b.suit) {
        const suitOrder = { 'Hearts': 0, 'Diamonds': 1, 'Clubs': 2, 'Spades': 3 };
        return suitOrder[a.suit] - suitOrder[b.suit];
      }
      return a.rank - b.rank;
    });
  }

  /**
   * プレイヤーの情報を文字列で取得
   * @returns {string} プレイヤーの情報
   */
  toString() {
    return `${this.name}（手札: ${this.hand.length}枚, メルド: ${this.melds.length}個）`;
  }
}

export default Player; 