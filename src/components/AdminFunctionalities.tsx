import React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
}));

const ImageWrapper = styled(Box)({
  marginBottom: '1rem',
  '& > div': {
    borderRadius: '8px',
    overflow: 'hidden',
  },
});

interface FunctionalityProps {
  title: string;
  imagePath: string;
  route: string;
}

const Functionality: React.FC<FunctionalityProps> = ({ title, imagePath, route }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(route);
  };

  return (
    <Grid item xs={12} sm={6}>
      <StyledPaper elevation={3}>
        <ImageWrapper>
          <Image src={imagePath} alt={title} width={200} height={200} />
        </ImageWrapper>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Button variant="contained" color="primary" onClick={handleClick}>
          Click here
        </Button>
      </StyledPaper>
    </Grid>
  );
};

const AdminFunctionalities: React.FC = () => {
  return (
    <Grid container spacing={3}>
      <Functionality
        title="Consolidated Dashboard"
        imagePath="/GIF/Dashboard admin.gif"
        route="/admin/consolidated-dashboard"
      />
      <Functionality
        title="GP Reports and Data Collection Status"
        imagePath="/GIF/Reports.gif"
        route="/admin/gp-reports"
      />
    </Grid>
  );
};

export default AdminFunctionalities;