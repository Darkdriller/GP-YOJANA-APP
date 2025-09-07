# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Next.js application for the **Panchayat Yojana Dashboard** - a data collection and visualization platform for Gram Panchayat (village-level governance) data in Odisha, India. The application handles demographic, economic, educational, health, and environmental data collection and reporting.

## Key Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build production bundle (runs with --no-lint flag)
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Build Configuration
- **Build process**: Uses `next build --no-lint` to skip linting during build
- **TypeScript**: Configured with relaxed settings (`strict: false`, `noImplicitAny: false`) for deployment compatibility

## Architecture & Tech Stack

### Core Framework
- **Next.js** with Pages Router (not App Router)
- **TypeScript** (with relaxed configuration)
- **React 18** with Context API for state management

### UI Framework & Styling
- **Material-UI (MUI)** as primary component library
- **shadcn/ui** components integrated (configured via `components.json`)
- **TailwindCSS** for styling with custom theme configuration
- **Styled Components** and **Emotion** for component styling

### Data & Charts
- **Firebase** (Authentication, Firestore, Storage) configured via environment variables
- **Recharts** and **Chart.js** for data visualization
- **MUI X Charts** for advanced chart components

### State Management & Context
- **AuthContext** (`src/context/AuthContext.tsx`) - Firebase authentication management
- **LanguageContext** (`src/context/LanguageContext.tsx`) - Bilingual support (English/Odia)

### Project Structure
```
src/
├── components/
│   ├── DataCollection/     # Data collection forms and tables
│   ├── GPSnapshot/         # Dashboard visualization components
│   │   ├── Economic/       # Economic data charts
│   │   ├── Education/      # Education analytics
│   │   ├── Environmental/  # Environmental data
│   │   └── Health/         # Healthcare statistics
│   ├── ui/                 # shadcn/ui components
│   └── enhanced/           # Enhanced chart components
├── context/                # React Context providers
├── lib/
│   ├── firebase.ts         # Firebase configuration
│   ├── utils.ts           # Utility functions (shadcn)
│   └── sheetjs/           # Excel file processing
├── pages/                 # Next.js pages (Pages Router)
├── styles/
│   ├── globals.css        # Global styles with TailwindCSS
│   └── theme.ts          # MUI theme configuration
└── utils/                 # Utility functions
```

## Key Features & Components

### Data Collection System
- Multi-step forms for different data categories (Demographics, Education, Health, Economic, Environmental)
- Custom progress stepper component
- Data validation and review system
- Past data collections management

### Visualization Dashboard
- Comprehensive analytics across multiple domains
- Population demographics and age distribution
- Economic indicators (MGNREGS, migration, employment)
- Educational infrastructure and student-teacher ratios
- Healthcare facility distribution
- Environmental and land use mapping

### Authentication & Internationalization
- Firebase Authentication integration
- Bilingual interface (English/Odia) with translation system
- Admin functionalities with role-based access

## Environment Setup
- Requires Firebase configuration via environment variables:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`

## Data Collection & Firebase Storage Structure

### Firebase Collections

#### 1. `users` Collection
Stores user registration and profile data for GP personnel and administrators.

**Document ID**: `{userId}` (Firebase Auth UID)

**Fields**:
```javascript
{
  firstName: string,
  lastName: string,
  email: string,
  mobile: string,
  district: string,
  block: string,
  gpName: string,        // Gram Panchayat name
  role: string,          // "Gram Panchayat Personnel" or "Administrator"
  registrationNumber: string,
  profilePhoto: string,  // Base64 encoded image
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. `dataCollections` Collection
Main collection for storing all GP data submissions by financial year.

**Document ID**: `{userId}_{financialYear}` (e.g., "uid123_2024-2025")

**Fields**:
```javascript
{
  userId: string,
  gpName: string,
  district: string,
  block: string,
  financialYear: string,
  submittedAt: string,      // ISO timestamp
  lastUpdatedAt: string,    // ISO timestamp
  userDetails: {
    name: string,
    email: string,
    role: string
  },
  formData: {               // Main data structure
    Demographics: {...},
    Education: {...},
    "Health and Childcare": {...},
    "Migration and Employment": {...},
    "Road Infrastructure": {...},
    "Panchayat Finances": {...},
    "Land Use Mapping": {...},
    "Water Resources": {...}
  }
}
```

### Data Structure by Category

#### Demographics Data
Village-wise demographic information stored as nested objects:
```javascript
Demographics: {
  "Village Name 1": {
    households: string,
    totalPopulation: string,
    malePopulation: string,
    femalePopulation: string,
    age0to14Male: string,
    age0to14Female: string,
    age15to60Male: string,
    age15to60Female: string,
    ageAbove60Male: string,
    ageAbove60Female: string
  },
  "Village Name 2": {...}
}
```

#### Education Data
School information for each village:
```javascript
Education: {
  "Village Name": [
    {
      id: string,
      name: string,
      teachersMale: number,
      teachersFemale: number,
      studentsTotal: number,
      studentsMale: number,
      studentsFemale: number,
      classEnrollment: {
        "1": number,
        "2": number,
        // ... up to class 12
      },
      newClassroomsRequired: number,
      infrastructureStatus: string  // "Excellent", "Good", "Needs Repairs", "Critical"
    }
  ]
}
```

#### Health and Childcare Data
Healthcare facilities by village:
```javascript
"Health and Childcare": {
  "Village Name": [
    {
      id: string,
      facilityType: string,      // "Primary Health Centre", "Anganwadi", etc.
      facilityName: string,
      hasDoctor: boolean,
      doctorAvailability: string,
      hasMedicines: boolean,
      hasElectricity: boolean,
      hasWater: boolean,
      servicesProvided: string[],
      infrastructureStatus: string
    }
  ]
}
```

#### Migration and Employment Data
Economic migration data by village:
```javascript
"Migration and Employment": {
  "Village Name": {
    householdsReportingMigration: number,
    seasonalMigrantsMale: number,
    seasonalMigrantsFemale: number,
    permanentMigrantsMale: number,
    permanentMigrantsFemale: number,
    landlessHouseholds: number,
    householdsWithMGNREGSCards: number,
    workdaysProvidedMGNREGS: number
  }
}
```

#### Road Infrastructure Data
Road connectivity information:
```javascript
"Road Infrastructure": {
  roads: [
    {
      id: string,
      roadName: string,
      roadType: string,          // "Concrete", "Asphalt", "Gravel", "Dirt"
      connectedVillages: string[],
      roadLength: number,         // in kilometers
      roadCondition: string,      // "Excellent", "Good", "Fair", "Poor"
      repairRequired: number      // in kilometers
    }
  ]
}
```

#### Panchayat Finances Data
GP-level financial information (not village-specific):
```javascript
"Panchayat Finances": {
  cfc: number,              // Central Finance Commission funds
  sfc: number,              // State Finance Commission funds
  ownSources: number,       // Own revenue sources
  mgnregs: number          // MGNREGS funds
}
```

#### Land Use Mapping Data
Land utilization data with common areas:
```javascript
"Land Use Mapping": {
  landUseData: {
    "Village Name": {
      forestArea: number,
      cultivableArea: number,
      nonCultivableArea: number,
      commonLandArea: number
    }
  },
  commonLandAreas: [
    {
      id: string,
      location: string,
      area: number,
      uses: string
    }
  ]
}
```

#### Water Resources Data
Water bodies and irrigation infrastructure:
```javascript
"Water Resources": {
  waterBodies: {
    "Village Name": [
      {
        id: string,
        type: string,              // "Ponds", "Lakes", "Streams", etc.
        locations: string[],
        waterLevel: string,        // "Seasonal", "Perennial"
        condition: string,         // "Clean", "Polluted", "Heavily polluted"
        irrigationPotential: number
      }
    ]
  },
  irrigationStructures: {
    "Village Name": [
      {
        id: string,
        type: string,              // "Canal", "Tank", "Well", etc.
        location: string,
        status: string,            // Condition status
        irrigationPotential: number
      }
    ]
  }
}
```

### Data Flow

1. **User Registration** → Creates document in `users` collection
2. **Data Entry** → GP personnel enter data through multi-step forms
3. **Data Validation** → Client-side validation in each form component
4. **Data Aggregation** → Form data collected in `formData` object structure
5. **Submission** → Complete data saved to `dataCollections` with composite key
6. **Retrieval** → Dashboard queries by `userId` and `financialYear`
7. **Analytics** → Data processed for visualization in GP Snapshot components

### Key Patterns

- **Village-centric Structure**: Most data is organized by village name as the primary key
- **Financial Year Tracking**: Each submission tied to a specific financial year
- **Update Tracking**: `lastUpdatedAt` field tracks modifications to existing data
- **User Attribution**: Every submission includes user details for audit trail
- **Flexible Schema**: Nested object structure allows for varying data per village

## Import Aliases
- `@/*` maps to `src/*` (configured in tsconfig.json)
- shadcn components use aliases: `@/components`, `@/lib/utils`, `@/components/ui`