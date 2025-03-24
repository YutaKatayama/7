import React from 'react';
import styled from 'styled-components';
import Card from './Card';

function DeckArea({ 
  discardPile, 
  stockCount, 
  onDrawFromStock, 
  onDrawFromDiscard,
  canDraw,
  turnPhase 
}) {
  // 山札からカードを引く
  const handleDrawFromStock = () => {
    if (!canDraw) return;
    onDrawFromStock();
  };
  
  // 捨て札からカードを引く
  const handleDrawFromDiscard = () => {
    if (!canDraw || discardPile.length === 0) return;
    onDrawFromDiscard();
  };
  
  // 捨て札の一番上のカードを取得
  const topDiscardCard = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;
  
  return (
    <DeckAreaContainer>
      <DeckSection>
        <DeckTitle>山札</DeckTitle>
        <StockPile 
          onClick={handleDrawFromStock}
          canDraw={canDraw}
        >
          {stockCount > 0 ? (
            <>
              <Card isFaceDown={true} isDisabled={!canDraw} />
              <CardCount>{stockCount}</CardCount>
            </>
          ) : (
            <EmptyDeckMessage>空</EmptyDeckMessage>
          )}
        </StockPile>
        {canDraw && <ActionPrompt>クリックしてカードを引く</ActionPrompt>}
      </DeckSection>
      
      <DeckSection>
        <DeckTitle>捨て札</DeckTitle>
        <DiscardPile 
          onClick={handleDrawFromDiscard}
          canDraw={canDraw && discardPile.length > 0}
        >
          {topDiscardCard ? (
            <Card card={topDiscardCard} isDisabled={!canDraw} />
          ) : (
            <EmptyDeckMessage>空</EmptyDeckMessage>
          )}
        </DiscardPile>
        {canDraw && discardPile.length > 0 && (
          <ActionPrompt>クリックしてカードを取る</ActionPrompt>
        )}
      </DeckSection>
      
      {turnPhase && (
        <PhaseDisplay>
          {turnPhase === 'draw' && '引く番です'}
          {turnPhase === 'meld' && 'メルドを出せます'}
          {turnPhase === 'discard' && 'カードを捨ててください'}
        </PhaseDisplay>
      )}
    </DeckAreaContainer>
  );
}

// スタイル付きコンポーネント
const DeckAreaContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 1rem;
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow-color);
`;

const DeckSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
  width: 100%;
`;

const DeckTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
`;

const StockPile = styled.div`
  position: relative;
  cursor: ${props => props.canDraw ? 'pointer' : 'default'};
  transition: transform 0.2s;
  
  &:hover {
    transform: ${props => props.canDraw ? 'scale(1.03)' : 'none'};
  }
`;

const DiscardPile = styled.div`
  position: relative;
  cursor: ${props => props.canDraw ? 'pointer' : 'default'};
  transition: transform 0.2s;
  
  &:hover {
    transform: ${props => props.canDraw ? 'scale(1.03)' : 'none'};
  }
`;

const EmptyDeckMessage = styled.div`
  width: 80px;
  height: 112px;
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--border-color);
  font-weight: 600;
  
  @media (max-width: 768px) {
    width: 60px;
    height: 84px;
    font-size: 0.9rem;
  }
`;

const CardCount = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: var(--primary-color);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
    font-size: 0.8rem;
  }
`;

const ActionPrompt = styled.div`
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: var(--primary-color);
  text-align: center;
`;

const PhaseDisplay = styled.div`
  padding: 0.5rem 1rem;
  background-color: rgba(0, 100, 0, 0.1);
  color: var(--primary-color);
  border-radius: 4px;
  font-weight: 600;
  margin-top: 1rem;
  text-align: center;
`;

export default DeckArea; 