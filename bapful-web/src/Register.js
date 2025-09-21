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
import { register } from './services/api';
import { createRegisterRequest, validateEmail, validatePassword, validateName } from './types';

const Register = ({ onSuccess, goToLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!validateName(formData.name)) {
      if (!formData.name.trim()) {
        newErrors.name = '이름을 입력해주세요.';
      } else {
        newErrors.name = '이름은 2글자 이상 입력해주세요.';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요. (예: user@example.com)';
    }

    if (!validatePassword(formData.password)) {
      if (!formData.password) {
        newErrors.password = '비밀번호를 입력해주세요.';
      } else {
        newErrors.password = '비밀번호는 6글자 이상 입력해주세요.';
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
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

    // Clear confirm password error if password changes
    if (field === 'password' && errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await register(createRegisterRequest(
        formData.email.trim(),
        formData.password,
        formData.name.trim()
      ));

      console.log('Registration successful:', response);

      // Success callback or navigation
      if (onSuccess) {
        onSuccess(response);
      } else {
        navigate('/', { replace: true });
      }

    } catch (error) {
      console.error('Registration error:', error);

      if (error.status === 409) {
        setErrors({
          email: '이미 사용중인 이메일입니다.'
        });
      } else if (error.status >= 500) {
        setErrors({
          general: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        });
      } else {
        setErrors({
          general: '회원가입에 실패했습니다. 다시 시도해주세요.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    if (goToLogin) {
      goToLogin();
    } else {
      navigate('/login');
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
              Create Account - find your soul food!
            </Text>
          </LogoContainer>

          <FormCard onSubmit={handleSubmit}>
            <InputContainer>
              <InputLabel htmlFor="name">이름</InputLabel>
              <Input
                id="name"
                type="text"
                placeholder="이름을 입력하세요"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                disabled={loading}
                autoComplete="name"
              />
              {errors.name && <InputError>{errors.name}</InputError>}
            </InputContainer>

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
                placeholder="비밀번호를 입력하세요 (6글자 이상)"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={!!errors.password}
                disabled={loading}
                autoComplete="new-password"
              />
              {errors.password && <InputError>{errors.password}</InputError>}
            </InputContainer>

            <InputContainer>
              <InputLabel htmlFor="confirmPassword">비밀번호 확인</InputLabel>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                error={!!errors.confirmPassword}
                disabled={loading}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <InputError>{errors.confirmPassword}</InputError>}
            </InputContainer>

            {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <Text color="#FFA726" size="12px" align="center">
                비밀번호가 일치하지 않습니다.
              </Text>
            )}

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
              {loading ? <LoadingSpinner /> : '회원가입'}
            </Button>

            <OrDivider>
              <span>또는</span>
            </OrDivider>

            <Text align="center" size="14px" color="#666666">
              이미 계정이 있으신가요?{' '}
              <Link onClick={handleLoginClick}>
                로그인
              </Link>
            </Text>
          </FormCard>
        </ContentContainer>
      </ScrollContainer>
    </Container>
  );
};

export default Register;
