/**
 * セブンブリッジのカードを表すクラス
 */
class Card {
  /**
   * カードを初期化する
   * @param {string} suit - カードのスート ('Hearts', 'Diamonds', 'Clubs', 'Spades')
   * @param {number} rank - カードのランク (1-13, Aは1, J=11, Q=12, K=13)
   */
  constructor(suit, rank) {
    this.suit = suit;
    this.rank = rank;
    this.id = `${this.rankToString()}_${this.suitToCode()}`;
  }

  /**
   * カードのスート名を日本語に変換する
   * @returns {string} スートの日本語名
   */
  suitToJapanese() {
    const suitMap = {
      'Hearts': 'ハート',
      'Diamonds': 'ダイヤ',
      'Clubs': 'クラブ',
      'Spades': 'スペード'
    };
    return suitMap[this.suit] || this.suit;
  }

  /**
   * カードのスートをHTMLエンティティコードに変換する
   * @returns {string} スートのHTMLエンティティコード
   */
  suitToSymbol() {
    const symbols = {
      'Hearts': '♥',
      'Diamonds': '♦',
      'Clubs': '♣',
      'Spades': '♠'
    };
    return symbols[this.suit] || this.suit;
  }

  /**
   * スートを短いコードに変換する
   * @returns {string} スートのコード (H, D, C, S)
   */
  suitToCode() {
    const codes = {
      'Hearts': 'H',
      'Diamonds': 'D',
      'Clubs': 'C',
      'Spades': 'S'
    };
    return codes[this.suit] || this.suit.charAt(0);
  }

  /**
   * ランクを文字列に変換する (1=A, 11=J, 12=Q, 13=K)
   * @returns {string} ランクの文字表現
   */
  rankToString() {
    if (this.rank === 1) return 'A';
    if (this.rank === 11) return 'J';
    if (this.rank === 12) return 'Q';
    if (this.rank === 13) return 'K';
    return this.rank.toString();
  }

  /**
   * カードの表示名を取得する
   * @returns {string} カードの表示名 (例: "ハートの7")
   */
  getDisplayName() {
    return `${this.suitToJapanese()}の${this.rankToString()}`;
  }

  /**
   * カードの短い表示形式を取得する
   * @returns {string} カードの短い表示形式 (例: "7♥")
   */
  toString() {
    return `${this.rankToString()}${this.suitToSymbol()}`;
  }

  /**
   * このカードが7かどうかを判断する（セブンブリッジでは特別なカード）
   * @returns {boolean} 7の場合はtrue
   */
  isSeven() {
    return this.rank === 7;
  }

  /**
   * このカードの得点価値を計算する
   * @returns {number} カードの得点価値
   */
  getPointValue() {
    if (this.rank >= 10) return 10; // 10, J, Q, K は10点
    return this.rank; // それ以外はランク値が点数
  }
}

export default Card; 