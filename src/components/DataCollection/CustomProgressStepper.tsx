// src/components/DataCollection/CustomProgressStepper.tsx

import React from 'react';
import { 
  Box, 
  Stepper, 
  Step, 
  StepLabel,
} from '@mui/material';

interface Section {
  name: string;
  subsections: string[];
}

interface CustomProgressStepperProps {
  sections: Section[];
  activeSection: number;
  activeSubsection?: number;
}

const CustomProgressStepper: React.FC<CustomProgressStepperProps> = ({ 
  sections, 
  activeSection, 
  activeSubsection,
}) => {
  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Stepper activeStep={activeSection} alternativeLabel>
        {sections.map((section) => (
          <Step key={section.name}>
            <StepLabel>{section.name}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default CustomProgressStepper;