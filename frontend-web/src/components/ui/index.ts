import styled from 'styled-components';
import { colors } from '../../styles/colors';

/* ---------------- Layout Components ---------------- */
export const Container = styled.div`
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
  min-height: 100vh;
  background: ${colors.background.primary};
  position: relative;
  overflow-x: hidden;
`;

export const ScrollContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
`;

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px;
  width: 100%;
  box-sizing: border-box;
`;

/* ---------------- Card Components ---------------- */
export const Card = styled.div`
  background: ${colors.background.card};
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const FormCard = styled(Card)`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

/* ---------------- Button Components ---------------- */
export const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'outline'; fullWidth?: boolean; disabled?: boolean }>`
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  box-sizing: border-box;
  
  ${props => {
    switch (props.variant) {
      case 'secondary':
        return `
          background: ${colors.background.secondary};
          color: ${colors.text.primary};
          &:hover {
            background: ${colors.ui.hover};
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: ${colors.primary.main};
          border: 2px solid ${colors.primary.main};
          &:hover {
            background: ${colors.primary.main};
            color: white;
          }
        `;
      default: // primary
        return `
          background: ${colors.primary.gradient};
          color: white;
          &:hover {
            background: ${colors.primary.dark};
          }
        `;
    }
  }}
  
  ${props => props.disabled && `
    opacity: 0.6;
    cursor: not-allowed;
    &:hover {
      background: ${props.variant === 'primary' ? colors.primary.gradient : colors.background.secondary};
    }
  `}
  
  &:active {
    transform: translateY(1px);
  }
`;

export const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: ${colors.text.secondary};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${colors.ui.hover};
    color: ${colors.text.primary};
  }
`;

/* ---------------- Input Components ---------------- */
export const Input = styled.input<{ error?: boolean }>`
  width: 100%;
  padding: 16px;
  border: 2px solid ${props => props.error ? colors.error : colors.ui.border};
  border-radius: 12px;
  font-size: 16px;
  background: ${colors.background.input};
  color: ${colors.text.primary};
  box-sizing: border-box;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? colors.error : colors.primary.main};
    box-shadow: 0 0 0 3px ${props => props.error ? 'rgba(220, 53, 69, 0.1)' : 'rgba(255, 107, 53, 0.1)'};
  }
  
  &::placeholder {
    color: ${colors.text.placeholder};
  }
  
  &:disabled {
    background: ${colors.ui.disabled};
    cursor: not-allowed;
  }
`;

export const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

export const InputLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.text.primary};
  margin-left: 4px;
`;

export const InputError = styled.span`
  font-size: 12px;
  color: ${colors.error};
  margin-left: 4px;
`;

/* ---------------- Text Components ---------------- */
export const Title = styled.h1`
  font-size: 28px;
  font-weight: bold;
  color: ${colors.text.primary};
  text-align: center;
  margin: 24px 0 8px 0;
`;

export const Subtitle = styled.p`
  font-size: 16px;
  color: ${colors.text.secondary};
  text-align: center;
  margin: 0 0 32px 0;
  line-height: 1.5;
`;

export const Text = styled.p<{ color?: string; size?: string; weight?: string; align?: string }>`
  color: ${props => props.color || colors.text.primary};
  font-size: ${props => props.size || '14px'};
  font-weight: ${props => props.weight || 'normal'};
  text-align: ${props => props.align || 'left'};
  margin: 0;
  line-height: 1.5;
`;

export const Link = styled.a`
  color: ${colors.primary.main};
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${colors.primary.dark};
    text-decoration: underline;
  }
`;

/* ---------------- Logo Components ---------------- */
export const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 40px 0 20px 0;
`;

export const LogoImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: contain;
  margin-bottom: 16px;
`;

export const LogoText = styled.h1`
  font-size: 32px;
  font-weight: bold;
  color: ${colors.primary.main};
  margin: 0;
  text-align: center;
`;

/* ---------------- Loading Components ---------------- */
export const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid ${colors.ui.border};
  border-top: 3px solid ${colors.primary.main};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

/* ---------------- Modal Components ---------------- */
export const ModalOverlay = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: ${colors.background.card};
  border-radius: 16px;
  padding: 24px;
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
  position: relative;
`;

/* ---------------- Divider Components ---------------- */
export const Divider = styled.div<{ margin?: string }>`
  width: 100%;
  height: 1px;
  background: ${colors.ui.border};
  margin: ${props => props.margin || '16px 0'};
`;

export const OrDivider = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${colors.ui.border};
  }
  
  span {
    padding: 0 16px;
    color: ${colors.text.secondary};
    font-size: 14px;
  }
`;