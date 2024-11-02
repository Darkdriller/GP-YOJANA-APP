import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Paper,
  Link,
  LinearProgress,
  Divider,
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import Layout from '../components/Layout';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Define custom theme with organization colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#355fa4',
    },
    secondary: {
      main: '#e64e2a',
    },
    success: {
      main: '#4ba93f',
    },
  },
});

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUp() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password should be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      router.push('/onboarding');
    } catch (error) {
      console.error('Error during sign up:', error);
      setError('Failed to create an account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/onboarding');
    } catch (error) {
      console.error('Error during Google sign up:', error);
      setError('Failed to sign up with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Layout>
        <Grid container component="main" className="h-screen">
          <Grid
            item
            xs={false}
            sm={4}
            md={7}
            className="relative hidden sm:block"
          >
            <Image
              src="/images/Login.jpeg"
              alt="Signup background"
              layout="fill"
              objectFit="cover"
              quality={100}
            />
          </Grid>
          <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
            <Box
              className="flex flex-col items-center justify-center h-full px-4 py-12 sm:px-6 lg:px-8"
            >
              <div className="max-w-md w-full space-y-8">
                <div>
                  <Typography component="h1" variant="h4" className="text-center font-bold text-primary">
                    Sign Up
                  </Typography>
                </div>
                {isLoading && <LinearProgress className="mb-4" />}
                <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
                  <div className="rounded-md shadow-sm space-y-4">
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      autoFocus
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                    <TextField
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <TextField
                      required
                      fullWidth
                      name="confirmPassword"
                      label="Confirm Password"
                      type="password"
                      id="confirmPassword"
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className="mt-6"
                    disabled={isLoading}
                  >
                    Sign Up
                  </Button>

                  <Divider className="my-6">Or</Divider>

                  <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    startIcon={<GoogleIcon />}
                    onClick={handleGoogleSignUp}
                    disabled={isLoading}
                  >
                    Sign up with Google
                  </Button>

                  {error && (
                    <Typography color="error" align="center" className="mt-2">
                      {error}
                    </Typography>
                  )}

                  <div className="text-sm text-center mt-4">
                    <Link href="/login" className="font-medium text-success hover:text-success-dark">
                      Already have an account? Sign in
                    </Link>
                  </div>
                </form>
              </div>
            </Box>
          </Grid>
        </Grid>
      </Layout>
    </ThemeProvider>
  );
}