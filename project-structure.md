# Modern Intranet Platform - Project Structure

This document outlines the organization and structure of the Modern Intranet Platform project, explaining the purpose of each directory and key files.

## Root Directory

```
modern-intranet-platform/
├── client/                 # Frontend React application
├── server/                 # Backend Node.js application
├── database/               # Database scripts and migrations
├── docker/                 # Docker configuration
├── docs/                   # Documentation
├── storage/                # Uploaded files and media
├── .env                    # Environment variables
├── .gitignore              # Git ignore file
├── package.json            # Project configuration and scripts
└── README.md               # Project overview
```

## Client Directory (Frontend)

```
client/
├── public/                 # Static files
│   ├── index.html          # HTML entry point
│   ├── favicon.ico         # Site favicon
│   └── assets/             # Static assets (images, fonts)
├── src/                    # React source code
│   ├── components/         # Reusable components
│   │   ├── common/         # Shared components used across modules
│   │   ├── core/           # Core module components
│   │   ├── real-estate/    # Real estate module components
│   │   ├── mortgage/       # Mortgage module components
│   │   └── maintenance/    # Maintenance module components
│   ├── contexts/           # React contexts for state management
│   │   ├── AuthContext.js  # Authentication context
│   │   ├── NotificationContext.js # Notification context
│   │   └── ThemeContext.js # Theme/UI context
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components
│   │   ├── core/           # Core module pages
│   │   ├── real-estate/    # Real estate module pages
│   │   ├── mortgage/       # Mortgage module pages
│   │   └── maintenance/    # Maintenance module pages
│   ├── services/           # API services
│   │   ├── api.js          # Base API configuration
│   │   ├── authService.js  # Authentication service
│   │   └── moduleServices/ # Module-specific services
│   ├── utils/              # Utility functions
│   ├── App.js              # Main application component
│   ├── index.js            # JavaScript entry point
│   └── routes.js           # Application routes
├── .env                    # Environment variables for client
├── package.json            # Client dependencies and scripts
└── Dockerfile              # Client Docker configuration
```

## Server Directory (Backend)

```
server/
├── src/                    # Source code
│   ├── api/                # API routes
│   │   ├── index.js        # API routes entry point
│   │   ├── auth.js         # Authentication routes
│   │   ├── core/           # Core module routes
│   │   ├── real-estate/    # Real estate module routes
│   │   ├── mortgage/       # Mortgage module routes
│   │   └── maintenance/    # Maintenance module routes
│   ├── config/             # Configuration files
│   │   ├── database.js     # Database configuration
│   │   ├── express.js      # Express configuration
│   │   └── logger.js       # Logging configuration
│   ├── controllers/        # Request handlers
│   │   ├── authController.js # Authentication controller
│   │   ├── coreControllers/ # Core module controllers
│   │   ├── realEstateControllers/ # Real estate controllers
│   │   ├── mortgageControllers/ # Mortgage controllers
│   │   └── maintenanceControllers/ # Maintenance controllers
│   ├── middleware/         # Express middleware
│   │   ├── auth.js         # Authentication middleware
│   │   ├── errorHandler.js # Error handling middleware
│   │   └── validation.js   # Request validation middleware
│   ├── models/             # Database models (if using ORM)
│   ├── services/           # Business logic
│   │   ├── emailService.js # Email service
│   │   ├── fileService.js  # File handling service
│   │   ├── notificationService.js # Notification service
│   │   └── workflowService.js # Workflow service
│   ├── utils/              # Utility functions
│   │   ├── logger.js       # Logging utility
│   │   └── helpers.js      # Helper functions
│   ├── app.js              # Express application setup
│   └── index.js            # Server entry point
├── tests/                  # Backend tests
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── fixtures/           # Test fixtures
├── .env                    # Environment variables for server
├── package.json            # Server dependencies and scripts
└── Dockerfile              # Server Docker configuration
```

## Database Directory

```
database/
├── init/                   # Database initialization scripts
│   ├── 01-schema.sql       # Schema creation script
│   └── 02-seed.sql         # Initial data seed script
├── migrations/             # Database migrations
│   ├── YYYYMMDD-migration-name.sql # Migration files
│   └── ...
├── init.js                 # Database initialization script
├── migrate.js              # Migration runner script
└── seed.js                 # Seed data script
```

## Docker Directory

```
docker/
├── docker-compose.yml      # Docker Compose configuration
├── nginx/                  # Nginx configuration for production
│   └── nginx.conf          # Nginx configuration file
└── scripts/                # Docker helper scripts
    ├── backup.sh           # Database backup script
    └── restore.sh          # Database restore script
```

## Docs Directory

```
docs/
├── api/                    # API documentation
│   └── swagger.yaml        # Swagger/OpenAPI specification
├── architecture/           # Architecture documentation
│   ├── diagrams/           # Architecture diagrams
│   └── overview.md         # Architecture overview
├── user-guides/            # User guides
│   ├── admin-guide.md      # Administrator guide
│   └── user-guide.md       # End-user guide
└── development/            # Development documentation
    ├── setup.md            # Development setup guide
    └── contributing.md     # Contribution guidelines
```

## Storage Directory

```
storage/
├── uploads/                # User uploaded files
│   ├── documents/          # Document uploads
│   └── images/             # Image uploads
├── exports/                # Exported reports and data
└── temp/                   # Temporary files
```

## Module Structure

Each module (Core, Real Estate, Mortgage, Maintenance) follows a similar structure in both the frontend and backend:

### Frontend Module Structure

```
src/components/[module-name]/
├── common/                 # Module-specific common components
├── forms/                  # Form components
├── lists/                  # List and table components
├── details/                # Detail view components
└── Dashboard.js            # Module dashboard component

src/pages/[module-name]/
├── index.js                # Module main page
├── Dashboard.js            # Dashboard page
├── [entity]/               # Entity-specific pages
│   ├── List.js             # Entity list page
│   ├── Details.js          # Entity details page
│   ├── Create.js           # Entity creation page
│   └── Edit.js             # Entity edit page
└── ...
```

### Backend Module Structure

```
src/api/[module-name]/
├── index.js                # Module routes entry point
└── [entity].js             # Entity-specific routes

src/controllers/[module-name]Controllers/
├── [entity]Controller.js   # Entity-specific controller
└── ...

src/services/[module-name]Services/
├── [entity]Service.js      # Entity-specific service
└── ...
```

## Key Files

- **client/src/App.js**: Main React application component that sets up routing and global contexts
- **client/src/index.js**: Entry point for the React application
- **server/src/index.js**: Entry point for the Node.js server
- **server/src/app.js**: Express application setup
- **database/init/01-schema.sql**: Database schema definition
- **docker/docker-compose.yml**: Docker Compose configuration for development environment
- **.env**: Environment variables for configuration
- **package.json**: Project dependencies and scripts

## Development Workflow

1. Start the development environment using Docker Compose:
   ```
   npm run docker:up
   ```

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database Admin: http://localhost:5050
   - Mail Testing: http://localhost:8025
   - MinIO Console: http://localhost:9001

3. Make changes to the code - the development environment uses volume mounts so changes will be reflected immediately

4. Run tests:
   ```
   npm test
   ```

5. Build for production:
   ```
   npm run build
