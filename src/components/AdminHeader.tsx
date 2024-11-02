import React from 'react';
import { AppBar, Toolbar, Avatar, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';

interface AdminHeaderProps {
  userData: {
    firstName: string;
    lastName: string;
    profilePhoto: string;
  };
  onEditProfile: () => void;
  onLogout: () => void;
}

const StyledAppBar = styled(AppBar)({
  position: 'static',
  backgroundColor: '#000080', // Navy blue
  color: '#FFFFFF',
});

const UserInfo = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

const UserName = styled(Typography)({
  marginLeft: '1rem',
  fontWeight: 'bold',
});

const UserRole = styled(Typography)({
  marginLeft: '0.5rem',
  opacity: 0.8,
});

const ActionButtons = styled('div')({
  marginLeft: 'auto',
  display: 'flex',
  gap: '1rem',
});

const StyledButton = styled(Button)({
  color: '#FFFFFF',
  borderColor: '#FFFFFF',
  '&:hover': {
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

const AdminHeader: React.FC<AdminHeaderProps> = ({ userData, onEditProfile, onLogout }) => {
  return (
    <StyledAppBar>
      <Toolbar>
        <UserInfo>
          <Avatar 
            src={userData.profilePhoto} 
            alt={`${userData.firstName} ${userData.lastName}`}
            sx={{ width: 40, height: 40 }}
          />
          <UserName variant="h6">{`${userData.firstName} ${userData.lastName}`}</UserName>
          <UserRole variant="body2">Administrator</UserRole>
        </UserInfo>
        <ActionButtons>
          <StyledButton 
            variant="outlined" 
            startIcon={<EditIcon />} 
            onClick={onEditProfile}
          >
            Edit Profile
          </StyledButton>
          <StyledButton 
            variant="outlined" 
            startIcon={<LogoutIcon />} 
            onClick={onLogout}
          >
            Logout
          </StyledButton>
        </ActionButtons>
      </Toolbar>
    </StyledAppBar>
  );
};

export default AdminHeader;