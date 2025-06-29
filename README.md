# OneCart - Universal E-commerce Shopping Cart

A unified shopping cart application that aggregates products from multiple Indian e-commerce platforms into a single cart with automated purchasing rules.

## Features

- **Multi-Platform Integration**: Supports Amazon India, Flipkart, Myntra, Nykaa, Ajio, and more
- **Product URL Extraction**: Automatically extracts product details from e-commerce URLs
- **Real-Time Currency Conversion**: USD to INR conversion for international sites
- **Automated Rules Engine**: Set up conditions for price drops, availability, and more
- **Modern UI**: Glass-morphism design with Inter font and smooth animations
- **Secure Authentication**: Email-based authentication system

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for development and building
- **Wouter** for client-side routing
- **TanStack React Query** for server state management
- **Radix UI** with shadcn/ui components
- **Tailwind CSS** for styling

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** with PostgreSQL
- **Passport.js** for authentication
- **Cheerio** for web scraping
- **Neon** serverless PostgreSQL

## Getting Started

### Prerequisites

- Node.js 20+ 
- PostgreSQL database
- Environment variables (see below)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   DATABASE_URL=your_postgresql_connection_string
   SESSION_SECRET=your_session_secret_key
   ```

4. Push database schema:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run check` - Type checking

## Git Setup

The project is already initialized with Git. To add your files and make your first commit:

```bash
# Check status
git status

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: OneCart shopping cart application"

# Add remote repository (replace with your repo URL)
git remote add origin https://github.com/yourusername/onecart.git

# Push to remote
git push -u origin main
```

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities
├── server/                 # Express backend
│   ├── services/           # Business logic
│   └── routes.ts           # API routes
├── shared/                 # Shared types and schemas
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details