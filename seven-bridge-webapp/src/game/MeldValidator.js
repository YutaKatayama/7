/**
 * セブンブリッジの役（メルド）を検証するクラス
 */
class MeldValidator {
  /**
   * 選択されたカードが有効なメルドかどうかをチェックする
   * @param {Card[]} cards - 検証するカードの配列
   * @returns {boolean} 有効なメルドの場合はtrue
   */
  static isValidMeld(cards) {
    if (!cards || cards.length === 0) return false;
    
    // 7の特別ルール: 7のカードは1枚でもメルドとして出せる
    if (cards.length === 1 && cards[0].rank === 7) {
      return true;
    }
    
    // 7の特別ルール: 7を含む順子は2枚でも出せる
    if (cards.length === 2 && this.containsSeven(cards) && this.isSequence(cards)) {
      return true;
    }
    
    // 通常ルール: 3枚以上のセットまたは順子
    if (cards.length >= 3) {
      return this.isSet(cards) || this.isSequence(cards);
    }
    
    return false;
  }
  
  /**
   * カードの配列に7が含まれるかをチェック
   * @param {Card[]} cards - チェックするカードの配列
   * @returns {boolean} 7が含まれる場合はtrue
   */
  static containsSeven(cards) {
    return cards.some(card => card.rank === 7);
  }
  
  /**
   * カードの配列が同じランクのセットかどうかをチェック
   * @param {Card[]} cards - チェックするカードの配列
   * @returns {boolean} 有効なセットの場合はtrue
   */
  static isSet(cards) {
    if (cards.length < 3) return false;
    
    // すべてのカードが同じランクかチェック
    const firstRank = cards[0].rank;
    return cards.every(card => card.rank === firstRank);
  }
  
  /**
   * カードの配列が同じスートの連続するランクの順子かどうかをチェック
   * @param {Card[]} cards - チェックするカードの配列
   * @returns {boolean} 有効な順子の場合はtrue
   */
  static isSequence(cards) {
    if (cards.length < 2) return false;
    
    // 7を含む2枚の特殊ケースを処理（7の特別ルール）
    if (cards.length === 2 && this.containsSeven(cards)) {
      const [card1, card2] = cards;
      // 同じスートでランクが隣接しているかチェック
      if (card1.suit === card2.suit) {
        const ranks = [card1.rank, card2.rank].sort((a, b) => a - b);
        return Math.abs(ranks[1] - ranks[0]) === 1;
      }
      return false;
    }
    
    // 通常の3枚以上の順子
    if (cards.length < 3) return false;
    
    // 同じスートかチェック
    const suit = cards[0].suit;
    if (!cards.every(card => card.suit === suit)) {
      return false;
    }
    
    // ランクでソート
    const sortedCards = [...cards].sort((a, b) => a.rank - b.rank);
    
    // 連続したランクかチェック
    for (let i = 1; i < sortedCards.length; i++) {
      if (sortedCards[i].rank !== sortedCards[i-1].rank + 1) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * 既存のメルドに対してカードを追加できるかチェック
   * @param {Card[]} existingMeld - 既存のメルド
   * @param {Card} card - 追加するカード
   * @returns {boolean} 追加可能な場合はtrue
   */
  static canAddToMeld(existingMeld, card) {
    if (!existingMeld || existingMeld.length === 0) return false;
    
    // セットへの追加
    if (this.isSet(existingMeld)) {
      return card.rank === existingMeld[0].rank;
    }
    
    // 順子への追加
    if (this.isSequence(existingMeld)) {
      // 同じスートかチェック
      if (card.suit !== existingMeld[0].suit) return false;
      
      // 既存の順子をソート
      const sortedMeld = [...existingMeld].sort((a, b) => a.rank - b.rank);
      
      // 最小ランクの前か、最大ランクの後に追加できるかチェック
      return (card.rank === sortedMeld[0].rank - 1) || 
             (card.rank === sortedMeld[sortedMeld.length - 1].rank + 1);
    }
    
    return false;
  }
  
  /**
   * カードがポン（同じランクの3枚組み）できるかチェック
   * @param {Card[]} handCards - 手札のカード
   * @param {Card} discardCard - 場札（捨て札）のカード
   * @returns {boolean} ポン可能な場合はtrue
   */
  static canPon(handCards, discardCard) {
    // 手札から同じランクのカードを探す
    const matchingCards = handCards.filter(card => card.rank === discardCard.rank);
    
    // 2枚以上同じランクのカードがあればポン可能
    return matchingCards.length >= 2;
  }
  
  /**
   * カードがチー（同じスートの連続するランク）できるかチェック
   * @param {Card[]} handCards - 手札のカード
   * @param {Card} discardCard - 場札（捨て札）のカード
   * @returns {boolean} チー可能な場合はtrue
   */
  static canChi(handCards, discardCard) {
    // 同じスートのカードを抽出
    const sameSuitCards = handCards.filter(card => card.suit === discardCard.suit);
    
    // 7を含む特殊ケースを処理
    if (discardCard.rank === 7 || sameSuitCards.some(card => card.rank === 7)) {
      // 7と6、または7と8の組み合わせをチェック
      const ranks = [discardCard.rank, ...sameSuitCards.map(card => card.rank)];
      
      // 7と6の組み合わせ
      if (ranks.includes(7) && ranks.includes(6)) return true;
      
      // 7と8の組み合わせ
      if (ranks.includes(7) && ranks.includes(8)) return true;
    }
    
    // 通常のケース: 連続した3枚をチェック
    for (let i = -2; i <= 0; i++) {
      // 現在のカードがシーケンスの開始、中間、終了のどの位置にあるかをチェック
      const neededRanks = [
        discardCard.rank + i,
        discardCard.rank + i + 1,
        discardCard.rank + i + 2
      ];
      
      // 捨て札のランクを除外
      const ranksNeededInHand = neededRanks.filter(r => r !== discardCard.rank);
      
      // 手札に必要なランクがすべてあるかチェック
      const hasAllRanks = ranksNeededInHand.every(rank => 
        sameSuitCards.some(card => card.rank === rank)
      );
      
      // 有効な範囲内（A-Kの間）に収まっているかチェック
      const validRange = neededRanks.every(rank => rank >= 1 && rank <= 13);
      
      if (hasAllRanks && validRange) {
        return true;
      }
    }
    
    return false;
  }
}

export default MeldValidator; 