// src/components/UniversalHeader.tsx

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Language as LanguageIcon,
  AccountCircle,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../lib/firebase';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';

interface UniversalHeaderProps {
  userData: any;
}

const LanguageSwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><text x="2" y="15" fill="${encodeURIComponent(
          '#fff',
        )}">ଓ</text></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.primary.main,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: theme.palette.primary.main,
    width: 32,
    height: 32,
    '&:before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><text x="2" y="15" fill="${encodeURIComponent(
        '#fff',
      )}">E</text></svg>')`,
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
    borderRadius: 20 / 2,
  },
}));

const UniversalHeader: React.FC<UniversalHeaderProps> = ({ userData }) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    const auth = getAuth(app);
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleLanguageToggle = () => {
    const newLang = i18n.language === 'en' ? 'or' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <AppBar position="static" sx={{ bgcolor: 'white', color: 'primary.main' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {t('app.title')}
        </Typography>

        {/* Language Selector */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <Typography sx={{ mr: 1 }}>{t('header.language')}:</Typography>
          <LanguageSwitch
            checked={i18n.language === 'or'}
            onChange={handleLanguageToggle}
          />
        </Box>

        {/* User Profile */}
        {userData && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip
              avatar={<Avatar>{userData.firstName?.[0]}</Avatar>}
              label={`${userData.firstName} ${userData.lastName}`}
              sx={{ mr: 2 }}
            />
            <Chip
              label={userData.gpName}
              variant="outlined"
              color="primary"
              sx={{ mr: 2 }}
            />
            <Tooltip title={t('header.logout')}>
              <IconButton
                onClick={handleLogout}
                color="primary"
              >
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default UniversalHeader;