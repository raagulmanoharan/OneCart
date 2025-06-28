# OneCart - Universal E-commerce Shopping Cart

## Overview

OneCart is a universal shopping cart application that aggregates products from multiple Indian e-commerce platforms (Amazon India, Flipkart, Myntra, Nykaa, and Ajio) into a single unified cart. The application allows users to extract product information from URLs, manage their cart, and set up automated purchasing rules.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state
- **UI Components**: Radix UI with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and building

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **API Design**: RESTful API structure
- **Session Management**: Express sessions with PostgreSQL storage
- **Web Scraping**: Cheerio for product data extraction

### Database Architecture
- **Primary Database**: PostgreSQL with Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle migrations system
- **Session Storage**: PostgreSQL-backed session store

## Key Components

### Authentication System
- **Provider**: Replit OpenID Connect (OIDC) authentication
- **Strategy**: Passport.js with OpenID client strategy
- **Session Management**: Persistent sessions with PostgreSQL storage
- **User Management**: Automatic user creation and profile synchronization

### Product Extraction Service
- **Supported Platforms**: Amazon (India & US), eBay, Flipkart, Myntra, Nykaa, Ajio, Meesho, Shopclues, Snapdeal
- **Technology**: Cheerio-based web scraping with platform-specific selectors
- **Data Extraction**: Product title, price, images, availability, variants
- **Error Handling**: Comprehensive validation and fallback mechanisms

### Cart Management System
- **CRUD Operations**: Full product lifecycle management
- **Real-time Updates**: Optimistic updates with React Query
- **Quantity Management**: Dynamic quantity adjustments
- **Persistence**: Database-backed cart state

### Rule Engine
- **Automation**: Condition-based product management rules
- **Triggers**: Price changes, availability updates, time-based conditions
- **Actions**: Automated purchasing, notifications, cart modifications
- **Configuration**: User-defined rule creation and management

## Data Flow

1. **User Authentication**: OIDC flow with Replit → Session creation → User profile sync
2. **Product Addition**: URL input → Web scraping → Data extraction → Database storage
3. **Cart Management**: UI interactions → API calls → Database updates → Real-time sync
4. **Rule Processing**: Background evaluation → Condition matching → Action execution
5. **State Synchronization**: Client optimistic updates → Server validation → Database persistence

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **express**: Web server framework
- **@tanstack/react-query**: Client-side state management
- **cheerio**: Web scraping and HTML parsing
- **passport**: Authentication middleware

### UI Dependencies
- **@radix-ui/***: Headless UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **wouter**: Lightweight client-side routing

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for Node.js

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: esbuild bundles server code to `dist/index.js`
3. **Database Migration**: Drizzle migrations apply schema changes
4. **Static Assets**: Frontend assets served from Express

### Environment Configuration
- **Development**: Hot module replacement with Vite middleware
- **Production**: Static file serving with Express
- **Database**: Environment-based connection string configuration
- **Authentication**: Replit-specific OIDC configuration

### Hosting Requirements
- **Node.js**: ES modules support required
- **PostgreSQL**: Neon serverless database
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPLIT_DOMAINS
- **Port Configuration**: Dynamic port binding for cloud deployment

## Changelog
- June 28, 2025: Initial setup with full-stack application
- June 28, 2025: Enhanced shipping estimation with expandable section showing earliest/latest delivery dates and location-based calculations
- June 28, 2025: Implemented anti-bot protection handling with multiple request strategies and manual entry fallback for blocked sites
- June 28, 2025: Added Amazon.com and eBay.com support with USD to INR currency conversion (rate: 83.0)
- June 28, 2025: Enhanced store naming - Amazon.com displays as "Amazon US", Amazon.in as "Amazon India"

## User Preferences

Preferred communication style: Simple, everyday language.