import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Card from './Card';

function PonChiOptions({ 
  isVisible, 
  card, 
  canPon, 
  canChi, 
  onPon, 
  onChi, 
  onSkip,
  timeLimit = 3 
}) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  
  // タイマーの管理
  useEffect(() => {
    if (!isVisible) {
      setTimeLeft(timeLimit);
      return;
    }
    
    // タイマーをセット
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onSkip();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isVisible, timeLimit, onSkip]);
  
  if (!isVisible || !card) {
    return null;
  }
  
  return (
    <OptionsContainer>
      <Overlay>
        <OptionsPanel>
          <Title>アクション選択</Title>
          
          <CardSection>
            <CardLabel>捨てられたカード:</CardLabel>
            <Card card={card} />
          </CardSection>
          
          <PromptText>このカードでアクションを選んでください</PromptText>
          
          <ButtonsContainer>
            {canPon && (
              <ActionButton 
                onClick={onPon}
                isPrimary={true}
              >
                ポン<br/>
                <ButtonDescription>同じ数字の2枚と合わせて取る</ButtonDescription>
              </ActionButton>
            )}
            
            {canChi && (
              <ActionButton 
                onClick={onChi}
                isPrimary={true}
              >
                チー<br/>
                <ButtonDescription>連続した数字のカードと組み合わせる</ButtonDescription>
              </ActionButton>
            )}
            
            <ActionButton onClick={onSkip}>
              スキップ<br/>
              <ButtonDescription>何もしない</ButtonDescription>
            </ActionButton>
          </ButtonsContainer>
          
          <TimerBar>
            <TimerProgress time={timeLeft} total={timeLimit} />
          </TimerBar>
          <TimerText>{timeLeft}秒</TimerText>
        </OptionsPanel>
      </Overlay>
    </OptionsContainer>
  );
}

// スタイル付きコンポーネント
const OptionsContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
`;

const Overlay = styled.div`
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const OptionsPanel = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  text-align: center;
`;

const CardSection = styled.div`
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CardLabel = styled.p`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
`;

const PromptText = styled.p`
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: var(--text-color);
  text-align: center;
  font-weight: 600;
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  margin-bottom: 1.5rem;
`;

const ActionButton = styled.button`
  padding: 1rem;
  background-color: ${props => props.isPrimary ? 'var(--primary-color)' : 'white'};
  color: ${props => props.isPrimary ? 'white' : 'var(--text-color)'};
  border: 1px solid ${props => props.isPrimary ? 'var(--primary-color)' : 'var(--border-color)'};
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: ${props => props.isPrimary ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.isPrimary ? 'var(--secondary-color)' : 'rgba(0, 0, 0, 0.05)'};
    transform: translateY(-2px);
  }
`;

const ButtonDescription = styled.span`
  font-size: 0.9rem;
  font-weight: normal;
  opacity: 0.8;
`;

const TimerBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const TimerProgress = styled.div`
  height: 100%;
  width: ${props => (props.time / props.total) * 100}%;
  background-color: var(--primary-color);
  transition: width 1s linear;
`;

const TimerText = styled.p`
  font-size: 1rem;
  color: var(--text-color);
  text-align: center;
`;

export default PonChiOptions; 