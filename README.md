# Network Clipboard - 网络剪切板

A full-stack Next.js application that provides a synchronized clipboard across all your devices. Store text, images, and files securely with encryption.

## Features

- 🔐 **User Authentication** - Secure login/register system with JWT sessions
- 🔄 **Real-time Sync** - Access your clipboard from any device
- 🏠 **Room-based Organization** - Create and join rooms to organize content
- 🔒 **Encrypted Storage** - All clipboard content is encrypted using AES
- 📁 **Multiple Formats** - Support for text, images, and files
- 📱 **Responsive Design** - Works on mobile and desktop
- 🔑 **API Access** - REST API for third-party integration
- 📊 **Category Management** - Organize clipboard items with categories

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS 4
- **Backend**: Next.js API Routes (Serverless)
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT with httpOnly cookies
- **Encryption**: AES encryption using crypto-js
- **File Upload**: Local file storage

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd clip
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and change the secret keys for production:
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-production-jwt-secret"
ENCRYPTION_KEY="your-production-encryption-key"
```

4. Set up the database:
```bash
pnpm prisma migrate dev
pnpm prisma generate
```

5. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
clip/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── clipboard/     # Clipboard CRUD endpoints
│   │   │   ├── rooms/         # Room management endpoints
│   │   │   ├── upload/        # File upload endpoint
│   │   │   └── external/      # Third-party API endpoints
│   │   ├── clipboard/         # Clipboard page
│   │   ├── rooms/             # Rooms list page
│   │   ├── api-docs/          # API documentation
│   │   └── ...
│   ├── components/
│   │   ├── auth/              # Auth components (Login, Register)
│   │   ├── clipboard/         # Clipboard manager component
│   │   ├── rooms/             # Room list component
│   │   ├── ui/                # Reusable UI components
│   │   └── Navbar.tsx
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client
│   │   ├── auth.ts            # Authentication utilities
│   │   ├── encryption.ts      # Encryption utilities
│   │   └── room.ts            # Room utilities
│   └── middleware.ts          # Auth middleware
└── public/
    └── uploads/               # Uploaded files
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `GET/POST /api/auth/api-key` - Get/regenerate API key

### Rooms

- `GET /api/rooms` - Get all user's rooms
- `POST /api/rooms` - Create new room
- `GET /api/rooms/[id]` - Get room details
- `DELETE /api/rooms/[id]` - Delete room
- `PUT /api/rooms/[id]` - Leave room
- `POST /api/rooms/join` - Join room with code

### Clipboard

- `GET /api/clipboard?roomId=ID` - Get clipboard items
- `POST /api/clipboard` - Create clipboard item
- `PUT /api/clipboard` - Update clipboard item
- `DELETE /api/clipboard?id=ID` - Delete clipboard item

### Upload

- `POST /api/upload` - Upload file/image

### External API (for third-party integration)

- `GET /api/external/rooms` - Get all rooms (requires API key)
- `GET /api/external/clipboard?roomId=ID` - Get clipboard items
- `POST /api/external/clipboard` - Create clipboard item
- `DELETE /api/external/clipboard?id=ID` - Delete clipboard item

## Usage

### Registration & Login

1. Click "Register" to create a new account
2. Save your API key (shown after registration)
3. Login with your credentials

### Creating Rooms

1. Go to "Rooms" page
2. Click "Create Room"
3. Enter room name and description
4. Share the room code with others

### Joining Rooms

1. Go to "Rooms" page
2. Click "Join Room"
3. Enter the 6-character room code

### Managing Clipboard

1. Enter a room from the rooms list
2. Add text in the text area and click "Add Text"
3. Upload files using "Upload File" button
4. Organize items with categories
5. Edit or delete items as needed

### API Usage

Include your API key in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://your-domain.com/api/external/clipboard?roomId=ROOM_ID"
```

Example JavaScript:
```javascript
const API_KEY = "YOUR_API_KEY";
const BASE_URL = "https://your-domain.com";

// Get clipboard items
const response = await fetch(`${BASE_URL}/api/external/clipboard?roomId=ROOM_ID`, {
  headers: {
    "Authorization": `Bearer ${API_KEY}`
  }
});
const data = await response.json();
```

## Security

- Passwords are hashed using bcrypt
- Clipboard content is encrypted using AES
- JWT tokens are stored in httpOnly cookies
- API keys are required for third-party access
- Room isolation ensures data privacy

## Production Deployment

1. Set strong secret keys in `.env.local`:
   - `JWT_SECRET`
   - `ENCRYPTION_KEY`

2. Build the application:
```bash
pnpm build
```

3. Start the production server:
```bash
pnpm start
```

Or deploy to Vercel:
```bash
vercel
```

## Database Schema

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  username  String   @unique
  password  String
  apiKey    String   @unique
  rooms     RoomMember[]
  clipboard ClipboardItem[]
}

model Room {
  id          String   @id @default(uuid())
  name        String
  description String?
  code        String   @unique
  ownerId     String
  members     RoomMember[]
  clipboard   ClipboardItem[]
}

model ClipboardItem {
  id          String   @id @default(uuid())
  roomId      String
  userId      String
  type        String   // text, image, file
  content     String   // Encrypted
  title       String?
  category    String?
  meta        String?  // Encrypted metadata
}
```

## License

MIT
