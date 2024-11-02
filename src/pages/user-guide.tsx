// src/pages/user-guide.tsx

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import SchoolIcon from '@mui/icons-material/School';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import BusinessIcon from '@mui/icons-material/Business';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ParkIcon from '@mui/icons-material/Park';
import WaterIcon from '@mui/icons-material/Water';

const UserGuide: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom align="center" color="primary">
          पंचायत योजना डैशबोर्ड - उपयोगकर्ता मार्गदर्शिका
        </Typography>
        <Typography variant="h4" gutterBottom align="center">
          Panchayat Yojana Dashboard - User Guide
        </Typography>

        {/* Getting Started Section */}
        <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: '#f8f9fa' }}>
          <Typography variant="h5" gutterBottom color="primary">
            Getting Started 👋
          </Typography>
          <Typography paragraph>
            Welcome to the Panchayat Yojana Dashboard! This guide will help you understand how to use the platform effectively.
          </Typography>
        </Paper>

        {/* User Types and Access */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Step 1: Understanding Your Role</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Card sx={{ mb: 2, bgcolor: '#f8f9fa' }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  When you first sign up, you'll be asked to select your role:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Gram Panchayat Personnel" secondary="For GP staff members who will be entering data" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Administrator" secondary="For supervisory staff and administrators" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </AccordionDetails>
        </Accordion>

        {/* Data Collection Process */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Step 2: Collecting Data</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                To start collecting data:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <ArrowRightIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Click on 'Data Collection' in the dashboard" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ArrowRightIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Select the Financial Year you want to enter data for" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ArrowRightIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Follow the step-by-step process to enter data for each section" />
                </ListItem>
              </List>
            </Box>

            <Typography variant="subtitle1" gutterBottom color="primary">
              Main Sections for Data Collection:
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SchoolIcon sx={{ mr: 1 }} />
                    <Typography>1. Social Data</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Demographics" 
                        secondary="Enter population details for each village - total households, male/female population, age groups"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Education" 
                        secondary="Add details about schools, number of students, and education facilities in each village"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Health and Childcare" 
                        secondary="Record information about healthcare centers and childcare facilities"
                      />
                    </ListItem>
                  </List>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BusinessIcon sx={{ mr: 1 }} />
                    <Typography>2. Economic Data</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Migration and Employment" 
                        secondary="Enter details about migration patterns and employment statistics for each village"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Road Infrastructure" 
                        secondary="Record information about different types of roads and their conditions"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Panchayat Finances" 
                        secondary="Enter financial details for the entire Panchayat (not village-wise)"
                      />
                    </ListItem>
                  </List>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ParkIcon sx={{ mr: 1 }} />
                    <Typography>3. Environmental Data</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Land Use Mapping" 
                        secondary="Record details about land usage and common lands in the Panchayat"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Water Resources" 
                        secondary="Enter information about water bodies and irrigation structures"
                      />
                    </ListItem>
                  </List>
                </AccordionDetails>
              </Accordion>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Helpful Tips */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Helpful Tips</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleOutlineIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Auto-Save Feature" 
                  secondary="Your data is automatically saved as you enter it. You can come back anytime to continue."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleOutlineIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Edit Previous Data" 
                  secondary="You can always go back and edit data from previous financial years."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleOutlineIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Progress Tracking" 
                  secondary="The progress bar at the top shows how much of the form you've completed."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleOutlineIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Review Before Submit" 
                  secondary="You can review all your entries before final submission."
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Need Help Section */}
        <Paper elevation={3} sx={{ p: 3, mt: 4, bgcolor: '#f8f9fa' }}>
          <Typography variant="h6" gutterBottom color="primary">
            Need Help?
          </Typography>
          <Typography paragraph>
            If you need any assistance while using the platform, please contact your Block office or reach out to the support team.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default UserGuide;