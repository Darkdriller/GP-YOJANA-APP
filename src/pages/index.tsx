import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { AppBar, Toolbar, Button, Container, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { styled } from '@mui/material/styles';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useLanguage } from '../context/LanguageContext';

// Styled components
const StyledAppBar = styled(AppBar)({
  backgroundColor: '#f0f7ff', // Light blue color
  boxShadow: 'none',
  position: 'relative',
});

const NavButton = styled(Button)({
  color: '#1a365d', // Dark navy blue
  textTransform: 'none',
  padding: '8px 16px',
  '&:hover': {
    backgroundColor: 'rgba(26, 54, 93, 0.1)',
  },
});

const AuthButton = styled(Button)({
  backgroundColor: '#1a365d',
  color: 'white',
  padding: '8px 24px',
  '&:hover': {
    backgroundColor: '#142844',
  },
});

const LanguageToggle = styled(ToggleButtonGroup)({
  margin: '0 16px',
  '& .MuiToggleButton-root': {
    color: '#1a365d',
    borderColor: '#1a365d',
    '&.Mui-selected': {
      backgroundColor: '#1a365d',
      color: 'white',
      '&:hover': {
        backgroundColor: '#142844',
      },
    },
  },
});

const DepartmentTitle = styled(Typography)({
  color: '#1a365d',
  fontWeight: 600,
  fontSize: '1.25rem',
  lineHeight: 1.4,
});

const DepartmentSubtitle = styled(Typography)({
  color: '#1a365d',
  fontSize: '0.875rem',
  lineHeight: 1.4,
});

export default function Home() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const user = null; // Replace with your actual auth logic
  const { language, setLanguage, t } = useLanguage();
  const [authDialog, setAuthDialog] = useState({ open: false, isLogin: true });

  useEffect(() => {
    if (user) {
      router.push('/home');
    }
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, [user, router]);

  const handleLanguageChange = (event, newLanguage) => {
    if (newLanguage !== null) {
      setLanguage(newLanguage);
    }
  };

  const openAuthDialog = (isLogin) => {
    setAuthDialog({ open: true, isLogin });
  };

  const closeAuthDialog = () => {
    setAuthDialog({ ...authDialog, open: false });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <StyledAppBar>
        <Container maxWidth="xl">
          <Toolbar className="px-0">
            <div className="flex items-center flex-1">
              {/* Logo and Department Name */}
              <div className="flex items-center gap-4">
                <Image
                  src="/images/Seal_of_Odisha.png"
                  alt="Seal of Odisha"
                  width={60}
                  height={60}
                  className="object-contain"
                />
                <div className="flex flex-col">
                  <DepartmentTitle>
                    {t('dept.name')}
                  </DepartmentTitle>
                  <DepartmentSubtitle>
                    {t('dept.govt')}
                  </DepartmentSubtitle>
                </div>
              </div>

              {/* Navigation and Auth */}
              <div className="flex items-center ml-auto gap-4">
                <Link href="/" passHref legacyBehavior>
                  <NavButton component="a">{t('nav.home')}</NavButton>
                </Link>
                <Link href="/about" passHref legacyBehavior>
                  <NavButton component="a">{t('nav.about')}</NavButton>
                </Link>
                <Link href="/programme" passHref legacyBehavior>
                  <NavButton component="a">{t('nav.programme')}</NavButton>
                </Link>
                <Link href="/projects" passHref legacyBehavior>
                  <NavButton component="a">{t('nav.projects')}</NavButton>
                </Link>

                {/* Language Toggle */}
                <LanguageToggle
                  value={language}
                  exclusive
                  onChange={handleLanguageChange}
                  aria-label="language"
                  size="small"
                >
                  <ToggleButton value="en">
                    ENG
                  </ToggleButton>
                  <ToggleButton value="od">
                    ଓଡ଼ିଆ
                  </ToggleButton>
                </LanguageToggle>

                {/* Auth Buttons */}
                <div className="flex gap-2">
                  <Link href="/signup" passHref legacyBehavior>
                    <AuthButton 
                      component="a"
                      variant="contained"
                    >
                      {t('auth.signup')}
                    </AuthButton>
                  </Link>
                  <Link href="/login" passHref legacyBehavior>
                    <AuthButton 
                      component="a"
                      variant="contained"
                    >
                      {t('auth.login')}
                    </AuthButton>
                  </Link>
                </div>
              </div>
            </div>
          </Toolbar>
        </Container>
      </StyledAppBar>

      {/* Main Content with 70/30 Split */}
      <div className="flex flex-1">
        {/* Left side - Image (70%) */}
        <div className="w-[70%] relative">
          <Image
            src="/images/Cover page.jpg"
            layout="fill"
            objectFit="cover"
            quality={100}
            alt="Background"
            className="z-0"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-black/20 to-black/30 z-10" />
        </div>

        {/* Right side - Content (30%) */}
        <div className="w-[30%] bg-white p-8 overflow-y-auto">
          <div className={`transition-all duration-1000 ease-in-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <Typography
              variant="h4"
              className="text-[#1a365d] font-bold mb-6"
            >
              {t('about.title')}
            </Typography>

            <Typography variant="body1" className="text-gray-700 mb-6 leading-relaxed">
              {t('about.p1')}
            </Typography>

            <Typography variant="body1" className="text-gray-700 mb-6 leading-relaxed">
              {t('about.p2')}
            </Typography>

            <Typography variant="body1" className="text-gray-700 mb-6 leading-relaxed">
              {t('about.p3')}
            </Typography>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1a365d] text-white py-4">
        <Container maxWidth="xl">
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="body2">
                {t('footer.address.line1')}
              </Typography>
              <Typography variant="body2">
                {t('footer.address.line2')}
              </Typography>
              <Typography variant="body2">
                {t('footer.address.line3')}
              </Typography>
            </div>
            <div className="flex gap-8">
              <div>
                <Typography variant="subtitle2" className="font-bold mb-2">
                  {t('footer.quicklinks')}
                </Typography>
                <div className="flex flex-col gap-1">
                  <Link href="/" passHref legacyBehavior>
                    <a className="text-sm text-gray-300 hover:text-white">
                      {t('nav.home')}
                    </a>
                  </Link>
                  <Link href="/about" passHref legacyBehavior>
                    <a className="text-sm text-gray-300 hover:text-white">
                      {t('nav.about')}
                    </a>
                  </Link>
                </div>
              </div>
              <div>
                <Typography variant="subtitle2" className="font-bold mb-2">
                  {t('footer.followus')}
                </Typography>
                <div className="flex flex-col gap-1">
                  <Link href="#" className="text-sm text-gray-300 hover:text-white">
                    Twitter
                  </Link>
                  <Link href="#" className="text-sm text-gray-300 hover:text-white">
                    LinkedIn
                  </Link>
                  <Link href="#" className="text-sm text-gray-300 hover:text-white">
                    Facebook
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
