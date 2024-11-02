// src/components/DataCollection/DataReviewAndSubmit.tsx

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  styled,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface DataReviewAndSubmitProps {
  formData: any;
  onSubmit: () => void;
  onEdit: (section: string, subsection: string) => void;
  sections: { name: string; subsections: string[] }[]; // New prop
}

const ModifyButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#006400', // Dark green
  color: 'white',
  '&:hover': {
    backgroundColor: '#004d00', // Slightly darker green on hover
  },
}));

const StyledAccordion = styled(Accordion)<{ index: number }>(({ theme, index }) => ({
  backgroundColor: `rgb(${200 - index * 20}, ${200 - index * 20}, ${200 - index * 20})`,
}));

const DataReviewAndSubmit: React.FC<DataReviewAndSubmitProps> = ({ formData, onSubmit, onEdit, sections }) => {
  const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return 'N/A';
    } else if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.map((item, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            {renderValue(item)}
          </Box>
        ));
      } else {
        return Object.entries(value).map(([key, val]) => (
          <Box key={key} sx={{ mb: 1 }}>
            <strong>{key}:</strong> {renderValue(val)}
          </Box>
        ));
      }
    } else {
      return String(value);
    }
  };

  const renderTableData = (data: any) => {
    if (Array.isArray(data) && data.length > 0) {
      const keys = Object.keys(data[0]);
      return (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {keys.map((key) => (
                  <TableCell key={key}>{key}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  {keys.map((key) => (
                    <TableCell key={key}>{renderValue(row[key])}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    } else if (typeof data === 'object' && data !== null) {
      return (
        <TableContainer component={Paper}>
          <Table>
            <TableBody>
              {Object.entries(data).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell component="th" scope="row">
                    {key}
                  </TableCell>
                  <TableCell>{renderValue(value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }
    return <Typography>{renderValue(data)}</Typography>;
  };

  const renderSection = (sectionName: string, sectionData: any, index: number) => {
    const section = sections.find(s => s.name === sectionName);
    if (!section) {
      console.error(`Section "${sectionName}" not found in sections array`);
      return null;
    }

    return (
      <StyledAccordion key={sectionName} index={index}>
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            '& .MuiAccordionSummary-content': {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            },
          }}
        >
          <Typography variant="h6">{sectionName}</Typography>
          <ModifyButton 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(sectionName, section.subsections[0]);
            }}
            size="small"
          >
            Modify {sectionName} Section
          </ModifyButton>
        </AccordionSummary>
        <AccordionDetails>
          {section.subsections.map((subsectionName) => (
            <Box key={subsectionName} sx={{ mb: 2 }}>
              <Typography variant="subtitle1">{subsectionName}</Typography>
              {sectionData && sectionData[subsectionName] !== undefined && sectionData[subsectionName] !== null ? 
                renderTableData(sectionData[subsectionName]) : 
                null // Removed "No data available" text
              }
              <Button onClick={() => onEdit(sectionName, subsectionName)}>Edit</Button>
            </Box>
          ))}
        </AccordionDetails>
      </StyledAccordion>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Review and Submit
      </Typography>
      {sections.map(({ name }, index) => renderSection(name, formData[name], index))}
      <Button variant="contained" color="primary" onClick={onSubmit} sx={{ mt: 2 }}>
        Submit
      </Button>
    </Box>
  );
};

export default DataReviewAndSubmit;
