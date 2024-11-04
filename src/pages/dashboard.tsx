// src/pages/dashboard.tsx

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
  Modal,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  SelectChangeEvent,
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

/**
 * TypeScript Interfaces
 */

// Interface representing the structure of each user document in Firestore
interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  age: number;
  role: string;
  gpRole?: string;        // Optional: Present only if role is 'Gram Panchayat Personnel'
  district?: string;      // Optional: Present only if role is 'Gram Panchayat Personnel'
  block?: string;         // Optional: Present only if role is 'Gram Panchayat Personnel'
  gpName?: string;        // Optional: Present only if role is 'Gram Panchayat Personnel'
  profilePhoto?: string;  // URL or path to the user's profile photo
}

// Interface representing the structure of each village entry in OdishaGpsMapping.json
interface VillageData {
  "GP Name": string;
  "District": string;
  "Block": string;
  "Village Name": string;
}

// Interface representing the overall structure of OdishaGpsMapping.json
interface OdishaGpsData {
  districtVillageBlockGpsMapping: VillageData[];
}

/**
 * Styled Components using Material-UI's styled API
 */

// Styled Paper component for consistent padding and layout
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

// Styled Box component for the profile section
const ProfileSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

// Styled Typography component for individual info items
const InfoItem = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

// Styled Box component for the village list container
const VillageContainer = styled(Box)(({ theme }) => ({
  maxHeight: 300,
  overflow: 'auto',
  padding: theme.spacing(2),
}));

// Styled Chip component for displaying villages
const VillageChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

// Styled Box component for the modal content
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

// Styled Card component for functionalities
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

// Styled Typography component for the main heading
const StyledHeading = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: theme.spacing(4),
}));

// Styled Button component with Navy Blue color scheme
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

/**
 * Dashboard Component
 */

const Dashboard: React.FC = () => {
  // State to hold user data fetched from Firestore
  const [userData, setUserData] = useState<UserData | null>(null);

  // State to manage loading status
  const [loading, setLoading] = useState(true);

  // State to hold the list of villages associated with the user's GP
  const [villages, setVillages] = useState<string[]>([]);

  // State to manage the visibility of the edit profile modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // State to hold edited user data within the modal
  const [editedUserData, setEditedUserData] = useState<UserData | null>(null);

  // Next.js router for navigation
  const router = useRouter();

  /**
   * useEffect Hook to handle authentication state changes and fetch user data
   */
  useEffect(() => {
    const auth = getAuth(app);

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const db = getFirestore(app);

        try {
          // Fetch user document from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));

          if (userDoc.exists()) {
            const data = userDoc.data() as UserData;
            setUserData(data);
            setEditedUserData(data);

            // If the user is a Gram Panchayat Personnel, fetch associated villages
            if (data.role === 'Gram Panchayat Personnel' && data.gpName) {
              const gpVillages = (gpData as OdishaGpsData).districtVillageBlockGpsMapping
                .filter((item: VillageData) =>
                  item["GP Name"] === data.gpName &&
                  item["District"] === data.district &&
                  item["Block"] === data.block
                )
                .map((item: VillageData) => item["Village Name"]);

              // Remove duplicates and sort the village names alphabetically
              setVillages(Array.from(new Set(gpVillages)).sort((a, b) => a.localeCompare(b)));
            }
          } else {
            console.error('User document does not exist in Firestore.');
            // Optionally, handle this case in the UI
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Optionally, handle this case in the UI
        } finally {
          setLoading(false);
        }
      } else {
        // If the user is not authenticated, redirect to the login page
        router.push('/login');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  /**
   * Function to handle user logout
   */
  const handleLogout = async () => {
    const auth = getAuth(app);
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      // Optionally, provide user feedback
    }
  };

  /**
   * Function to open the edit profile modal
   */
  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  /**
   * Function to close the edit profile modal
   */
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  /**
   * Function to handle input changes in the edit profile form for TextField components
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setEditedUserData(prev => prev ? { ...prev, [name]: value } : prev);
    }
  };

  /**
   * Function to handle input changes in the edit profile form for Select components
   */
  const handleSelectChange = (
    e: SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setEditedUserData(prev => prev ? { ...prev, [name]: value } : prev);
    }
  };

  /**
   * Function to save the edited profile data to Firestore
   */
  const handleSaveProfile = async () => {
    if (!userData || !editedUserData) return;

    const auth = getAuth(app);
    const user = auth.currentUser;
    if (!user) return;

    const db = getFirestore(app);
    try {
      // Spread editedUserData to ensure type compatibility
      await updateDoc(doc(db, 'users', user.uid), { ...editedUserData } as Partial<UserData>);
      setUserData(editedUserData);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      // Optionally, provide user feedback
    }
  };

  /**
   * Array of functionalities available to the user
   */
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

  /**
   * Function to handle clicks on functionality cards
   */
  const handleFunctionalityClick = (path: string) => {
    router.push(path);
  };

  /**
   * Render a loading spinner while fetching user data
   */
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  /**
   * Render a message if no user data is found
   */
  if (!userData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography>No user data found. Please complete onboarding.</Typography>
      </Box>
    );
  }

  /**
   * Main render of the Dashboard component
   */
  return (
    <Box sx={{ flexGrow: 1 }}>
      {userData.role === 'Administrator' ? (
        // Render Administrator Dashboard
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
        // Render Gram Panchayat Personnel Dashboard
        <Grid container spacing={3}>
          {/* Profile Section */}
          <Grid item xs={12} md={4}>
            <StyledPaper elevation={3}>
              <ProfileSection>
                <Avatar
                  src={userData.profilePhoto || '/default-avatar.png'} // Provide a default avatar
                  sx={{ width: 120, height: 120, mb: 2 }}
                />
                <Typography variant="h5" gutterBottom>
                  {userData.firstName} {userData.lastName}
                </Typography>
                <InfoItem variant="body1">Email: {userData.email}</InfoItem>
                <InfoItem variant="body1">Phone: {userData.phoneNumber}</InfoItem>
                <InfoItem variant="body1">Gender: {userData.gender}</InfoItem>
                <InfoItem variant="body1">Age: {userData.age}</InfoItem>
                <InfoItem variant="body1">Role: {userData.role}</InfoItem>
                {userData.role === 'Gram Panchayat Personnel' && (
                  <>
                    <InfoItem variant="body1">GP Role: {userData.gpRole}</InfoItem>
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

          {/* Functionalities Section */}
          <Grid item xs={12} md={8}>
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

      {/* Modal for Editing Profile */}
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
            name="phoneNumber"
            value={editedUserData?.phoneNumber || ''}
            onChange={handleInputChange}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Gender</InputLabel>
            <Select
              name="gender"
              value={editedUserData?.gender || ''}
              onChange={handleSelectChange} // Use the separate handler
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="Age"
            name="age"
            type="number"
            value={editedUserData?.age || ''}
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
