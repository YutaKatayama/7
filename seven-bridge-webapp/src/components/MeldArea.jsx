import React, { useState } from 'react';
import styled from 'styled-components';
import Card from './Card';
import MeldValidator from '../game/MeldValidator';

function MeldArea({ 
  players, 
  melds, 
  currentPlayerIndex, 
  onAddToMeld,
  selectedCard,
  canAddToMeld
}) {
  const [selectedMeld, setSelectedMeld] = useState(null);
  
  // メルドをクリックしたときの処理
  const handleMeldClick = (playerIndex, meldIndex) => {
    if (!canAddToMeld || !selectedCard) return;
    
    // 選択中のメルドがあれば付け札を試みる
    if (selectedMeld) {
      const { playerIndex: selectedPlayerIndex, meldIndex: selectedMeldIndex } = selectedMeld;
      
      // 同じメルドをクリックした場合は付け札を実行
      if (selectedPlayerIndex === playerIndex && selectedMeldIndex === meldIndex) {
        const success = onAddToMeld(selectedMeldIndex, selectedPlayerIndex, selectedCard);
        if (success) {
          setSelectedMeld(null);
        }
        return;
      }
    }
    
    // 付け札可能かチェック
    const targetMeld = players[playerIndex].melds[meldIndex];
    if (MeldValidator.canAddToMeld(targetMeld, selectedCard)) {
      setSelectedMeld({ playerIndex, meldIndex });
    }
  };
  
  return (
    <MeldAreaContainer>
      <MeldAreaTitle>場札</MeldAreaTitle>
      
      {players.map((player, playerIndex) => (
        <PlayerMeldSection key={player.id}>
          <PlayerName 
            isCurrentPlayer={playerIndex === currentPlayerIndex}
            isAI={player.isAI}
          >
            {player.name}
            {playerIndex === currentPlayerIndex && <CurrentPlayerMark>★</CurrentPlayerMark>}
          </PlayerName>
          
          <MeldsContainer>
            {player.melds.map((meld, meldIndex) => (
              <MeldGroup 
                key={meldIndex}
                isSelected={selectedMeld && 
                           selectedMeld.playerIndex === playerIndex && 
                           selectedMeld.meldIndex === meldIndex}
                isAddable={canAddToMeld && 
                          selectedCard && 
                          MeldValidator.canAddToMeld(meld, selectedCard)}
                onClick={() => handleMeldClick(playerIndex, meldIndex)}
              >
                {meld.map((card, cardIndex) => (
                  <MeldCardWrapper key={card.id} index={cardIndex} total={meld.length}>
                    <Card 
                      card={card}
                      isDisabled={!canAddToMeld}
                    />
                  </MeldCardWrapper>
                ))}
              </MeldGroup>
            ))}
            
            {player.melds.length === 0 && (
              <EmptyMeldMessage>
                まだメルドがありません
              </EmptyMeldMessage>
            )}
          </MeldsContainer>
        </PlayerMeldSection>
      ))}
      
      {canAddToMeld && selectedCard && selectedMeld && (
        <MeldActionPrompt>
          選択したメルドをもう一度クリックして付け札
        </MeldActionPrompt>
      )}
    </MeldAreaContainer>
  );
}

// スタイル付きコンポーネント
const MeldAreaContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 1rem;
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow-color);
  max-height: 60vh;
  overflow-y: auto;
`;

const MeldAreaTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--primary-color);
  position: sticky;
  top: 0;
  background-color: var(--card-background);
  padding: 0.5rem 0;
  z-index: 2;
`;

const PlayerMeldSection = styled.div`
  margin-bottom: 1.5rem;
`;

const PlayerName = styled.h4`
  font-size: 1rem;
  display: flex;
  align-items: center;
  color: ${props => props.isCurrentPlayer ? 'var(--primary-color)' : 'var(--text-color)'};
  font-weight: ${props => props.isCurrentPlayer ? '600' : '400'};
  margin-bottom: 0.5rem;
  padding-left: 0.5rem;
  border-left: ${props => props.isCurrentPlayer 
    ? '3px solid var(--primary-color)' 
    : '3px solid transparent'};
`;

const CurrentPlayerMark = styled.span`
  margin-left: 0.5rem;
  color: var(--primary-color);
`;

const MeldsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 0.5rem;
`;

const MeldGroup = styled.div`
  display: flex;
  background-color: ${props => props.isSelected 
    ? 'rgba(0, 100, 0, 0.1)' 
    : 'rgba(0, 0, 0, 0.02)'};
  border: 1px solid ${props => props.isSelected 
    ? 'var(--primary-color)' 
    : 'var(--border-color)'};
  border-radius: 8px;
  padding: 0.5rem;
  position: relative;
  box-shadow: ${props => props.isSelected 
    ? '0 0 8px rgba(0, 100, 0, 0.2)' 
    : 'none'};
  cursor: ${props => props.isAddable ? 'pointer' : 'default'};
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.isAddable 
      ? 'rgba(0, 100, 0, 0.1)' 
      : 'rgba(0, 0, 0, 0.02)'};
    border-color: ${props => props.isAddable 
      ? 'var(--primary-color)' 
      : 'var(--border-color)'};
  }
`;

const MeldCardWrapper = styled.div`
  margin-left: ${props => props.index === 0 ? '0' : '-40px'};
  z-index: ${props => props.total - props.index};
  
  @media (max-width: 768px) {
    margin-left: ${props => props.index === 0 ? '0' : '-30px'};
  }
`;

const EmptyMeldMessage = styled.div`
  padding: 1rem;
  color: var(--text-color);
  opacity: 0.7;
  font-style: italic;
`;

const MeldActionPrompt = styled.div`
  text-align: center;
  padding: 0.5rem;
  margin-top: 0.5rem;
  background-color: rgba(0, 100, 0, 0.1);
  color: var(--primary-color);
  border-radius: 4px;
  font-weight: 600;
  position: sticky;
  bottom: 0;
`;

export default MeldArea; 