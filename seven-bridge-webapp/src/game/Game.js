import Deck from './Deck';
import Card from './Card';
import Player from './Player';
import AIPlayer from './AIPlayer';
import MeldValidator from './MeldValidator';

/**
 * ゲームの状態を表す定数
 */
export const GameStatus = {
  WAITING: 'waiting',      // ゲーム開始前
  DEALING: 'dealing',      // カード配布中
  PLAYER_TURN: 'playerTurn', // プレイヤーのターン
  AI_TURN: 'aiTurn',       // AIのターン
  PON_CHI_CHANCE: 'ponChiChance', // ポン/チーの機会
  GAME_OVER: 'gameOver'    // ゲーム終了
};

/**
 * ターンフェーズを表す定数
 */
export const TurnPhase = {
  DRAW: 'draw',       // カードを引くフェーズ
  MELD: 'meld',       // メルドを出すフェーズ
  DISCARD: 'discard'  // カードを捨てるフェーズ
};

/**
 * セブンブリッジゲーム全体を管理するクラス
 */
class Game {
  /**
   * ゲームを初期化する
   * @param {number} numPlayers - プレイヤーの数（AIを含む）
   * @param {number} aiDifficulty - AIの難易度（1-3）
   */
  constructor(numPlayers = 4, aiDifficulty = 1) {
    // プレイヤー数の検証
    this.numPlayers = Math.min(Math.max(numPlayers, 2), 6);
    
    // ゲーム状態の初期化
    this.status = GameStatus.WAITING;
    this.turnPhase = null;
    this.currentPlayerIndex = 0;
    
    // デッキの初期化（ジョーカーなし）
    this.stock = new Deck(false);
    this.discardPile = [];
    
    // プレイヤーの初期化
    this.players = [];
    this.initializePlayers(aiDifficulty);
    
    // ポン/チー関連の状態
    this.ponChiTimeout = null;
    this.ponChiTimeLimit = 3000; // ポン/チーの制限時間（ミリ秒）
    this.lastDiscardedCard = null;
    this.lastDiscarderIndex = -1;
    
    // イベントコールバック（外部から登録されるイベントハンドラ）
    this.eventCallbacks = {
      onGameStateChange: null,
      onPlayerTurnStart: null,
      onAITurnStart: null,
      onCardDrawn: null,
      onMeld: null,
      onDiscard: null,
      onPonChiChance: null,
      onPon: null,
      onChi: null,
      onGameOver: null
    };
  }

  /**
   * プレイヤーを初期化する
   * @param {number} aiDifficulty - AIの難易度
   */
  initializePlayers(aiDifficulty) {
    // 人間プレイヤー
    this.players.push(new Player("あなた", false));
    
    // AIプレイヤー
    const aiNames = ["AI 1", "AI 2", "AI 3", "AI 4", "AI 5"];
    for (let i = 1; i < this.numPlayers; i++) {
      this.players.push(new AIPlayer(aiNames[i-1], aiDifficulty));
    }
  }

  /**
   * イベントコールバックを登録する
   * @param {string} event - イベント名
   * @param {Function} callback - コールバック関数
   */
  on(event, callback) {
    if (this.eventCallbacks.hasOwnProperty(event)) {
      this.eventCallbacks[event] = callback;
    }
  }

  /**
   * イベントを発火する
   * @param {string} event - イベント名
   * @param {any} data - イベントデータ
   */
  fireEvent(event, data) {
    if (this.eventCallbacks[event]) {
      this.eventCallbacks[event](data);
    }
  }

  /**
   * ゲームを開始する
   */
  startGame() {
    this.status = GameStatus.DEALING;
    this.fireEvent('onGameStateChange', this.getGameState());
    
    // カードを配る
    this.dealCards();
    
    // 最初の捨て札を山札から取る
    const firstDiscard = this.stock.drawCard();
    this.discardPile.push(firstDiscard);
    
    // 最初のプレイヤーから開始（ランダムにしたい場合はここで設定）
    this.currentPlayerIndex = 0;
    this.status = GameStatus.PLAYER_TURN;
    this.turnPhase = TurnPhase.DRAW;
    
    // 人間プレイヤーの場合
    if (!this.getCurrentPlayer().isAI) {
      this.fireEvent('onPlayerTurnStart', this.currentPlayerIndex);
    } else {
      // AIの場合
      this.status = GameStatus.AI_TURN;
      this.fireEvent('onAITurnStart', this.currentPlayerIndex);
      this.playAITurn();
    }
    
    this.fireEvent('onGameStateChange', this.getGameState());
  }

  /**
   * カードを各プレイヤーに配る
   */
  dealCards() {
    // 各プレイヤーに7枚ずつ配る
    for (let i = 0; i < 7; i++) {
      for (const player of this.players) {
        const card = this.stock.drawCard();
        player.addToHand(card);
      }
    }
    
    // プレイヤーの手札をソート
    for (const player of this.players) {
      player.sortHand();
    }
  }

  /**
   * 現在のプレイヤーを取得する
   * @returns {Player} 現在のプレイヤー
   */
  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  /**
   * ゲーム状態を取得する
   * @returns {Object} ゲームの現在の状態
   */
  getGameState() {
    return {
      status: this.status,
      turnPhase: this.turnPhase,
      currentPlayerIndex: this.currentPlayerIndex,
      stockCount: this.stock.getCount(),
      discardPile: this.discardPile,
      players: this.players.map(player => ({
        name: player.name,
        handCount: player.hand.length,
        melds: player.melds,
        isAI: player.isAI,
        id: player.id
      })),
      // 人間プレイヤーの詳細情報
      humanPlayer: {
        hand: this.players[0].hand,
        melds: this.players[0].melds
      }
    };
  }

  /**
   * 次のプレイヤーに移る
   */
  nextPlayer() {
    // ゲームが終了していたら何もしない
    if (this.status === GameStatus.GAME_OVER) {
      return;
    }
    
    // 次のプレイヤーのインデックスを計算（時計回り）
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.turnPhase = TurnPhase.DRAW;
    
    const currentPlayer = this.getCurrentPlayer();
    
    // 人間プレイヤーのターンかAIのターンかを設定
    if (currentPlayer.isAI) {
      this.status = GameStatus.AI_TURN;
      this.fireEvent('onAITurnStart', this.currentPlayerIndex);
      this.playAITurn();
    } else {
      this.status = GameStatus.PLAYER_TURN;
      this.fireEvent('onPlayerTurnStart', this.currentPlayerIndex);
    }
    
    this.fireEvent('onGameStateChange', this.getGameState());
  }

  /**
   * カードを引く
   * @param {string} source - 引く場所 ('stock'または'discard')
   * @returns {Card} 引いたカード
   */
  drawCard(source) {
    if (this.turnPhase !== TurnPhase.DRAW) {
      throw new Error("カードを引けるのはドローフェーズのみです");
    }
    
    let card;
    
    if (source === 'stock') {
      // 山札から引く
      card = this.stock.drawCard();
      
      // 山札が空になった場合、捨て札を再利用
      if (!card) {
        if (this.discardPile.length <= 1) {
          // 全てのカードがメルドに使われていて、捨て札も1枚以下の場合は異常事態
          throw new Error("山札と捨て札が空になりました");
        }
        
        // 最後の捨て札を残し、残りを新しい山札にする
        const lastDiscard = this.discardPile.pop();
        this.stock.addCards(this.discardPile);
        this.discardPile = [lastDiscard];
        this.stock.shuffle();
        
        // 再度引く
        card = this.stock.drawCard();
      }
    } else if (source === 'discard') {
      // 捨て札から引く（最後の1枚を取得）
      if (this.discardPile.length === 0) {
        throw new Error("捨て札がありません");
      }
      
      card = this.discardPile.pop();
    } else {
      throw new Error("無効なソースです: " + source);
    }
    
    // 現在のプレイヤーの手札に追加
    this.getCurrentPlayer().addToHand(card);
    this.getCurrentPlayer().sortHand();
    
    // ドローフェーズからメルドフェーズへ
    this.turnPhase = TurnPhase.MELD;
    
    this.fireEvent('onCardDrawn', { player: this.currentPlayerIndex, source, card });
    this.fireEvent('onGameStateChange', this.getGameState());
    
    return card;
  }

  /**
   * メルド（役）を出す
   * @param {Card[]} cards - メルドに使うカードの配列
   * @returns {boolean} メルドが成功したかどうか
   */
  playMeld(cards) {
    const currentPlayer = this.getCurrentPlayer();
    
    // メルドフェーズまたは捨てフェーズ中のみメルド可能
    if (this.turnPhase !== TurnPhase.MELD && this.turnPhase !== TurnPhase.DISCARD) {
      throw new Error("メルドを出せるのはメルドフェーズまたは捨てフェーズのみです");
    }
    
    // カードが有効なメルドかチェック
    if (!MeldValidator.isValidMeld(cards)) {
      return false;
    }
    
    // 手札からカードを削除
    const removedCards = currentPlayer.removeCardsFromHand(cards);
    
    // メルドに追加
    currentPlayer.addMeld(removedCards);
    
    this.fireEvent('onMeld', { player: this.currentPlayerIndex, meld: removedCards });
    this.fireEvent('onGameStateChange', this.getGameState());
    
    // 手札が空になったらゲーム終了
    if (currentPlayer.hasEmptyHand()) {
      this.endGame(this.currentPlayerIndex);
      return true;
    }
    
    return true;
  }

  /**
   * 既存のメルドにカードを追加する（付け札）
   * @param {number} meldIndex - 対象のメルドのインデックス
   * @param {number} playerIndex - メルドを所有するプレイヤーのインデックス
   * @param {Card} card - 追加するカード
   * @returns {boolean} 追加が成功したかどうか
   */
  addToMeld(meldIndex, playerIndex, card) {
    const currentPlayer = this.getCurrentPlayer();
    const targetPlayer = this.players[playerIndex];
    
    // メルドフェーズまたは捨てフェーズ中のみ付け札可能
    if (this.turnPhase !== TurnPhase.MELD && this.turnPhase !== TurnPhase.DISCARD) {
      throw new Error("付け札ができるのはメルドフェーズまたは捨てフェーズのみです");
    }
    
    // メルドが存在するかチェック
    if (!targetPlayer || !targetPlayer.melds[meldIndex]) {
      return false;
    }
    
    // カードがメルドに追加できるかチェック
    if (!MeldValidator.canAddToMeld(targetPlayer.melds[meldIndex], card)) {
      return false;
    }
    
    // 手札からカードを削除
    const removedCard = currentPlayer.removeFromHand(card);
    if (!removedCard) {
      return false;
    }
    
    // メルドにカードを追加
    targetPlayer.addCardToMeld(meldIndex, removedCard);
    
    this.fireEvent('onMeld', { 
      player: this.currentPlayerIndex, 
      targetPlayer: playerIndex, 
      meldIndex, 
      card: removedCard
    });
    this.fireEvent('onGameStateChange', this.getGameState());
    
    // 手札が空になったらゲーム終了
    if (currentPlayer.hasEmptyHand()) {
      this.endGame(this.currentPlayerIndex);
      return true;
    }
    
    return true;
  }

  /**
   * カードを捨てる
   * @param {Card} card - 捨てるカード
   * @returns {boolean} 捨てられたかどうか
   */
  discardCard(card) {
    const currentPlayer = this.getCurrentPlayer();
    
    // フェーズチェック
    if (this.turnPhase !== TurnPhase.MELD && this.turnPhase !== TurnPhase.DISCARD) {
      throw new Error("カードを捨てられるのはメルドフェーズまたは捨てフェーズのみです");
    }
    
    // 手札からカードを削除
    const removedCard = currentPlayer.removeFromHand(card);
    if (!removedCard) {
      return false;
    }
    
    // 捨て札に追加
    this.discardPile.push(removedCard);
    
    // 捨て札の情報を記録
    this.lastDiscardedCard = removedCard;
    this.lastDiscarderIndex = this.currentPlayerIndex;
    
    this.fireEvent('onDiscard', { player: this.currentPlayerIndex, card: removedCard });
    this.fireEvent('onGameStateChange', this.getGameState());
    
    // 手札が空になったらゲーム終了
    if (currentPlayer.hasEmptyHand()) {
      this.endGame(this.currentPlayerIndex);
      return true;
    }
    
    // ポン/チーの機会をチェック
    this.checkPonChiOpportunities();
    
    return true;
  }

  /**
   * ポン/チーの機会をチェックする
   */
  checkPonChiOpportunities() {
    if (!this.lastDiscardedCard) {
      return;
    }
    
    // ポン/チーチェック用の変数
    const ponPlayers = [];
    let chiPlayer = null;
    
    // 各プレイヤーについてポン/チーできるかチェック
    for (let i = 0; i < this.players.length; i++) {
      // 捨てたプレイヤー自身はチェックしない
      if (i === this.lastDiscarderIndex) {
        continue;
      }
      
      const player = this.players[i];
      
      // ポンチェック（すべてのプレイヤー）
      if (MeldValidator.canPon(player.hand, this.lastDiscardedCard)) {
        // AIはその場で判断、人間プレイヤーには選択肢を与える
        if (player.isAI) {
          const aiPlayer = player;
          if (aiPlayer.decidePon(this.lastDiscardedCard)) {
            ponPlayers.push(i);
          }
        } else {
          ponPlayers.push(i);
        }
      }
      
      // チーチェック（次のプレイヤーのみ）
      const nextPlayerIndex = (this.lastDiscarderIndex + 1) % this.players.length;
      if (i === nextPlayerIndex && MeldValidator.canChi(player.hand, this.lastDiscardedCard)) {
        // AIはその場で判断、人間プレイヤーには選択肢を与える
        if (player.isAI) {
          const aiPlayer = player;
          if (aiPlayer.decideChi(this.lastDiscardedCard)) {
            chiPlayer = i;
          }
        } else {
          chiPlayer = i;
        }
      }
    }
    
    // ポン/チーの機会があるか
    if (ponPlayers.length > 0 || chiPlayer !== null) {
      // ゲーム状態をポン/チー選択中に変更
      this.status = GameStatus.PON_CHI_CHANCE;
      
      // イベントを発火
      this.fireEvent('onPonChiChance', { ponPlayers, chiPlayer, card: this.lastDiscardedCard });
      this.fireEvent('onGameStateChange', this.getGameState());
      
      // 人間プレイヤーがポン/チーできる場合、タイムアウトを設定
      const hasHumanOpportunity = (ponPlayers.includes(0) || chiPlayer === 0);
      
      if (hasHumanOpportunity) {
        // 人間プレイヤーには制限時間を設ける
        this.ponChiTimeout = setTimeout(() => {
          this.resolvePonChi(null, null);
        }, this.ponChiTimeLimit);
      } else {
        // AIのみの場合は即時解決
        this.resolvePonChi(ponPlayers.length > 0 ? ponPlayers[0] : null, chiPlayer);
      }
    } else {
      // ポン/チーの機会がない場合は次のプレイヤーへ
      this.nextPlayer();
    }
  }

  /**
   * ポン/チーの選択を解決する
   * @param {number|null} ponPlayerIndex - ポンするプレイヤーのインデックス
   * @param {number|null} chiPlayerIndex - チーするプレイヤーのインデックス
   */
  resolvePonChi(ponPlayerIndex, chiPlayerIndex) {
    // タイムアウトがある場合はクリア
    if (this.ponChiTimeout) {
      clearTimeout(this.ponChiTimeout);
      this.ponChiTimeout = null;
    }
    
    // ポンが優先
    if (ponPlayerIndex !== null) {
      this.executePon(ponPlayerIndex);
    } else if (chiPlayerIndex !== null) {
      this.executeChi(chiPlayerIndex);
    } else {
      // どちらも選択されなかった場合は次のプレイヤーへ
      this.nextPlayer();
    }
  }

  /**
   * ポンを実行する
   * @param {number} playerIndex - ポンするプレイヤーのインデックス
   */
  executePon(playerIndex) {
    // 対象プレイヤーが有効かチェック
    if (playerIndex < 0 || playerIndex >= this.players.length) {
      throw new Error("無効なプレイヤーインデックス: " + playerIndex);
    }
    
    const player = this.players[playerIndex];
    
    // 捨て札の最後のカードを取得して削除
    const card = this.discardPile.pop();
    
    // プレイヤーの手札からポンに必要なカードを見つける
    const matchingCards = player.hand.filter(c => c.rank === card.rank);
    
    if (matchingCards.length < 2) {
      // 何らかの理由でポンできない場合、カードを戻して次に進む
      this.discardPile.push(card);
      this.nextPlayer();
      return;
    }
    
    // 最初の2枚のカードを手札から削除
    const removedCards = [
      player.removeFromHand(matchingCards[0]),
      player.removeFromHand(matchingCards[1])
    ];
    
    // ポンしたカードをメルドに追加
    const meld = [...removedCards, card];
    player.addMeld(meld);
    
    // 現在のプレイヤーを更新
    this.currentPlayerIndex = playerIndex;
    this.turnPhase = TurnPhase.DISCARD;
    
    // ポンしたプレイヤーがAIの場合
    if (player.isAI) {
      this.status = GameStatus.AI_TURN;
    } else {
      this.status = GameStatus.PLAYER_TURN;
    }
    
    this.fireEvent('onPon', { player: playerIndex, card, meld });
    this.fireEvent('onGameStateChange', this.getGameState());
    
    // AIの場合は自動でカードを捨てる
    if (player.isAI) {
      setTimeout(() => {
        const cardToDiscard = player.selectCardToDiscard();
        this.discardCard(cardToDiscard);
      }, 1000);
    }
  }

  /**
   * チーを実行する
   * @param {number} playerIndex - チーするプレイヤーのインデックス
   */
  executeChi(playerIndex) {
    // 対象プレイヤーが有効かチェック
    if (playerIndex < 0 || playerIndex >= this.players.length) {
      throw new Error("無効なプレイヤーインデックス: " + playerIndex);
    }
    
    const player = this.players[playerIndex];
    
    // 捨て札の最後のカードを取得して削除
    const card = this.discardPile.pop();
    
    // 同じスートのカードを抽出
    const sameSuitCards = player.hand.filter(c => c.suit === card.suit);
    
    // 順子を形成できるカードの組み合わせを見つける
    let meldCards = null;
    
    // 7を含む特殊ケースを確認
    if (card.rank === 7 || sameSuitCards.some(c => c.rank === 7)) {
      // 7と6、7と8の組み合わせをチェック
      const ranks = [card.rank, ...sameSuitCards.map(c => c.rank)];
      
      if (ranks.includes(7) && ranks.includes(6)) {
        // 7と6の組み合わせ
        const six = sameSuitCards.find(c => c.rank === 6);
        const seven = card.rank === 7 ? card : sameSuitCards.find(c => c.rank === 7);
        if (six && seven) {
          meldCards = [six, seven];
        }
      } else if (ranks.includes(7) && ranks.includes(8)) {
        // 7と8の組み合わせ
        const seven = card.rank === 7 ? card : sameSuitCards.find(c => c.rank === 7);
        const eight = sameSuitCards.find(c => c.rank === 8);
        if (seven && eight) {
          meldCards = [seven, eight];
        }
      }
    }
    
    // 通常の3枚の順子を探す
    if (!meldCards) {
      for (let i = -2; i <= 0; i++) {
        const neededRanks = [
          card.rank + i,
          card.rank + i + 1,
          card.rank + i + 2
        ];
        
        // 捨て札のランクを除外
        const ranksNeededInHand = neededRanks.filter(r => r !== card.rank);
        
        // 手札に必要なランクがすべてあるかチェック
        const neededCards = ranksNeededInHand.map(rank => 
          sameSuitCards.find(c => c.rank === rank)
        ).filter(c => c);
        
        // 有効な範囲内（A-Kの間）かつ必要なカードがすべて見つかった
        const validRange = neededRanks.every(rank => rank >= 1 && rank <= 13);
        
        if (validRange && neededCards.length === ranksNeededInHand.length) {
          // カードが順子の位置に基づいて順序付けられるように、配列を整理
          const sortedMeld = [];
          for (let j = 0; j < neededRanks.length; j++) {
            if (neededRanks[j] === card.rank) {
              sortedMeld.push(card);
            } else {
              const handCard = sameSuitCards.find(c => c.rank === neededRanks[j]);
              if (handCard) {
                sortedMeld.push(handCard);
              }
            }
          }
          meldCards = sortedMeld;
          break;
        }
      }
    }
    
    if (!meldCards) {
      // 何らかの理由でチーできない場合、カードを戻して次に進む
      this.discardPile.push(card);
      this.nextPlayer();
      return;
    }
    
    // 手札からカードを削除（捨て札を除く）
    const handCardsToRemove = meldCards.filter(c => c !== card);
    const removedCards = handCardsToRemove.map(c => player.removeFromHand(c));
    
    // 順子をメルドに追加
    const meld = [...removedCards, card].sort((a, b) => a.rank - b.rank);
    player.addMeld(meld);
    
    // 現在のプレイヤーを更新
    this.currentPlayerIndex = playerIndex;
    this.turnPhase = TurnPhase.DISCARD;
    
    // チーしたプレイヤーがAIの場合
    if (player.isAI) {
      this.status = GameStatus.AI_TURN;
    } else {
      this.status = GameStatus.PLAYER_TURN;
    }
    
    this.fireEvent('onChi', { player: playerIndex, card, meld });
    this.fireEvent('onGameStateChange', this.getGameState());
    
    // AIの場合は自動でカードを捨てる
    if (player.isAI) {
      setTimeout(() => {
        const cardToDiscard = player.selectCardToDiscard();
        this.discardCard(cardToDiscard);
      }, 1000);
    }
  }

  /**
   * AIプレイヤーのターンを自動実行する
   */
  playAITurn() {
    const aiPlayer = this.getCurrentPlayer();
    
    if (!aiPlayer.isAI) {
      throw new Error("AIプレイヤーのみこのメソッドを呼び出せます");
    }
    
    // AIの手番を実行
    aiPlayer.playTurn(
      this.getGameState(),
      // ドローコールバック
      (source) => {
        this.drawCard(source);
      },
      // メルドコールバック
      (cards) => {
        this.playMeld(cards);
      },
      // 捨て札コールバック
      (card) => {
        this.discardCard(card);
      }
    );
  }

  /**
   * ゲームを終了する
   * @param {number} winnerIndex - 勝者のプレイヤーインデックス
   */
  endGame(winnerIndex) {
    this.status = GameStatus.GAME_OVER;
    
    // 各プレイヤーの得点を計算
    const scores = this.players.map(player => ({
      name: player.name,
      points: player.calculateHandPoints(),
      isWinner: player === this.players[winnerIndex]
    }));
    
    this.fireEvent('onGameOver', { winnerIndex, winner: this.players[winnerIndex], scores });
    this.fireEvent('onGameStateChange', this.getGameState());
  }

  /**
   * ゲームをリセットする
   */
  resetGame() {
    // デッキをリセット
    this.stock = new Deck(false);
    this.discardPile = [];
    
    // プレイヤーの手札とメルドをリセット
    for (const player of this.players) {
      player.hand = [];
      player.melds = [];
    }
    
    // ゲーム状態をリセット
    this.status = GameStatus.WAITING;
    this.turnPhase = null;
    this.currentPlayerIndex = 0;
    
    this.fireEvent('onGameStateChange', this.getGameState());
  }
}

export default Game; 