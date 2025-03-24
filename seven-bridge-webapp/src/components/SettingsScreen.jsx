import React, { useState } from 'react';
import styled from 'styled-components';

function SettingsScreen({ initialSettings, onSave, onCancel }) {
  const [settings, setSettings] = useState({
    playerCount: initialSettings.playerCount || 4,
    aiDifficulty: initialSettings.aiDifficulty || 2,
    playerName: initialSettings.playerName || 'プレイヤー'
  });

  // 入力変更ハンドラ
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // 数値入力の場合は整数に変換
    if (name === 'playerCount' || name === 'aiDifficulty') {
      setSettings(prev => ({
        ...prev,
        [name]: parseInt(value, 10)
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // 設定保存ハンドラ
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(settings);
  };

  return (
    <SettingsContainer>
      <Title>ゲーム設定</Title>
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="playerName">プレイヤー名</Label>
          <Input
            type="text"
            id="playerName"
            name="playerName"
            value={settings.playerName}
            onChange={handleChange}
            maxLength={10}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="playerCount">プレイヤー数 (2-6)</Label>
          <RangeContainer>
            <RangeInput
              type="range"
              id="playerCount"
              name="playerCount"
              min="2"
              max="6"
              value={settings.playerCount}
              onChange={handleChange}
            />
            <RangeValue>{settings.playerCount}</RangeValue>
          </RangeContainer>
          <HelpText>自分を含めた合計プレイヤー数</HelpText>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="aiDifficulty">AI難易度</Label>
          <RadioGroup>
            <RadioLabel>
              <RadioInput
                type="radio"
                name="aiDifficulty"
                value="1"
                checked={settings.aiDifficulty === 1}
                onChange={handleChange}
              />
              簡単
            </RadioLabel>
            
            <RadioLabel>
              <RadioInput
                type="radio"
                name="aiDifficulty"
                value="2"
                checked={settings.aiDifficulty === 2}
                onChange={handleChange}
              />
              普通
            </RadioLabel>
            
            <RadioLabel>
              <RadioInput
                type="radio"
                name="aiDifficulty"
                value="3"
                checked={settings.aiDifficulty === 3}
                onChange={handleChange}
              />
              難しい
            </RadioLabel>
          </RadioGroup>
        </FormGroup>
        
        <ButtonGroup>
          <SaveButton type="submit">保存</SaveButton>
          <CancelButton type="button" onClick={onCancel}>キャンセル</CancelButton>
        </ButtonGroup>
      </Form>
      
      <SettingsInfo>
        <InfoTitle>ゲーム設定について</InfoTitle>
        <InfoText>
          <p><strong>プレイヤー数:</strong> 自分を含めた参加者の数を設定します。最小2人、最大6人まで設定できます。</p>
          <p><strong>AI難易度:</strong> コンピュータプレイヤーの強さを設定します。</p>
          <ul>
            <li><strong>簡単:</strong> 初心者向け。AIは基本的な戦略のみを使用します。</li>
            <li><strong>普通:</strong> 中級者向け。AIはより賢く行動します。</li>
            <li><strong>難しい:</strong> 上級者向け。AIは最適な戦略を使用します。</li>
          </ul>
        </InfoText>
      </SettingsInfo>
    </SettingsContainer>
  );
}

// スタイル付きコンポーネント
const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 2rem 1rem;
  overflow-y: auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 2rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }
`;

const Form = styled.form`
  width: 100%;
  max-width: 500px;
  background-color: var(--card-background);
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 8px var(--shadow-color);
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  font-size: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const RangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const RangeInput = styled.input`
  flex: 1;
  appearance: none;
  height: 8px;
  background-color: var(--border-color);
  border-radius: 4px;
  outline: none;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    background-color: var(--primary-color);
    border-radius: 50%;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background-color: var(--primary-color);
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
`;

const RangeValue = styled.span`
  font-size: 1.2rem;
  font-weight: 600;
  min-width: 30px;
  text-align: center;
`;

const HelpText = styled.p`
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.7;
  margin-top: 0.5rem;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
`;

const RadioInput = styled.input`
  cursor: pointer;
  
  &:checked {
    accent-color: var(--primary-color);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.8rem;
  }
`;

const SaveButton = styled.button`
  flex: 1;
  background-color: var(--primary-color);
  color: white;
  font-size: 1.1rem;
  padding: 0.8rem 0;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: var(--secondary-color);
  }
`;

const CancelButton = styled.button`
  flex: 1;
  background-color: transparent;
  color: var(--primary-color);
  font-size: 1.1rem;
  padding: 0.8rem 0;
  border-radius: 4px;
  border: 1px solid var(--primary-color);
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: var(--border-color);
  }
`;

const SettingsInfo = styled.div`
  width: 100%;
  max-width: 500px;
  background-color: var(--card-background);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 8px var(--shadow-color);
`;

const InfoTitle = styled.h3`
  font-size: 1.2rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
`;

const InfoText = styled.div`
  font-size: 0.95rem;
  line-height: 1.5;
  
  p {
    margin-bottom: 1rem;
  }
  
  ul {
    padding-left: 1.5rem;
    margin-bottom: 1rem;
  }
  
  li {
    margin-bottom: 0.5rem;
  }
`;

export default SettingsScreen; 