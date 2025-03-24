import React from 'react';
import styled from 'styled-components';

function Card({ card, isSelected, onClick, isFaceDown, isDisabled }) {
  if (!card) {
    return null;
  }

  // カードがめくれていない場合はカードの裏面を表示
  if (isFaceDown) {
    return (
      <CardContainer isFaceDown={true} isDisabled={isDisabled} onClick={onClick}>
        <CardBack />
      </CardContainer>
    );
  }

  // カード色の設定（ハートとダイヤは赤、スペードとクラブは黒）
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  
  // スートのHTMLエンティティを取得
  const getSuitEntity = () => {
    switch(card.suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };
  
  // カードの数字を表示用に変換
  const getRankDisplay = () => {
    if (card.rank === 1) return 'A';
    if (card.rank === 11) return 'J';
    if (card.rank === 12) return 'Q';
    if (card.rank === 13) return 'K';
    return card.rank.toString();
  };

  return (
    <CardContainer 
      isRed={isRed} 
      isSelected={isSelected} 
      onClick={onClick}
      isDisabled={isDisabled}
      isSeven={card.rank === 7}
    >
      <CardCorner position="top-left">
        <Rank>{getRankDisplay()}</Rank>
        <Suit>{getSuitEntity()}</Suit>
      </CardCorner>
      
      <CardCenter>
        <CenterSuit>{getSuitEntity()}</CenterSuit>
      </CardCenter>
      
      <CardCorner position="bottom-right">
        <Rank>{getRankDisplay()}</Rank>
        <Suit>{getSuitEntity()}</Suit>
      </CardCorner>
    </CardContainer>
  );
}

// スタイル付きコンポーネント
const CardContainer = styled.div`
  position: relative;
  width: 80px;
  height: 112px;
  border-radius: 8px;
  background-color: white;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 5px;
  cursor: ${props => props.isDisabled ? 'not-allowed' : 'pointer'};
  transition: transform 0.2s, box-shadow 0.2s;
  color: ${props => props.isRed ? 'red' : 'black'};
  transform: ${props => props.isSelected ? 'translateY(-10px)' : 'none'};
  opacity: ${props => props.isDisabled ? 0.6 : 1};
  
  ${props => props.isFaceDown && `
    background: linear-gradient(45deg, #006400, #8bc34a);
    color: transparent;
  `}
  
  /* 7のカードだけ特別なスタイル */
  ${props => props.isSeven && `
    background-color: rgba(139, 195, 74, 0.1);
    border: 1px solid var(--primary-color);
  `}
  
  &:hover {
    ${props => !props.isDisabled && `
      transform: ${props.isSelected ? 'translateY(-15px)' : 'translateY(-5px)'};
      box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
      z-index: 10;
    `}
  }
  
  @media (max-width: 768px) {
    width: 60px;
    height: 84px;
    padding: 3px;
  }
`;

const CardCorner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.position === 'top-left' ? 'flex-start' : 'flex-end'};
  transform: ${props => props.position === 'bottom-right' ? 'rotate(180deg)' : 'none'};
`;

const Rank = styled.span`
  font-size: 1.2rem;
  font-weight: bold;
  line-height: 1;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const Suit = styled.span`
  font-size: 1.2rem;
  line-height: 1;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const CardCenter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
`;

const CenterSuit = styled.span`
  font-size: 2rem;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const CardBack = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 6px;
  background: repeating-linear-gradient(
    45deg,
    #006400,
    #006400 10px,
    #8bc34a 10px,
    #8bc34a 20px
  );
`;

export default Card; 