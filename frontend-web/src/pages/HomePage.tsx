import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  ScrollContainer,
  ContentContainer,
  Card,
  Button,
  Title,
  Text,
  LogoContainer,
  LogoImage,
  LoadingContainer,
  LoadingSpinner
} from '../components/ui';
import { logout, getCurrentUser, isAuthenticated } from '../services/api';
import { User } from '../types';
import { colors } from '../styles/colors';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        navigate('/login', { replace: true });
        return;
      }
      
      const currentUser = getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even on error
      navigate('/login', { replace: true });
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <ScrollContainer>
        <ContentContainer>
          <LogoContainer>
            <LogoImage 
              src="/assets/bapful_logo.png" 
              alt="Bapful Logo"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <Title>밥풀</Title>
            <Text size="16px" color={colors.text.secondary} align="center">
              당신의 소울푸드를 찾아보세요!
            </Text>
          </LogoContainer>

          <Card>
            <Text size="18px" weight="600" color={colors.text.primary} align="center">
              환영합니다, {user?.name}님!
            </Text>
            <Text size="14px" color={colors.text.secondary} align="center" style={{ marginTop: '8px' }}>
              {user?.email}
            </Text>
          </Card>

          <Card>
            <Text size="16px" weight="600" color={colors.text.primary}>
              🍽️ 맛집 찾기
            </Text>
            <Text size="14px" color={colors.text.secondary} style={{ marginTop: '8px' }}>
              주변 맛집을 추천받아보세요
            </Text>
            <Button 
              variant="outline" 
              fullWidth 
              style={{ marginTop: '16px' }}
              onClick={() => {
                // TODO: Navigate to recommendation page
                alert('추천 기능은 추후 구현 예정입니다.');
              }}
            >
              맛집 추천받기
            </Button>
          </Card>

          <Card>
            <Text size="16px" weight="600" color={colors.text.primary}>
              📍 장소 검색
            </Text>
            <Text size="14px" color={colors.text.secondary} style={{ marginTop: '8px' }}>
              원하는 음식점을 직접 검색해보세요
            </Text>
            <Button 
              variant="outline" 
              fullWidth 
              style={{ marginTop: '16px' }}
              onClick={() => {
                // TODO: Navigate to search page
                alert('검색 기능은 추후 구현 예정입니다.');
              }}
            >
              장소 검색하기
            </Button>
          </Card>

          <Card>
            <Text size="16px" weight="600" color={colors.text.primary}>
              ⭐ 내 리뷰
            </Text>
            <Text size="14px" color={colors.text.secondary} style={{ marginTop: '8px' }}>
              작성한 리뷰를 확인하고 관리하세요
            </Text>
            <Button 
              variant="outline" 
              fullWidth 
              style={{ marginTop: '16px' }}
              onClick={() => {
                // TODO: Navigate to reviews page
                alert('리뷰 관리 기능은 추후 구현 예정입니다.');
              }}
            >
              내 리뷰 보기
            </Button>
          </Card>

          <Card style={{ marginTop: '24px' }}>
            <Button 
              variant="secondary" 
              fullWidth 
              onClick={handleLogout}
            >
              로그아웃
            </Button>
          </Card>
        </ContentContainer>
      </ScrollContainer>
    </Container>
  );
};

export default HomePage;