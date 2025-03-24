import React from 'react';
import styled from 'styled-components';

function GameOverScreen({ gameResult, onPlayAgain }) {
  if (!gameResult) {
    return null;
  }

  const { winnerIndex, winner, scores } = gameResult;
  
  // 勝利プレイヤーが自分（インデックス0）かどうか
  const isPlayerWinner = winnerIndex === 0;

  return (
    <GameOverContainer>
      <ResultPanel>
        <Title>{isPlayerWinner ? '勝利！' : '残念...'}</Title>
        
        <ResultMessage>
          {isPlayerWinner 
            ? 'おめでとうございます！あなたの勝利です。'
            : `${winner.name}の勝利です。`
          }
        </ResultMessage>
        
        <ConfettiAnimation isWinner={isPlayerWinner}>
          {isPlayerWinner && Array(20).fill().map((_, i) => (
            <Confetti key={i} delay={i * 0.1} />
          ))}
        </ConfettiAnimation>
        
        <ScoreBoard>
          <ScoreTitle>ゲーム結果</ScoreTitle>
          <ScoreTable>
            <thead>
              <tr>
                <TableHeader>プレイヤー</TableHeader>
                <TableHeader>残りポイント</TableHeader>
                <TableHeader>結果</TableHeader>
              </tr>
            </thead>
            <tbody>
              {scores.map((score, index) => (
                <ScoreRow key={index} isWinner={score.isWinner}>
                  <TableData>{score.name}</TableData>
                  <TableData>{score.points}</TableData>
                  <TableData>
                    {score.isWinner 
                      ? <WinnerMark>勝者</WinnerMark>
                      : `${score.points}点`
                    }
                  </TableData>
                </ScoreRow>
              ))}
            </tbody>
          </ScoreTable>
        </ScoreBoard>
        
        <ButtonContainer>
          <PlayAgainButton onClick={onPlayAgain}>
            もう一度プレイ
          </PlayAgainButton>
        </ButtonContainer>
      </ResultPanel>
    </GameOverContainer>
  );
}

// スタイル付きコンポーネント
const GameOverContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 2rem;
  background-color: rgba(0, 0, 0, 0.3);
`;

const ResultPanel = styled.div`
  width: 100%;
  max-width: 600px;
  background-color: var(--card-background);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  color: var(--primary-color);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const ResultMessage = styled.p`
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const ConfettiAnimation = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  display: ${props => props.isWinner ? 'block' : 'none'};
`;

const Confetti = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: ${() => {
    const colors = ['#FFC700', '#FF0000', '#2E3191', '#009245', '#FF7BAC'];
    return colors[Math.floor(Math.random() * colors.length)];
  }};
  border-radius: ${() => Math.random() > 0.5 ? '50%' : '0'};
  top: -10px;
  left: ${() => `${Math.random() * 100}%`};
  opacity: ${() => Math.random() * 0.8 + 0.2};
  animation: fall 3s linear infinite;
  animation-delay: ${props => `${props.delay}s`};
  
  @keyframes fall {
    0% {
      top: -10px;
      transform: translateX(0) rotate(0deg);
    }
    100% {
      top: 100%;
      transform: translateX(${() => (Math.random() - 0.5) * 200}px) rotate(${() => Math.random() * 360}deg);
    }
  }
`;

const ScoreBoard = styled.div`
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
`;

const ScoreTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
  color: var(--primary-color);
`;

const ScoreTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
`;

const TableHeader = styled.th`
  padding: 0.8rem;
  text-align: left;
  border-bottom: 2px solid var(--border-color);
  font-weight: 600;
`;

const ScoreRow = styled.tr`
  background-color: ${props => props.isWinner ? 'rgba(0, 100, 0, 0.1)' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.isWinner ? 'rgba(0, 100, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)'};
  }
`;

const TableData = styled.td`
  padding: 0.8rem;
  border-bottom: 1px solid var(--border-color);
`;

const WinnerMark = styled.span`
  display: inline-block;
  background-color: var(--primary-color);
  color: white;
  font-weight: bold;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const ButtonContainer = styled.div`
  text-align: center;
  position: relative;
  z-index: 2;
`;

const PlayAgainButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  font-size: 1.2rem;
  padding: 1rem 2rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: var(--secondary-color);
  }
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    padding: 0.8rem 1.5rem;
  }
`;

export default GameOverScreen; 