import React from 'react';
import styled from 'styled-components';

function TitleScreen({ onStartGame, onSettings }) {
  return (
    <TitleContainer>
      <Title>セブンブリッジ</Title>
      <Subtitle>楽しいカードゲーム</Subtitle>
      
      <LogoContainer>
        <Logo>
          <span className="heart">♥</span>
          <span className="spade">♠</span>
          <span className="diamond">♦</span>
          <span className="club">♣</span>
          <span className="seven">7</span>
        </Logo>
      </LogoContainer>
      
      <ButtonContainer>
        <PrimaryButton onClick={onStartGame}>
          ゲームスタート
        </PrimaryButton>
        
        <SecondaryButton onClick={onSettings}>
          設定
        </SecondaryButton>
      </ButtonContainer>
      
      <RulesContainer>
        <RulesTitle>ゲームルール</RulesTitle>
        <RulesList>
          <RuleItem>各プレイヤーは7枚のカードを配られます</RuleItem>
          <RuleItem>目標は自分の手札を全て出すことです</RuleItem>
          <RuleItem>「7」のカードは単独で場に出せます</RuleItem>
          <RuleItem>「6と7」または「7と8」のカードペアも場に出せます</RuleItem>
          <RuleItem>同じスートの3枚以上の連続したカード（例：♥3-4-5）を出せます</RuleItem>
          <RuleItem>同じ数字の3枚以上のカード（例：♥7-♦7-♣7）を出せます</RuleItem>
          <RuleItem>「ポン」：他の人が捨てたカードを同じ数字の2枚と合わせて取得できる</RuleItem>
          <RuleItem>「チー」：次の順番のプレイヤーは、捨て札を使って3枚の連続を作れる</RuleItem>
        </RulesList>
      </RulesContainer>
      
      <Footer>
        <FooterText>© 2023 セブンブリッジゲーム</FooterText>
        <FooterText>バージョン 1.0.0</FooterText>
      </Footer>
    </TitleContainer>
  );
}

// スタイル付きコンポーネント
const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  padding: 2rem 1rem;
  overflow-y: auto;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  color: var(--text-color);
  margin-bottom: 2rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
`;

const Logo = styled.div`
  font-size: 4rem;
  position: relative;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .heart, .spade, .diamond, .club {
    position: absolute;
    opacity: 0.5;
    font-size: 3rem;
  }
  
  .heart {
    color: red;
    top: 20px;
    left: 20px;
  }
  
  .spade {
    color: black;
    top: 20px;
    right: 20px;
  }
  
  .diamond {
    color: red;
    bottom: 20px;
    left: 20px;
  }
  
  .club {
    color: black;
    bottom: 20px;
    right: 20px;
  }
  
  .seven {
    font-size: 6rem;
    font-weight: bold;
    color: var(--primary-color);
    z-index: 2;
  }
  
  @media (max-width: 768px) {
    width: 150px;
    height: 150px;
    
    .heart, .spade, .diamond, .club {
      font-size: 2.5rem;
    }
    
    .seven {
      font-size: 4rem;
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 300px;
`;

const PrimaryButton = styled.button`
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

const SecondaryButton = styled.button`
  background-color: transparent;
  color: var(--primary-color);
  font-size: 1.2rem;
  padding: 1rem 2rem;
  border-radius: 8px;
  border: 2px solid var(--primary-color);
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: var(--primary-color);
    color: white;
  }
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    padding: 0.8rem 1.5rem;
  }
`;

const RulesContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin-bottom: 2rem;
  background-color: var(--card-background);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 8px var(--shadow-color);
`;

const RulesTitle = styled.h3`
  font-size: 1.5rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
  text-align: center;
`;

const RulesList = styled.ul`
  list-style-position: inside;
  padding-left: 0;
`;

const RuleItem = styled.li`
  margin-bottom: 0.5rem;
  line-height: 1.5;
`;

const Footer = styled.footer`
  margin-top: auto;
  width: 100%;
  text-align: center;
  padding: 1rem 0;
`;

const FooterText = styled.p`
  color: var(--text-color);
  opacity: 0.7;
  font-size: 0.9rem;
  margin: 0.2rem 0;
`;

export default TitleScreen; 