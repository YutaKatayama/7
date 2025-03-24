import Player from './Player';
import MeldValidator from './MeldValidator';

/**
 * AIプレイヤーのクラス (Playerクラスを拡張)
 */
class AIPlayer extends Player {
  /**
   * AIプレイヤーを初期化する
   * @param {string} name - AIの名前
   * @param {number} difficulty - 難易度 (1-3)
   */
  constructor(name, difficulty = 1) {
    super(name, true); // isAIをtrueに設定
    this.difficulty = difficulty; // 難易度 (1=簡単, 2=普通, 3=難しい)
  }

  /**
   * 捨て札から引くか山札から引くかを決定する
   * @param {Card} discardTop - 捨て札の一番上のカード
   * @returns {boolean} 捨て札から引く場合はtrue、そうでない場合はfalse
   */
  decideDrawFromDiscard(discardTop) {
    if (!discardTop) return false;

    // 捨て札を使ってメルドができるかチェック
    const canFormSet = MeldValidator.canPon(this.hand, discardTop);
    const canFormSequence = MeldValidator.canChi(this.hand, discardTop);

    // 難易度が上がるほど、より賢い判断をする
    if (this.difficulty >= 2) {
      // メルドができる場合は捨て札から引く
      return canFormSet || canFormSequence;
    } else {
      // 最も簡単な難易度では、ランダムな要素を加える (50%の確率でメルドを見逃す)
      if (canFormSet || canFormSequence) {
        return Math.random() > 0.5;
      }
      return false;
    }
  }

  /**
   * 手札から捨てるカードを選択する
   * @returns {Card} 捨てるカード
   */
  selectCardToDiscard() {
    if (this.hand.length === 0) return null;

    // 全カードをコピーして点数で評価
    const scoredCards = this.hand.map(card => {
      // 点数計算（高い点数 = 捨てたい）
      let score = card.getPointValue(); // 基本点はカードの得点価値

      // メルドに貢献しそうなカードは捨てたくない
      const potentialMelds = this.findPotentialMelds();
      
      for (const meld of potentialMelds) {
        if (meld.some(c => c.id === card.id)) {
          // このカードがメルドに貢献する場合、点数を下げる
          score -= 5; 
        }
      }

      // 7は貴重なので捨てたくない (難易度2以上)
      if (this.difficulty >= 2 && card.rank === 7) {
        score -= 10;
      }

      return { card, score };
    });

    // 難易度に応じて選択方法を変える
    if (this.difficulty === 3) {
      // 最も賢いAIは最も点数の高いカードを選ぶ
      scoredCards.sort((a, b) => b.score - a.score);
      return scoredCards[0].card;
    } else if (this.difficulty === 2) {
      // 普通の難易度では上位3枚からランダムに選ぶ
      scoredCards.sort((a, b) => b.score - a.score);
      const index = Math.floor(Math.random() * Math.min(3, scoredCards.length));
      return scoredCards[index].card;
    } else {
      // 最も簡単な難易度ではよりランダム性が高い
      if (Math.random() < 0.3) {
        // 30%の確率で完全にランダムに選ぶ
        const index = Math.floor(Math.random() * this.hand.length);
        return this.hand[index];
      } else {
        // 70%の確率で上位半分からランダムに選ぶ
        scoredCards.sort((a, b) => b.score - a.score);
        const halfLength = Math.ceil(scoredCards.length / 2);
        const index = Math.floor(Math.random() * halfLength);
        return scoredCards[index].card;
      }
    }
  }

  /**
   * 手札から出せるメルドを見つける
   * @returns {Card[][]} 出せるメルドの配列
   */
  findMelds() {
    // 可能なすべてのメルドを格納する配列
    const validMelds = [];

    // 7のメルド（単体）をチェック
    const sevens = this.hand.filter(card => card.rank === 7);
    for (const seven of sevens) {
      validMelds.push([seven]);
    }

    // 同じランクのセットを探す (3枚以上)
    const rankGroups = {};
    for (const card of this.hand) {
      if (!rankGroups[card.rank]) {
        rankGroups[card.rank] = [];
      }
      rankGroups[card.rank].push(card);
    }

    for (const rank in rankGroups) {
      if (rankGroups[rank].length >= 3) {
        validMelds.push(rankGroups[rank]);
      }
    }

    // 順子を探す (同じスートの連続したランク)
    const suitGroups = {};
    for (const card of this.hand) {
      if (!suitGroups[card.suit]) {
        suitGroups[card.suit] = [];
      }
      suitGroups[card.suit].push(card);
    }

    for (const suit in suitGroups) {
      if (suitGroups[suit].length >= 3) {
        // スート内のカードをランク順にソート
        const sortedCards = suitGroups[suit].sort((a, b) => a.rank - b.rank);
        
        // 連続する3枚以上の組み合わせを探す
        for (let i = 0; i < sortedCards.length - 2; i++) {
          for (let j = i + 1; j < sortedCards.length - 1; j++) {
            if (sortedCards[j].rank === sortedCards[i].rank + 1) {
              for (let k = j + 1; k < sortedCards.length; k++) {
                if (sortedCards[k].rank === sortedCards[j].rank + 1) {
                  // 3枚以上の連続したカードを見つけた
                  const sequence = [sortedCards[i], sortedCards[j], sortedCards[k]];
                  
                  // さらに連続するカードがあれば追加
                  let nextRank = sortedCards[k].rank + 1;
                  let l = k + 1;
                  while (l < sortedCards.length && sortedCards[l].rank === nextRank) {
                    sequence.push(sortedCards[l]);
                    nextRank++;
                    l++;
                  }
                  
                  validMelds.push(sequence);
                }
              }
            }
          }
        }
        
        // 7を含む2枚の順子を探す (特別ルール)
        const sevenIndex = sortedCards.findIndex(card => card.rank === 7);
        if (sevenIndex !== -1) {
          // 7と6
          const sixIndex = sortedCards.findIndex(card => card.rank === 6);
          if (sixIndex !== -1) {
            validMelds.push([sortedCards[sixIndex], sortedCards[sevenIndex]]);
          }
          
          // 7と8
          const eightIndex = sortedCards.findIndex(card => card.rank === 8);
          if (eightIndex !== -1) {
            validMelds.push([sortedCards[sevenIndex], sortedCards[eightIndex]]);
          }
        }
      }
    }

    return validMelds;
  }

  /**
   * 潜在的に形成できそうなメルドを見つける (未完成のメルド)
   * @returns {Card[][]} 潜在的なメルドの配列
   */
  findPotentialMelds() {
    const potentialMelds = [];

    // 2枚の同じランクのカードを見つける (3枚揃えば役になる)
    const rankGroups = {};
    for (const card of this.hand) {
      if (!rankGroups[card.rank]) {
        rankGroups[card.rank] = [];
      }
      rankGroups[card.rank].push(card);
    }

    for (const rank in rankGroups) {
      if (rankGroups[rank].length === 2) {
        potentialMelds.push(rankGroups[rank]);
      }
    }

    // 連続する2枚のカード (同じスート) を見つける
    const suitGroups = {};
    for (const card of this.hand) {
      if (!suitGroups[card.suit]) {
        suitGroups[card.suit] = [];
      }
      suitGroups[card.suit].push(card);
    }

    for (const suit in suitGroups) {
      if (suitGroups[suit].length >= 2) {
        const sortedCards = suitGroups[suit].sort((a, b) => a.rank - b.rank);
        
        for (let i = 0; i < sortedCards.length - 1; i++) {
          if (sortedCards[i + 1].rank === sortedCards[i].rank + 1) {
            potentialMelds.push([sortedCards[i], sortedCards[i + 1]]);
          } else if (sortedCards[i + 1].rank === sortedCards[i].rank + 2) {
            // 1つ飛ばしの場合も考慮 (例: 3-5)
            potentialMelds.push([sortedCards[i], sortedCards[i + 1]]);
          }
        }
      }
    }

    return potentialMelds;
  }

  /**
   * AIの手番を実行する
   * @param {GameState} gameState - ゲームの状態
   * @param {Function} drawCallback - ドローアクションのコールバック関数
   * @param {Function} meldCallback - メルドアクションのコールバック関数
   * @param {Function} discardCallback - 捨て札アクションのコールバック関数
   */
  playTurn(gameState, drawCallback, meldCallback, discardCallback) {
    // 遅延を追加して、AIの思考時間を演出
    setTimeout(() => {
      // 1. 山札から引くか捨て札から引くかを決定
      const drawFromDiscard = this.decideDrawFromDiscard(gameState.discardPile[gameState.discardPile.length - 1]);
      
      // 2. カードを引く
      if (drawFromDiscard) {
        drawCallback('discard');
      } else {
        drawCallback('stock');
      }
      
      // 3. メルド（役）を出せるか判断
      setTimeout(() => {
        const validMelds = this.findMelds();
        
        if (validMelds.length > 0) {
          // 難易度に応じてメルドを出す確率を調整
          const willPlayMeld = this.difficulty === 1 ? Math.random() > 0.3 : true;
          
          if (willPlayMeld) {
            // 最長のメルドを優先
            validMelds.sort((a, b) => b.length - a.length);
            meldCallback(validMelds[0]);
          }
        }
        
        // 4. カードを捨てる
        setTimeout(() => {
          const cardToDiscard = this.selectCardToDiscard();
          discardCallback(cardToDiscard);
        }, 500);
      }, 500);
    }, 1000);
  }

  /**
   * AIがポンできるか判断し、ポンする場合はtrue、しない場合はfalseを返す
   * @param {Card} discardCard - 場札のカード
   * @returns {boolean} ポンするかどうか
   */
  decidePon(discardCard) {
    if (!MeldValidator.canPon(this.hand, discardCard)) {
      return false;
    }
    
    // 難易度に応じてポンする確率を調整
    if (this.difficulty === 3) {
      return true; // 最も賢いAIは常にポン
    } else if (this.difficulty === 2) {
      return Math.random() > 0.2; // 80%の確率でポン
    } else {
      return Math.random() > 0.5; // 50%の確率でポン
    }
  }

  /**
   * AIがチーできるか判断し、チーする場合はtrue、しない場合はfalseを返す
   * @param {Card} discardCard - 場札のカード
   * @returns {boolean} チーするかどうか
   */
  decideChi(discardCard) {
    if (!MeldValidator.canChi(this.hand, discardCard)) {
      return false;
    }
    
    // 難易度に応じてチーする確率を調整
    if (this.difficulty === 3) {
      return true; // 最も賢いAIは常にチー
    } else if (this.difficulty === 2) {
      return Math.random() > 0.3; // 70%の確率でチー
    } else {
      return Math.random() > 0.6; // 40%の確率でチー
    }
  }
}

export default AIPlayer; 