import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  ScrollContainer,
  ContentContainer,
  LogoContainer,
  LogoImage,
  LogoText,
  FormCard,
  InputContainer,
  InputLabel,
  Input,
  InputError,
  Button,
  Text,
  Link,
  LoadingSpinner,
  OrDivider
} from './components/ui';
import { login } from './services/api';
import { createLoginRequest, validateEmail } from './types';

const Login = ({ onSuccess, goToRegister }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요. (예: user@example.com)';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await login(createLoginRequest(
        formData.email.trim(),
        formData.password
      ));

      console.log('Login successful:', response);

      // Success callback or navigation
      if (onSuccess) {
        onSuccess(response);
      } else {
        navigate('/', { replace: true });
      }

    } catch (error) {
      console.error('Login error:', error);

      if (error.status === 401) {
        setErrors({
          general: '이메일 또는 비밀번호가 잘못되었습니다.'
        });
      } else if (error.status >= 500) {
        setErrors({
          general: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        });
      } else {
        setErrors({
          general: '로그인에 실패했습니다. 다시 시도해주세요.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    if (goToRegister) {
      goToRegister();
    } else {
      navigate('/register');
    }
  };

  return (
    <Container>
      <ScrollContainer>
        <ContentContainer>
          <LogoContainer>
            <LogoImage
              src="/assets/bapful_logo.png"
              alt="Bapful Logo"
              onError={(e) => {
                // Fallback if image doesn't exist
                e.target.style.display = 'none';
              }}
            />
            <LogoText>밥풀</LogoText>
            <Text size="18px" color="#666666" align="center">
              Welcome, find your soul food!
            </Text>
          </LogoContainer>

          <FormCard onSubmit={handleSubmit}>
            <InputContainer>
              <InputLabel htmlFor="email">이메일</InputLabel>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!errors.email}
                disabled={loading}
                autoComplete="email"
              />
              {errors.email && <InputError>{errors.email}</InputError>}
            </InputContainer>

            <InputContainer>
              <InputLabel htmlFor="password">비밀번호</InputLabel>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={!!errors.password}
                disabled={loading}
                autoComplete="current-password"
              />
              {errors.password && <InputError>{errors.password}</InputError>}
            </InputContainer>

            {errors.general && (
              <Text color="#FF4444" align="center" size="14px">
                {errors.general}
              </Text>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? <LoadingSpinner /> : '로그인'}
            </Button>

            <OrDivider>
              <span>또는</span>
            </OrDivider>

            <Text align="center" size="14px" color="#666666">
              계정이 없으신가요?{' '}
              <Link onClick={handleRegisterClick}>
                회원가입
              </Link>
            </Text>
          </FormCard>
        </ContentContainer>
      </ScrollContainer>
    </Container>
  );
};

export default Login;
