import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Button,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Modal,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { app } from '../lib/firebase';
import gpData from '../../public/OdishaGpsMapping.json';
import AdminRegistrationDetails from '../components/AdminRegistrationDetails';
import AdminOverviewCards from '../components/AdminOverviewCards';
import AdminFunctionalities from '../components/AdminFunctionalities';
import AdminHeader from '../components/AdminHeader';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  district: string;
  block: string;
  gpName: string;
  role: string;
  registrationNumber: string;
  profilePhoto?: string;
}

interface VillageData {
  "GP Name": string;
  "District": string;
  "Block": string;
  "Village Name": string;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const ProfileSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const InfoItem = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

const VillageContainer = styled(Box)(({ theme }) => ({
  maxHeight: 300,
  overflow: 'auto',
  padding: theme.spacing(2),
}));

const VillageChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const ModalContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[24],
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
}));

const FunctionalityCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  cursor: 'pointer',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  backgroundColor: '#f5f5f5', // Off-white color
  '&:hover': {
    transform: 'scale(1.03)',
    boxShadow: theme.shadows[8],
  },
}));

const StyledHeading = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: theme.spacing(4),
}));

const NavyButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#000080', // Navy Blue
  color: 'white',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: '#000066', // Slightly darker Navy Blue on hover
  },
  marginTop: theme.spacing(2),
  width: '100%', // Make the button full width of the card
}));

const Dashboard: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [villages, setVillages] = useState<string[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedUserData, setEditedUserData] = useState<UserData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const db = getFirestore(app);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setUserData(data);
          setEditedUserData(data);
          if (data.role === 'Gram Panchayat Personnel' && data.gpName) {
            const gpVillages = gpData.districtVillageBlockGpsMapping
              .filter((item: VillageData) => 
                item["GP Name"] === data.gpName && 
                item["District"] === data.district && 
                item["Block"] === data.block
              )
              .map((item: VillageData) => item["Village Name"]);
            setVillages(Array.from(new Set(gpVillages)).sort((a, b) => a.localeCompare(b)));
          }
        }
        setLoading(false);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    const auth = getAuth(app);
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setEditedUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!userData || !editedUserData) return;

    const auth = getAuth(app);
    const user = auth.currentUser;
    if (!user) return;

    const db = getFirestore(app);
    try {
      await updateDoc(doc(db, 'users', user.uid), editedUserData as any);
      setUserData(editedUserData);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const functionalities = [
    {
      title: 'Collect and Update Data For Your GP',
      icon: '/GIF/Data Entry.gif',
      path: '/data-collection',
    },
    {
      title: 'View Your GP\'s snapshot in Dashboard',
      icon: '/GIF/Dashboard.gif',
      path: '/gp-snapshot',
    },
    {
      title: 'How to use this Platform, complete Guide',
      icon: '/GIF/complete Guide.gif',
      path: '/user-guide',
    },
    {
      title: 'View Reports and Past data collection details',
      icon: '/GIF/Reports.gif',
      path: '/reports',
    },
  ];

  const handleFunctionalityClick = (path: string) => {
    router.push(path);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!userData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography>No user data found. Please complete onboarding.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {userData.role === 'Administrator' ? (
        <>
          <AdminHeader
            userData={userData}
            onEditProfile={handleEditProfile}
            onLogout={handleLogout}
          />
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Administrator Dashboard
            </Typography>
            <AdminOverviewCards />
            <Box my={3}>
              <AdminFunctionalities />
            </Box>
            <AdminRegistrationDetails />
          </Box>
        </>
      ) : (
        <Grid container spacing={3}>
          {/* Existing profile section for Gram Panchayat Personnel */}
          <Grid item xs={12} md={4}>
            <StyledPaper elevation={3}>
              <ProfileSection>
                <Avatar
                  src={userData.profilePhoto}
                  sx={{ width: 120, height: 120, mb: 2 }}
                />
                <Typography variant="h5" gutterBottom>
                  {userData.firstName} {userData.lastName}
                </Typography>
                <InfoItem variant="body1">Email: {userData.email}</InfoItem>
                <InfoItem variant="body1">Phone: {userData.mobile}</InfoItem>
                <InfoItem variant="body1">Role: {userData.role}</InfoItem>
                {userData.role === 'Gram Panchayat Personnel' && (
                  <>
                    <InfoItem variant="body1">District: {userData.district}</InfoItem>
                    <InfoItem variant="body1">Block: {userData.block}</InfoItem>
                    <InfoItem variant="body1">Gram Panchayat: {userData.gpName}</InfoItem>
                  </>
                )}
                <Button variant="contained" color="primary" onClick={handleEditProfile} sx={{ mt: 2 }}>
                  Edit Profile
                </Button>
                <Button variant="contained" color="secondary" onClick={handleLogout} sx={{ mt: 2 }}>
                  Logout
                </Button>
              </ProfileSection>
              
              {userData.role === 'Gram Panchayat Personnel' && villages.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Villages in {userData.gpName}
                  </Typography>
                  <VillageContainer>
                    {villages.map((village, index) => (
                      <VillageChip
                        key={index}
                        label={village}
                        onClick={() => {/* Handle village click if needed */}}
                      />
                    ))}
                  </VillageContainer>
                </>
              )}
            </StyledPaper>
          </Grid>
          <Grid item xs={12} md={8}>
            {/* Existing content for Gram Panchayat Personnel */}
            <StyledPaper elevation={3}>
              <StyledHeading>
                Welcome to Panchayat Yojana Platform
              </StyledHeading>
              <Box>
                <Grid container spacing={3}>
                  {functionalities.map((functionality, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <FunctionalityCard>
                        <Image
                          src={functionality.icon}
                          alt={functionality.title}
                          width={200}
                          height={200}
                        />
                        <NavyButton 
                          variant="contained" 
                          onClick={() => handleFunctionalityClick(functionality.path)}
                        >
                          {functionality.title}
                        </NavyButton>
                      </FunctionalityCard>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </StyledPaper>
          </Grid>
        </Grid>
      )}

      {/* Existing Modal for editing profile */}
      <Modal
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        aria-labelledby="edit-profile-modal"
      >
        <ModalContent>
          <Typography variant="h6" gutterBottom>Edit Profile</Typography>
          <TextField
            fullWidth
            margin="normal"
            label="First Name"
            name="firstName"
            value={editedUserData?.firstName || ''}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Last Name"
            name="lastName"
            value={editedUserData?.lastName || ''}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Phone Number"
            name="mobile"
            value={editedUserData?.mobile || ''}
            onChange={handleInputChange}
          />
          <Button variant="contained" color="primary" onClick={handleSaveProfile} sx={{ mt: 2 }}>
            Save Changes
          </Button>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Dashboard;