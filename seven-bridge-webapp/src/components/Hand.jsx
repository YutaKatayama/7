import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Card from './Card';
import MeldValidator from '../game/MeldValidator';

function Hand({ cards, onCardSelect, onPlayMeld, canPlayCards, canDiscardCard }) {
  const [selectedCards, setSelectedCards] = useState([]);
  const [validMeld, setValidMeld] = useState(false);
  
  // 選択されたカードが変わったときに、有効なメルドかどうかをチェック
  useEffect(() => {
    if (selectedCards.length === 0) {
      setValidMeld(false);
      return;
    }
    
    setValidMeld(MeldValidator.isValidMeld(selectedCards));
  }, [selectedCards]);
  
  // カードの選択/選択解除
  const handleCardClick = (card) => {
    if (!canPlayCards) return;
    
    // すでに選択されている場合は選択解除
    if (selectedCards.some(c => c.id === card.id)) {
      setSelectedCards(prev => prev.filter(c => c.id !== card.id));
    } else {
      // 選択されていない場合は選択
      setSelectedCards(prev => [...prev, card]);
    }
  };
  
  // 選択されたカードでメルドを出す
  const handlePlayMeld = () => {
    if (!validMeld || !canPlayCards) return;
    
    const success = onPlayMeld(selectedCards);
    if (success) {
      setSelectedCards([]);
    }
  };
  
  // カードを捨てる
  const handleDiscardCard = (card) => {
    if (!canDiscardCard) return;
    
    // 選択状態をクリアしてからカードを捨てる
    setSelectedCards([]);
    onCardSelect(card);
  };
  
  // 選択をクリア
  const clearSelection = () => {
    setSelectedCards([]);
  };
  
  return (
    <HandContainer>
      <HandTitle>あなたの手札</HandTitle>
      
      <CardsContainer>
        {cards.map(card => (
          <CardWrapper key={card.id}>
            <Card 
              card={card}
              isSelected={selectedCards.some(c => c.id === card.id)}
              onClick={() => canDiscardCard ? handleDiscardCard(card) : handleCardClick(card)}
              isDisabled={!canPlayCards && !canDiscardCard}
            />
          </CardWrapper>
        ))}
      </CardsContainer>
      
      {canPlayCards && selectedCards.length > 0 && (
        <ActionButtons>
          <ActionButton 
            onClick={handlePlayMeld}
            disabled={!validMeld}
            isValid={validMeld}
          >
            メルドを出す
          </ActionButton>
          
          <CancelButton onClick={clearSelection}>
            選択クリア
          </CancelButton>
        </ActionButtons>
      )}
      
      {canDiscardCard && (
        <DiscardPrompt>
          捨てるカードを選んでください
        </DiscardPrompt>
      )}
    </HandContainer>
  );
}

// スタイル付きコンポーネント
const HandContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 1rem;
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow-color);
`;

const HandTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--primary-color);
`;

const CardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  padding: 0.5rem;
  min-height: 120px;
  
  @media (max-width: 768px) {
    min-height: 90px;
  }
`;

const CardWrapper = styled.div`
  transition: all 0.2s;
  margin: 0 -10px 0 0; // カードを重ねて表示
  
  &:hover {
    z-index: 5;
    margin: 0 5px; // ホバー時に少し間隔を空ける
  }
  
  @media (max-width: 768px) {
    margin: 0 -5px 0 0;
    
    &:hover {
      margin: 0 2px;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${props => props.isValid ? 'var(--primary-color)' : 'var(--border-color)'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: ${props => props.isValid ? 'pointer' : 'not-allowed'};
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.isValid ? 'var(--secondary-color)' : 'var(--border-color)'};
  }
`;

const CancelButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--border-color);
  }
`;

const DiscardPrompt = styled.div`
  text-align: center;
  padding: 0.5rem;
  margin-top: 1rem;
  background-color: rgba(255, 87, 34, 0.1);
  color: var(--accent-color);
  border-radius: 4px;
  font-weight: 600;
`;

export default Hand; 