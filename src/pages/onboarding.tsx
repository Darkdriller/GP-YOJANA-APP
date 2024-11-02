import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Avatar,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Webcam from 'react-webcam';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../lib/firebase'; // Update this import to match your firebase config file

// Import your JSON data
import gpData from '../../public/OdishaGpsMapping.json';

const roles = ['Gram Panchayat Personnel', 'Administrator'];
const gpRoles = ['PEO (Panchayat Executive Officer)', 'Sarpanch', 'Data Entry Operator', 'Others'];

interface OnboardingData {
  role: string;
  adminPassword?: string;
  district: string;
  block: string;
  gpName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  gpRole: string;
  otherRole?: string;
  profilePhoto?: string;
}

const Onboarding: React.FC = () => {
  const [step, setStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    role: '',
    district: '',
    block: '',
    gpName: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    gender: '',
    dateOfBirth: '',
    gpRole: '',
  });
  const [adminPasswordError, setAdminPasswordError] = useState('');
  const [districts, setDistricts] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<string[]>([]);
  const [gps, setGps] = useState<string[]>([]);
  const webcamRef = React.useRef<Webcam>(null);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    const uniqueDistricts = Array.from(new Set(gpData.districtVillageBlockGpsMapping.map(item => item.District)));
    setDistricts(uniqueDistricts);
  }, []);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        // Redirect to login if no user is found
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setOnboardingData({ ...onboardingData, [name]: value });

    if (name === 'district') {
      const uniqueBlocks = Array.from(new Set(gpData.districtVillageBlockGpsMapping
        .filter(item => item.District === value)
        .map(item => item.Block)));
      setBlocks(uniqueBlocks);
      setOnboardingData(prev => ({ ...prev, block: '', gpName: '' }));
    } else if (name === 'block') {
      const uniqueGps = Array.from(new Set(gpData.districtVillageBlockGpsMapping
        .filter(item => item.District === onboardingData.district && item.Block === value)
        .map(item => item['GP Name'])));
      setGps(uniqueGps);
      setOnboardingData(prev => ({ ...prev, gpName: '' }));
    }
  };

  const handleAdminPasswordVerification = () => {
    if (onboardingData.adminPassword === 'CYSD@2025') {
      setAdminPasswordError('');
      setStep(step + 1);
    } else {
      setAdminPasswordError('Incorrect administrator password');
    }
  };

  const handleCapturePhoto = () => {
    setIsWebcamOpen(true);
  };

  const capture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
    }
  };

  const handleAcceptPhoto = () => {
    setOnboardingData({ ...onboardingData, profilePhoto: capturedImage });
    setIsWebcamOpen(false);
    setCapturedImage(null);
  };

  const handleRecapture = () => {
    setCapturedImage(null);
  };

  const handleCloseWebcam = () => {
    setIsWebcamOpen(false);
    setCapturedImage(null);
  };

  const handleSubmit = async () => {
    if (!userId) {
      console.error('No user ID found');
      return;
    }

    setIsLoading(true);
    setError(null);
    const db = getFirestore(app);

    try {
      await setDoc(doc(db, 'users', userId), {
        ...onboardingData,
        createdAt: new Date(),
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      setError('Failed to save onboarding data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Select Your Role
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={onboardingData.role}
                onChange={handleChange}
                name="role"
              >
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>{role}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {onboardingData.role === 'Administrator' && (
              <>
                <TextField
                  fullWidth
                  margin="normal"
                  name="adminPassword"
                  label="Administrator Password"
                  type="password"
                  value={onboardingData.adminPassword || ''}
                  onChange={handleChange}
                  error={!!adminPasswordError}
                  helperText={adminPasswordError}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAdminPasswordVerification}
                >
                  Verify Password
                </Button>
              </>
            )}
            {onboardingData.role === 'Gram Panchayat Personnel' && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setStep(step + 1)}
              >
                Continue
              </Button>
            )}
          </>
        );
      case 1:
        if (onboardingData.role === 'Administrator') {
          return renderUserInformation();
        }
        return (
          <>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Select Your Gram Panchayat
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel>District</InputLabel>
              <Select
                value={onboardingData.district}
                onChange={handleChange}
                name="district"
              >
                {districts.map((district) => (
                  <MenuItem key={district} value={district}>{district}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Block</InputLabel>
              <Select
                value={onboardingData.block}
                onChange={handleChange}
                name="block"
                disabled={!onboardingData.district}
              >
                {blocks.map((block) => (
                  <MenuItem key={block} value={block}>{block}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Gram Panchayat</InputLabel>
              <Select
                value={onboardingData.gpName}
                onChange={handleChange}
                name="gpName"
                disabled={!onboardingData.block}
              >
                {gps.map((gp) => (
                  <MenuItem key={gp} value={gp}>{gp}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {onboardingData.gpName && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setStep(step + 1)}
              >
                Continue Onboarding as {onboardingData.gpName} GP
              </Button>
            )}
          </>
        );
      case 2:
        return renderUserInformation();
      default:
        return null;
    }
  };

  const renderUserInformation = () => {
    return (
      <>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          User Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              margin="normal"
              name="firstName"
              label="First Name"
              value={onboardingData.firstName}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              margin="normal"
              name="lastName"
              label="Last Name"
              value={onboardingData.lastName}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
        <TextField
          fullWidth
          margin="normal"
          name="phoneNumber"
          label="Phone Number"
          value={onboardingData.phoneNumber}
          onChange={handleChange}
          InputProps={{
            startAdornment: <span>+91</span>,
          }}
        />
        <TextField
          fullWidth
          margin="normal"
          name="email"
          label="Email"
          type="email"
          value={onboardingData.email}
          onChange={handleChange}
        />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={onboardingData.gender}
                onChange={handleChange}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              margin="normal"
              name="dateOfBirth"
              label="Date of Birth"
              type="date"
              value={onboardingData.dateOfBirth}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
        {onboardingData.role === 'Administrator' ? (
          <TextField
            fullWidth
            margin="normal"
            name="gpRole"
            label="Role"
            value={onboardingData.gpRole}
            onChange={handleChange}
          />
        ) : (
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={onboardingData.gpRole}
              onChange={handleChange}
              name="gpRole"
            >
              {gpRoles.map((role) => (
                <MenuItem key={role} value={role}>{role}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {onboardingData.gpRole === 'Others' && (
          <TextField
            fullWidth
            margin="normal"
            name="otherRole"
            label="Specify Other Role"
            value={onboardingData.otherRole || ''}
            onChange={handleChange}
          />
        )}
        <Box mt={2} display="flex" flexDirection="column" alignItems="center">
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Profile Photo
          </Typography>
          <Avatar
            sx={{ width: 100, height: 100, cursor: 'pointer' }}
            onClick={handleCapturePhoto}
          >
            {onboardingData.profilePhoto ? (
              <img src={onboardingData.profilePhoto} alt="Profile" width={100} height={100} />
            ) : (
              <AddAPhotoIcon />
            )}
          </Avatar>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          style={{ marginTop: theme.spacing(2) }}
        >
          Complete Onboarding
        </Button>
      </>
    );
  };

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: 'url(/images/Login.jpeg)',
          backgroundRepeat: 'no-repeat',
          backgroundColor: (t) =>
            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h4" fontWeight="bold">
            Onboarding
          </Typography>
          <Box sx={{ mt: 1, width: '100%' }}>
            <LinearProgress variant="determinate" value={(step / 2) * 100} sx={{ mb: 2 }} />
            {renderStep()}
          </Box>
        </Box>
      </Grid>
      <Dialog open={isWebcamOpen} onClose={handleCloseWebcam}>
        <DialogTitle>Capture Profile Photo</DialogTitle>
        <DialogContent>
          {!capturedImage ? (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="100%"
            />
          ) : (
            <img src={capturedImage} alt="Captured" style={{ width: '100%' }} />
          )}
        </DialogContent>
        <DialogActions>
          {!capturedImage ? (
            <>
              <Button onClick={handleCloseWebcam}>Cancel</Button>
              <Button onClick={capture}>Capture</Button>
            </>
          ) : (
            <>
              <Button onClick={handleRecapture}>Recapture</Button>
              <Button onClick={handleAcceptPhoto}>Accept</Button>
            </>
          )}
        </DialogActions>
      </Dialog>
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      {isLoading && <LinearProgress sx={{ mt: 2 }} />}
    </Grid>
  );
};

export default Onboarding;