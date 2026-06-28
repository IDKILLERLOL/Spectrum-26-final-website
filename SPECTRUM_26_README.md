# Spectrum 26 - Event Management Platform

A production-grade event management platform built with Next.js 16, Firebase, and a sleek black-and-white design system.

## Features

### Public Features
- **Event Discovery**: Browse all available events with detailed information
- **User Registration**: Register for events with pass code generation
- **User Dashboard**: View all registered events and passes
- **Pass Display**: QR codes and pass codes for event entry

### Admin Features
- **Event Management**: Create, read, update events
- **Registration Management**: View all registrations with filtering
- **Gate Verification**: Scan pass codes for attendee check-in
- **Announcements**: Broadcast important updates to attendees
- **Audit Logging**: Track all admin actions

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS v4
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **UI Components**: Custom component library with shadcn/ui foundation
- **Notifications**: React Hot Toast

## Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── events/            # Event CRUD
│   │   ├── registrations/     # Registration operations
│   │   ├── announcements/     # Announcement management
│   │   └── gate/              # Gate verification
│   ├── admin/                 # Admin dashboard
│   ├── dashboard/             # User dashboard
│   ├── gate/                  # Gate verification page
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── components/
│   ├── providers/             # React providers
│   ├── ui/                    # Reusable UI components
│   ├── EventCard.tsx          # Event display component
│   ├── PassCard.tsx           # Registration pass display
│   └── EventsSection.tsx      # Events listing section
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts             # Authentication state
│   ├── useCountdown.ts        # Countdown timer
│   └── useFirestore.ts        # Firestore real-time sync
├── lib/
│   ├── firebase.ts            # Firebase client config
│   ├── firebase-admin.ts      # Firebase admin config
│   ├── firebase-utils.ts      # Firestore utility functions
│   └── helpers.ts             # Helper utilities
├── types/
│   └── spectrum.ts            # TypeScript interfaces
└── middleware.ts              # Next.js middleware

```

## Environment Variables

### Required (Firebase Client)
```
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Required (Firebase Admin)
```
FIREBASE_ADMIN_SDK_KEY=your_admin_service_account_json
FIREBASE_ADMIN_PROJECT_ID=your_project_id
```

### Optional (For future integrations)
```
GOOGLE_OAUTH_CLIENT_ID=your_oauth_id
GOOGLE_OAUTH_CLIENT_SECRET=your_oauth_secret
GMAIL_SERVICE_ACCOUNT_KEY=your_gmail_service_account
GMAIL_FROM_ADDRESS=noreply@spectrum26.com
GOOGLE_SHEETS_WEBHOOK_SECRET=your_webhook_secret
UPI_MERCHANT_ID=your_upi_merchant_id
ADMIN_PASSKEY=your_admin_passkey
SENDGRID_API_KEY=your_sendgrid_api_key
```

## Firebase Schema

### Collections

#### `events`
```typescript
{
  id?: string;
  name: string;
  description: string;
  date: string;              // YYYY-MM-DD format
  startTime: string;         // HH:MM format
  endTime: string;           // HH:MM format
  location: string;
  capacity: number;
  registeredCount: number;
  category: 'workshop' | 'talk' | 'social' | 'other';
  imageUrl?: string;
  createdAt: number;
  updatedAt: number;
}
```

#### `registrations`
```typescript
{
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  userCollege: string;
  eventId: string;
  eventName: string;
  registrationDate: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentId?: string;
  transactionId?: string;
  upiId?: string;
  passCode: string;          // 8-character unique code
  qrCode: string;            // JSON stringified QR data
  checkInTime?: number;      // Timestamp of gate verification
  checkInLocation?: string;
  createdAt: number;
  updatedAt: number;
}
```

#### `announcements`
```typescript
{
  id?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  eventId?: string;
  targetAudience: 'all' | 'registered' | 'admin';
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
}
```

#### `adminWhitelist`
```typescript
{
  id?: string;
  email: string;
  role: 'admin' | 'gate-operator' | 'organizer';
  permissions: string[];
  addedAt: number;
  addedBy: string;
}
```

#### `adminAuditLogs`
```typescript
{
  id?: string;
  adminEmail: string;
  action: string;
  details: Record<string, any>;
  timestamp: number;
  ipAddress?: string;
}
```

### Security Rules (Firestore)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read events
    match /events/{document=**} {
      allow read: if request.auth != null;
    }
    
    // Allow anyone to read announcements
    match /announcements/{document=**} {
      allow read: if request.auth != null;
    }
    
    // Allow users to read their own registrations
    match /registrations/{document=**} {
      allow read: if request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    // Admin access
    match /adminWhitelist/{document=**} {
      allow read: if request.auth.token.admin == true;
    }
    
    match /adminAuditLogs/{document=**} {
      allow read: if request.auth.token.admin == true;
    }
  }
}
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/callback` - OAuth callback (future)
- `POST /api/auth/signout` - Logout

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create event (admin only)
- `GET /api/events/[id]` - Get event details
- `PATCH /api/events/[id]` - Update event (admin only)
- `DELETE /api/events/[id]` - Delete event (admin only)

### Registrations
- `POST /api/registrations` - Create registration
- `GET /api/registrations?passCode=XXX` - Get registration by pass code
- `GET /api/registrations` - List all registrations (admin only)

### Gate Verification
- `POST /api/gate/verify` - Verify pass code at gate

### Announcements
- `GET /api/announcements` - List announcements
- `POST /api/announcements` - Create announcement (admin only)
- `DELETE /api/announcements/[id]` - Delete announcement (admin only)

## Design System

### Colors
- **Background**: Pure black (#000000)
- **Text**: White (#ffffff) and grays (#999999, #666666)
- **Cards**: Dark gray (#111111)
- **Borders**: Subtle gray (#333333)
- **Inputs**: Very dark (#0d0d0d)
- **Status**: Green (#00cc00), Yellow (#cccc00), Red (#cc0000)

### Typography
- **Font Family**: Geist (sans-serif) and Geist Mono
- **Heading Weight**: Bold (700+)
- **Body Weight**: Regular (400)
- **Line Height**: 1.5 (relaxed)

### Components
All components use consistent spacing (24px cards, 10px buttons), rounded corners (6-8px), and semantic status indicators.

## Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy by pushing to main branch

## Security Considerations

- All routes use Firebase Authentication
- Admin routes check `isUserAdmin` status
- Pass codes are 8-character alphanumeric
- Audit logs track all admin actions
- IP addresses are logged for gate verifications
- Environment variables must be added to Vercel

## Future Enhancements

- Google OAuth integration
- Email notifications with SendGrid
- Payment integration (Razorpay/Stripe)
- CSV export for registrations
- QR code scanning mobile app
- Real-time notification system
- Advanced analytics dashboard
- Multi-language support

## Support

For issues and feature requests, please open an issue on GitHub or contact the development team.
