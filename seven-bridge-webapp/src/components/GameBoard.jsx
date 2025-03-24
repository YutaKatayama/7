import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { GameStatus, TurnPhase } from '../game/Game';
import Hand from './Hand';
import MeldArea from './MeldArea';
import DeckArea from './DeckArea';
import GameInfo from './GameInfo';
import PonChiOptions from './PonChiOptions';

function GameBoard({ 
  gameState, 
  onDrawCard, 
  onPlayMeld, 
  onAddToMeld, 
  onDiscardCard,
  onPonChi
}) {
  const [selectedCard, setSelectedCard] = useState(null);
  const [showPonChiOptions, setShowPonChiOptions] = useState(false);
  const [ponChiState, setPonChiState] = useState({
    card: null,
    canPon: false,
    canChi: false
  });
  
  // gameStateの変更を監視して、ポン/チーの選択画面を表示するか決定
  useEffect(() => {
    if (!gameState) return;
    
    if (gameState.status === GameStatus.PON_CHI_CHANCE) {
      // 人間プレイヤーがポン/チーできるかチェック
      const ponPlayers = gameState.players.filter((player, index) => !player.isAI && index !== gameState.lastDiscarderIndex);
      const chiPlayer = gameState.players[0]; // 人間プレイヤーのみチェック
      
      // 捨て札の最後のカード
      const lastDiscard = gameState.discardPile[gameState.discardPile.length - 1];
      
      const canPon = ponPlayers.length > 0;
      const canChi = gameState.currentPlayerIndex === 0;
      
      if (canPon || canChi) {
        setShowPonChiOptions(true);
        setPonChiState({
          card: lastDiscard,
          canPon,
          canChi
        });
      }
    } else {
      setShowPonChiOptions(false);
    }
  }, [gameState]);
  
  if (!gameState) {
    return <LoadingContainer>ゲームを読み込み中...</LoadingContainer>;
  }
  
  // プレイヤーのターンかどうか
  const isPlayerTurn = gameState.status === GameStatus.PLAYER_TURN;
  
  // カードを引けるかどうか
  const canDraw = isPlayerTurn && gameState.turnPhase === TurnPhase.DRAW;
  
  // メルドを出せるかどうか
  const canPlayMeld = isPlayerTurn && 
    (gameState.turnPhase === TurnPhase.MELD || gameState.turnPhase === TurnPhase.DISCARD);
  
  // カードを捨てられるかどうか
  const canDiscardCard = isPlayerTurn && 
    (gameState.turnPhase === TurnPhase.MELD || gameState.turnPhase === TurnPhase.DISCARD);
  
  // 山札からカードを引く
  const handleDrawFromStock = () => {
    onDrawCard('stock');
  };
  
  // 捨て札からカードを引く
  const handleDrawFromDiscard = () => {
    onDrawCard('discard');
  };
  
  // カードを選択（捨て札用）
  const handleCardSelect = (card) => {
    setSelectedCard(card);
    onDiscardCard(card);
  };
  
  // ポンを選択
  const handlePon = () => {
    onPonChi('pon');
    setShowPonChiOptions(false);
  };
  
  // チーを選択
  const handleChi = () => {
    onPonChi('chi');
    setShowPonChiOptions(false);
  };
  
  // スキップを選択
  const handleSkipPonChi = () => {
    onPonChi(null, true);
    setShowPonChiOptions(false);
  };
  
  return (
    <GameContainer>
      <GameHeader>
        <GameTitle>セブンブリッジ</GameTitle>
      </GameHeader>
      
      <GameContent>
        <LeftColumn>
          <GameInfoWrapper>
            <GameInfo 
              players={gameState.players} 
              currentPlayerIndex={gameState.currentPlayerIndex} 
            />
          </GameInfoWrapper>
          
          <DeckAreaWrapper>
            <DeckArea 
              stockCount={gameState.stockCount} 
              discardPile={gameState.discardPile} 
              onDrawFromStock={handleDrawFromStock}
              onDrawFromDiscard={handleDrawFromDiscard}
              canDraw={canDraw}
              turnPhase={gameState.turnPhase}
            />
          </DeckAreaWrapper>
        </LeftColumn>
        
        <RightColumn>
          <MeldAreaWrapper>
            <MeldArea 
              players={gameState.players} 
              currentPlayerIndex={gameState.currentPlayerIndex}
              onAddToMeld={onAddToMeld}
              selectedCard={selectedCard}
              canAddToMeld={canPlayMeld && selectedCard !== null}
            />
          </MeldAreaWrapper>
          
          <HandWrapper>
            <Hand 
              cards={gameState.humanPlayer.hand}
              onCardSelect={handleCardSelect}
              onPlayMeld={onPlayMeld}
              canPlayCards={canPlayMeld && !selectedCard}
              canDiscardCard={canDiscardCard && gameState.turnPhase === TurnPhase.DISCARD}
            />
          </HandWrapper>
        </RightColumn>
      </GameContent>
      
      {gameState.status === GameStatus.AI_TURN && (
        <AITurnIndicator>
          {gameState.players[gameState.currentPlayerIndex].name}のターン...
        </AITurnIndicator>
      )}
      
      <PonChiOptions 
        isVisible={showPonChiOptions}
        card={ponChiState.card}
        canPon={ponChiState.canPon}
        canChi={ponChiState.canChi}
        onPon={handlePon}
        onChi={handleChi}
        onSkip={handleSkipPonChi}
        timeLimit={5}
      />
    </GameContainer>
  );
}

// スタイル付きコンポーネント
const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: var(--background-color);
  position: relative;
`;

const GameHeader = styled.header`
  padding: 1rem;
  background-color: var(--primary-color);
  color: white;
  text-align: center;
`;

const GameTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const GameContent = styled.div`
  display: flex;
  flex: 1;
  padding: 1rem;
  gap: 1rem;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 30%;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 70%;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const GameInfoWrapper = styled.div`
  margin-bottom: 1rem;
`;

const DeckAreaWrapper = styled.div``;

const MeldAreaWrapper = styled.div`
  flex: 1;
  margin-bottom: 1rem;
`;

const HandWrapper = styled.div`
  margin-bottom: 1rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 1.5rem;
  color: var(--text-color);
`;

const AITurnIndicator = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 1rem 2rem;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.2rem;
  z-index: 50;
`;

export default GameBoard; 