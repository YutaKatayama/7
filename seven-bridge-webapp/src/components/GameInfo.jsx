import React from 'react';
import styled from 'styled-components';

function GameInfo({ players, currentPlayerIndex }) {
  if (!players || players.length === 0) {
    return null;
  }
  
  return (
    <GameInfoContainer>
      <InfoTitle>プレイヤー情報</InfoTitle>
      
      <PlayersList>
        {players.map((player, index) => (
          <PlayerItem 
            key={player.id} 
            isCurrentPlayer={index === currentPlayerIndex}
            isHuman={!player.isAI}
          >
            <PlayerName>
              {player.name}
              {index === currentPlayerIndex && <CurrentMark>★</CurrentMark>}
            </PlayerName>
            
            <PlayerStats>
              <Stat>
                <StatLabel>手札:</StatLabel>
                <StatValue>{player.handCount}枚</StatValue>
              </Stat>
              
              <Stat>
                <StatLabel>メルド:</StatLabel>
                <StatValue>{player.melds.length}個</StatValue>
              </Stat>
            </PlayerStats>
          </PlayerItem>
        ))}
      </PlayersList>
      
      <TurnIndicator>
        <TurnLabel>現在の番:</TurnLabel>
        <TurnValue>{players[currentPlayerIndex].name}</TurnValue>
      </TurnIndicator>
    </GameInfoContainer>
  );
}

// スタイル付きコンポーネント
const GameInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 1rem;
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow-color);
`;

const InfoTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--primary-color);
`;

const PlayersList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
`;

const PlayerItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  background-color: ${props => props.isCurrentPlayer 
    ? 'rgba(0, 100, 0, 0.1)' 
    : 'transparent'
  };
  border-left: 3px solid ${props => props.isCurrentPlayer 
    ? 'var(--primary-color)' 
    : 'transparent'
  };
  font-weight: ${props => props.isCurrentPlayer ? '600' : '400'};
`;

const PlayerName = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CurrentMark = styled.span`
  color: var(--primary-color);
`;

const PlayerStats = styled.div`
  display: flex;
  gap: 1rem;
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatLabel = styled.span`
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.8;
`;

const StatValue = styled.span`
  font-weight: 600;
`;

const TurnIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: var(--primary-color);
  color: white;
  padding: 0.6rem;
  border-radius: 4px;
`;

const TurnLabel = styled.span`
  font-size: 0.9rem;
`;

const TurnValue = styled.span`
  font-weight: 600;
  font-size: 1.1rem;
`;

export default GameInfo; 