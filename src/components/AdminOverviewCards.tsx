import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, LinearProgress, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { getFirestore, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { app } from '../lib/firebase';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import MapIcon from '@mui/icons-material/Map';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupsIcon from '@mui/icons-material/Groups';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DatasetIcon from '@mui/icons-material/Dataset';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import VerifiedIcon from '@mui/icons-material/Verified';

interface StyledCardProps {
  gradient?: string;
  hoverGradient?: string;
}

const StyledCard = styled(Card)<StyledCardProps>(({ theme, gradient, hoverGradient }) => ({
  height: '100%',
  background: gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
    background: hoverGradient || gradient || 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255,255,255,0.1)',
    transform: 'translateX(-100%)',
    transition: 'transform 0.6s ease',
  },
  '&:hover::before': {
    transform: 'translateX(100%)',
  },
}));

const CardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(2),
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 56,
  height: 56,
  borderRadius: '12px',
  backgroundColor: 'rgba(255,255,255,0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& .MuiSvgIcon-root': {
    fontSize: 28,
  },
}));

const MetricValue = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  lineHeight: 1.2,
  marginBottom: theme.spacing(0.5),
}));

const MetricLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 500,
  opacity: 0.95,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}));

const TrendIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(1),
  fontSize: '0.75rem',
  opacity: 0.9,
}));

const LoadingCard = styled(Card)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(2),
  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
  '@keyframes shimmer': {
    '0%': {
      backgroundPosition: '200% 0',
    },
    '100%': {
      backgroundPosition: '-200% 0',
    },
  },
}));

const AdminOverviewCards: React.FC = () => {
  const [totalDistricts, setTotalDistricts] = useState<number>(0);
  const [totalBlocks, setTotalBlocks] = useState<number>(0);
  const [totalGPs, setTotalGPs] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [gpPersonnel, setGPPersonnel] = useState<number>(0);
  const [admins, setAdmins] = useState<number>(0);
  const [dataCollections, setDataCollections] = useState<number>(0);
  const [activeGPs, setActiveGPs] = useState<number>(0);
  const [currentFY, setCurrentFY] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const db = getFirestore(app);
        
        // Fetch all users
        const usersRef = collection(db, 'users');
        const allUsersSnapshot = await getDocs(usersRef);
        
        const districtSet = new Set<string>();
        const blockSet = new Set<string>();
        const gpSet = new Set<string>();
        let gpPersonnelCount = 0;
        let adminCount = 0;
        
        allUsersSnapshot.forEach((doc) => {
          const data = doc.data();
          
          if (data.district) districtSet.add(data.district);
          if (data.block) blockSet.add(data.block);
          if (data.gpName) gpSet.add(data.gpName);
          
          if (data.role === 'Gram Panchayat Personnel') {
            gpPersonnelCount++;
          } else if (data.role === 'Administrator') {
            adminCount++;
          }
        });
        
        // Fetch data collections
        const dataCollectionsRef = collection(db, 'dataCollections');
        const dataSnapshot = await getDocs(dataCollectionsRef);
        
        // Get current financial year
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
        const currentFinancialYear = `${fyStartYear}-${fyStartYear + 1}`;
        setCurrentFY(currentFinancialYear);
        
        // Count GPs with data in current FY
        const gpsWithCurrentFYData = new Set<string>();
        
        dataSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.financialYear === currentFinancialYear && data.gpName) {
            gpsWithCurrentFYData.add(data.gpName);
          }
        });
        
        setTotalDistricts(districtSet.size);
        setTotalBlocks(blockSet.size);
        setTotalGPs(gpSet.size);
        setTotalUsers(allUsersSnapshot.size);
        setGPPersonnel(gpPersonnelCount);
        setAdmins(adminCount);
        setDataCollections(dataSnapshot.size);
        setActiveGPs(gpsWithCurrentFYData.size);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching overview data:', error);
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  const cardConfigs = [
    {
      title: 'Districts',
      value: totalDistricts,
      icon: <MapIcon />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      trend: null,
      progress: undefined,
    },
    {
      title: 'Blocks',
      value: totalBlocks,
      icon: <GroupsIcon />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      trend: null,
      progress: undefined,
    },
    {
      title: 'Gram Panchayats',
      value: totalGPs,
      icon: <LocationCityIcon />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      trend: null,
      progress: undefined,
    },
    {
      title: 'Total Users',
      value: totalUsers,
      icon: <PeopleAltIcon />,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      subtext: `${gpPersonnel} GP Personnel • ${admins} Admins`,
      progress: undefined,
    },
    {
      title: 'Data Collections',
      value: dataCollections,
      icon: <DatasetIcon />,
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      trend: null,
      progress: undefined,
    },
    {
      title: 'Active GPs (FY ' + currentFY.substring(2, 4) + '-' + currentFY.substring(7, 9) + ')',
      value: activeGPs,
      icon: <VerifiedIcon />,
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      subtext: `GPs with data in current FY`,
      progress: undefined,
    },
  ];

  if (loading) {
    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, 
        backgroundColor: '#f8f9fa', 
        padding: 2, 
        borderRadius: 2,
        border: '1px solid #e0e0e0' }}>
        <AdminPanelSettingsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            Dashboard Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time statistics and metrics across all Gram Panchayats
          </Typography>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {cardConfigs.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <StyledCard gradient={card.gradient}>
              <CardContent sx={{ p: 2.5 }}>
                <CardHeader>
                  <Box>
                    <MetricValue>
                      {loading ? '-' : card.value}
                    </MetricValue>
                    <MetricLabel>
                      {card.title}
                    </MetricLabel>
                    {card.subtext && (
                      <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.7rem', mt: 0.5, display: 'block' }}>
                        {card.subtext}
                      </Typography>
                    )}
                  </Box>
                  <IconWrapper>
                    {card.icon}
                  </IconWrapper>
                </CardHeader>
                
                {card.progress !== undefined && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={card.progress} 
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'white',
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>
                )}
                
                {card.trend && (
                  <TrendIndicator>
                    <TrendingUpIcon sx={{ fontSize: 16 }} />
                    <span>{card.trend}</span>
                  </TrendIndicator>
                )}
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdminOverviewCards;