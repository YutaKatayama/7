import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Game, { GameStatus, TurnPhase } from './game/Game';
import GameBoard from './components/GameBoard';
import TitleScreen from './components/TitleScreen';
import GameOverScreen from './components/GameOverScreen';
import SettingsScreen from './components/SettingsScreen';
import './styles/index.css';

// アプリケーションの画面状態
const AppScreen = {
  TITLE: 'title',    // タイトル画面
  SETTINGS: 'settings', // 設定画面
  GAME: 'game',      // ゲーム画面
  GAME_OVER: 'gameOver' // ゲーム終了画面
};

function App() {
  // アプリケーションの状態
  const [screen, setScreen] = useState(AppScreen.TITLE);
  const [game, setGame] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [gameSettings, setGameSettings] = useState({
    playerCount: 4,
    aiDifficulty: 2,
    playerName: 'プレイヤー'
  });
  const [gameResult, setGameResult] = useState(null);
  
  // ゲームを初期化
  const initializeGame = (settings) => {
    const newGame = new Game(settings.playerCount, settings.aiDifficulty);
    
    // プレイヤー名を設定
    if (settings.playerName) {
      newGame.players[0].name = settings.playerName;
    }
    
    // ゲームイベントの登録
    newGame.on('onGameStateChange', (state) => {
      setGameState(state);
    });
    
    newGame.on('onGameOver', (result) => {
      setGameResult(result);
      setScreen(AppScreen.GAME_OVER);
    });
    
    setGame(newGame);
    return newGame;
  };
  
  // ゲーム開始
  const startGame = () => {
    const newGame = initializeGame(gameSettings);
    newGame.startGame();
    setScreen(AppScreen.GAME);
  };
  
  // 設定画面に移動
  const goToSettings = () => {
    setScreen(AppScreen.SETTINGS);
  };
  
  // 設定を保存して戻る
  const saveSettings = (settings) => {
    setGameSettings(settings);
    setScreen(AppScreen.TITLE);
  };
  
  // 再度ゲームをプレイ
  const playAgain = () => {
    setScreen(AppScreen.TITLE);
  };
  
  // ゲームアクション：カードを引く
  const handleDrawCard = (source) => {
    if (!game || gameState.status !== GameStatus.PLAYER_TURN || 
        gameState.turnPhase !== TurnPhase.DRAW) {
      return;
    }
    
    try {
      game.drawCard(source);
    } catch (error) {
      console.error('ドローエラー:', error);
    }
  };
  
  // ゲームアクション：メルドを出す
  const handlePlayMeld = (cards) => {
    if (!game || gameState.status !== GameStatus.PLAYER_TURN || 
        (gameState.turnPhase !== TurnPhase.MELD && gameState.turnPhase !== TurnPhase.DISCARD)) {
      return;
    }
    
    try {
      return game.playMeld(cards);
    } catch (error) {
      console.error('メルドエラー:', error);
      return false;
    }
  };
  
  // ゲームアクション：既存のメルドにカードを追加
  const handleAddToMeld = (meldIndex, playerIndex, card) => {
    if (!game || gameState.status !== GameStatus.PLAYER_TURN || 
        (gameState.turnPhase !== TurnPhase.MELD && gameState.turnPhase !== TurnPhase.DISCARD)) {
      return;
    }
    
    try {
      return game.addToMeld(meldIndex, playerIndex, card);
    } catch (error) {
      console.error('メルド追加エラー:', error);
      return false;
    }
  };
  
  // ゲームアクション：カードを捨てる
  const handleDiscardCard = (card) => {
    if (!game || gameState.status !== GameStatus.PLAYER_TURN || 
        (gameState.turnPhase !== TurnPhase.MELD && gameState.turnPhase !== TurnPhase.DISCARD)) {
      return;
    }
    
    try {
      game.discardCard(card);
    } catch (error) {
      console.error('捨て札エラー:', error);
    }
  };
  
  // ゲームアクション：ポン/チーの実行
  const handlePonChi = (action, skipPonChi = false) => {
    if (!game || gameState.status !== GameStatus.PON_CHI_CHANCE) {
      return;
    }
    
    // アクションがスキップの場合
    if (skipPonChi) {
      game.resolvePonChi(null, null);
      return;
    }
    
    // ポンの実行
    if (action === 'pon') {
      game.resolvePonChi(0, null);
    } 
    // チーの実行
    else if (action === 'chi') {
      game.resolvePonChi(null, 0);
    }
  };
  
  // 現在の画面に基づいて表示するコンテンツを選択
  const renderScreen = () => {
    switch (screen) {
      case AppScreen.TITLE:
        return (
          <TitleScreen 
            onStartGame={startGame} 
            onSettings={goToSettings} 
          />
        );
        
      case AppScreen.SETTINGS:
        return (
          <SettingsScreen 
            initialSettings={gameSettings} 
            onSave={saveSettings} 
            onCancel={() => setScreen(AppScreen.TITLE)} 
          />
        );
        
      case AppScreen.GAME:
        return (
          <GameBoard 
            gameState={gameState} 
            onDrawCard={handleDrawCard}
            onPlayMeld={handlePlayMeld}
            onAddToMeld={handleAddToMeld}
            onDiscardCard={handleDiscardCard}
            onPonChi={handlePonChi}
          />
        );
        
      case AppScreen.GAME_OVER:
        return (
          <GameOverScreen 
            gameResult={gameResult} 
            onPlayAgain={playAgain} 
          />
        );
        
      default:
        return <div>エラー: 不明な画面</div>;
    }
  };
  
  return (
    <AppContainer>
      {renderScreen()}
    </AppContainer>
  );
}

// スタイル付きコンポーネント
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  background-color: var(--background-color);
  font-family: 'Noto Sans JP', sans-serif;
`;

export default App; 