# Patient Directory Application

A modern, responsive patient management system built with Next.js 15, TypeScript, and Tailwind CSS. This application provides a comprehensive interface for viewing, searching, filtering, and managing patient data with real-time updates and advanced pagination.

## 🚀 Features

### Core Functionality

- **Patient Data Display**: View patient information in a clean, organized table format
- **Advanced Search**: Search across patient names, medical issues, and contact information
- **Dynamic Filtering**: Filter patients by medical issues and age ranges
- **Real-time Sorting**: Sort by patient name, age, or medical issue (ascending/descending)
- **Pagination**: Navigate through large datasets with customizable items per page (5, 10, 20, 50)
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### User Experience

- **Loading States**: Smooth loading indicators during data fetching
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Visual Feedback**: Color-coded medical issue badges and interactive elements
- **Accessibility**: Built with accessibility best practices

## 🛠️ Technology Stack

### Frontend

- **Next.js 15.5.4**: React framework with App Router
- **React 19.1.0**: Latest React with concurrent features
- **TypeScript 5**: Type-safe development
- **Tailwind CSS 4**: Utility-first CSS framework
- **React Icons 5.5.0**: Comprehensive icon library

### Backend

- **Next.js API Routes**: Serverless API endpoints
- **File-based Data Storage**: JSON-based data persistence
- **Advanced Query Processing**: Custom filtering, sorting, and pagination logic

### Development Tools

- **ESLint**: Code linting and formatting
- **Turbopack**: Fast bundler for development
- **Geist Fonts**: Modern typography

## 📁 Project Structure

```
internship-task/
├── src/
│   └── app/
│       ├── api/
│       │   └── data/
│       │       └── route.ts          # API endpoint for patient data
│       ├── components/
│       │   └── PatientDirectory.tsx  # Main patient directory component
│       ├── globals.css               # Global styles
│       ├── layout.tsx                # Root layout component
│       └── page.tsx                  # Home page
├── data/
│   └── data.json                     # Patient data (1000 records)
├── public/
│   └── bg-image.png                  # Background image assets
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
├── next.config.ts                    # Next.js configuration
├── tailwind.config.js                # Tailwind CSS configuration
└── README.md                         # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (or yarn/pnpm)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd internship-task
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🏗️ Architecture Decisions

### 1. Next.js App Router

**Decision**: Used Next.js 15 with App Router instead of Pages Router
**Rationale**:

- Better performance with React Server Components
- Improved file-based routing
- Enhanced developer experience
- Future-proof architecture

### 2. TypeScript Integration

**Decision**: Full TypeScript implementation
**Rationale**:

- Type safety reduces runtime errors
- Better developer experience with IntelliSense
- Easier refactoring and maintenance

### 3. File-based Data Storage

**Decision**: JSON file storage instead of database
**Rationale**:

- Simplicity for demo/portfolio purposes
- No database setup required
- Easy to modify and test with sample data
- Sufficient for read-heavy operations

### 4. Server-side API Routes

**Decision**: Next.js API routes for data processing
**Rationale**:

- Server-side filtering, sorting, and pagination
- Reduced client-side computation
- Better performance for large datasets
- Centralized data processing logic

### 5. Custom Hook Pattern

**Decision**: Integrated data fetching logic within component
**Rationale**:

- Simplicity for single-page application
- Direct state management
- Easy to understand data flow
- No additional complexity for current scope

### 6. Tailwind CSS

**Decision**: Utility-first CSS framework
**Rationale**:

- Rapid development and prototyping
- Consistent design system
- Responsive design made easy
- Small bundle size with purging

## 🔧 API Documentation

### GET /api/data

Retrieves paginated patient data with filtering, sorting, and search capabilities.

#### Query Parameters

| Parameter       | Type     | Default                              | Description                                 |
| --------------- | -------- | ------------------------------------ | ------------------------------------------- |
| `page`          | number   | 1                                    | Page number for pagination                  |
| `limit`         | number   | 10                                   | Number of items per page (max 100)          |
| `search`        | string   | ""                                   | Search term for patient data                |
| `searchFields`  | string   | "patient_name,medical_issue,contact" | Comma-separated fields to search            |
| `sort`          | string   | ""                                   | Sort field and direction (e.g., "name:asc") |
| `medical_issue` | string[] | []                                   | Filter by medical issues                    |
| `age_range`     | string[] | []                                   | Filter by age ranges (e.g., "18-30", "65+") |

#### Response Format

```typescript
interface ApiResponse {
  total: number; // Total number of records
  page: number; // Current page number
  limit: number; // Items per page
  hasNextPage: boolean; // Whether there's a next page
  hasPrevPage: boolean; // Whether there's a previous page
  totalPages: number; // Total number of pages
  data: Patient[]; // Array of patient records
  error?: string; // Error message if any
}
```

#### Patient Data Structure

```typescript
interface Patient {
  patient_id: number;
  patient_name: string;
  age: number;
  photo_url: string | null;
  contact: Array<{
    address: string | null;
    number: string | null;
    email: string | null;
  }>;
  medical_issue: string;
}
```

## 🎨 UI/UX Design Decisions

### 1. Color Scheme

- **Primary**: Blue (#2563eb) for headers and interactive elements
- **Secondary**: Gray tones for neutral elements
- **Medical Issues**: Color-coded badges for quick identification
- **Status Colors**: Red for errors, green for success

### 2. Layout Strategy

- **Mobile-first**: Responsive design starting from mobile
- **Grid System**: Flexible grid layout for different screen sizes
- **Typography**: Geist font family for modern readability

### 3. Interaction Patterns

- **Debounced Search**: 300ms delay to prevent excessive API calls
- **Loading States**: Skeleton loaders and spinners
- **Hover Effects**: Subtle hover states for interactive elements
- **Visual Feedback**: Clear indication of active filters and sorting

## 🔍 Search & Filter Implementation

### Search Functionality

- **Multi-field Search**: Searches across patient name, medical issue, and contact info
- **Case-insensitive**: Converts search terms to lowercase
- **Real-time**: Updates results as user types (with debouncing)
- **Nested Object Support**: Searches within contact arrays

### Filter System

- **Medical Issue Filtering**: Multiple selection with color-coded badges
- **Age Range Filtering**: Predefined ranges (0-18, 19-30, 31-50, 51-65, 65+)
- **Combined Filters**: Multiple filters work together with AND logic
- **Filter Persistence**: Filters remain active until manually cleared

### Sorting Options

- **Field Selection**: Sort by name, age, or medical issue
- **Direction Toggle**: Ascending/descending order
- **Visual Indicators**: Arrow icons showing current sort direction
- **State Persistence**: Sort preferences maintained during navigation

```





## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 👨‍💻 Author

**Priyanshu Verma**

- Portfolio: https://my-portfolio-beta-nine-27.vercel.app/
- LinkedIn: https://www.linkedin.com/in/priyanshu-verma-a12ba829a/

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first approach
- React Icons for the comprehensive icon library
- The open-source community for inspiration and tools

---

