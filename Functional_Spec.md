# Spectrum 5.0 — Detailed Backend & Functional Specification

This document details the functional mechanics, backend architecture, and integration layers of the Spectrum 5.0 event management platform.

---

## 1. System Constants & Environment Credentials

The following connection strings, API keys, and environment variables are hard-coded/configured into the deployment environment.

### Google Sheets Database Connector (Apps Script WebApp)
- **Execution URL:** `https://script.google.com/macros/s/AKfycbxtCVXriQbKWhJ1BioBOZPthxQOoPthyC-5HwZNJukI8zk7CXcis5IfbXrJ7SXhluUYiw/exec`
- **Spreadsheet API Scope:** `https://www.googleapis.com/auth/spreadsheets`
- **Primary Data Sync Trigger:** Real-time push synchronization triggered by the client-side Firebase listener during registration creation or admin panel edits.

### System Passwords & Access Whitelists
- **Admin Gateway Entry Password:** `secrets@123467`
- **Bootstrap Administrator Google Email:** `i.doshi30@gmail.com`
- **Outbox SMTP / Helpline Email Sender Account:** `i.doshi30@gmail.com`
- **Official UPI Registration ID Destination:** `spectrum26@upi`

### Firebase Applet Configurations (firebase-applet-config.json)
- **Web App API Key:** `AIzaSyBFjQzCZ4K4ieczg3TBFmQL9fm11_wW-6o`
- **Authentication Domain:** `spectrum-1-2026.firebaseapp.com`
- **Database Project Identifier:** `spectrum-1-2026`
- **Cloud Storage Bucket Target:** `spectrum-1-2026.firebasestorage.app`
- **Messaging Sender ID:** `858569440944`
- **Application ID:** `1:858569440944:web:08467e7011553c59260575`
- **Measurement / Analytics tracking ID:** `G-JX7FZ3380Z`
- **Firestore Instance Namespace:** `(default)`

---

## 2. PART I: Public User Side Operations

### 2.1. Feature Matrix (User Facing)

#### Landing Portal
- **Real-Time Countdown:** Continuously calculates and renders the remaining time until September 30, 2026, 09:00:00 AM IST. Tracks days, hours, minutes, and seconds locally.
- **Quest Entrance CTA:** Initiates routing flow redirects to the active tournament schedule and selection matrices.

#### Events Selection Arena
- **Stall Grid Navigator:** Displays the tournament categories (Dual Debug, Singularity Strike, BGMI Tournament, FC 26 Showdown) fetched from Firestore.
- **Roster & Fee Info:** Displays capacities (Solo, Duo, Squad) and entry fees dynamically mapped to Firestore document fields.

#### Registrations Portal (Checkout Flow)
- **Step 1: Identity Collection:** Collects core participant data: name, email address, phone number, and optional college details. 
- **Step 2: Battlefield Selection:** Retrieves the live active events from Firestore (`events` collection).
- **Step 3: Team Roster Builder:**
  - Solo events: Skips additional member collection.
  - Duo events: Captures team name and companion's name.
  - Squad events (e.g., BGMI): Captures squad name and requires input for exactly 3 additional squad members.
- **Step 4: Payment Verification & Reference ID Submission:**
  - Instructs the user to transfer the calculated registration fee to `spectrum26@upi` via manual QR/VPA entry.
  - Requires a mandatory 12-digit UPI transaction reference ID.
  - The backend payload bundles all members and references, checking against existing records in `registrations` collection to prevent duplicate entries based on email/event ID combinations.

#### Champions Board & Gallery
- **Podium Rankings:** Queries the `winners` collection in Firestore to display top rankings filtering by event category.
- **Schedule Feed:** Displays a read-only timeline feed of events grouped by date.

---

## 3. PART II: Administrative Portal Operations (Admin Panel)

### 3.1. Authentication & Security
- **Gate Authentication:** Access to `/supercore` requires inputting the `VITE_ADMIN_GATE_PASSWORD` (`secrets@123467`).
- **Whitelist Enforcement:** Only Google-authenticated emails present in the `adminWhitelist` collection can bypass the Google Login prompt. The bootstrap email (`i.doshi30@gmail.com`) automatically inserts itself into the whitelist if the collection is empty upon the first launch.

### 3.2. User & Accounts Management
- **User Dashboard:** Fetches all records from the `users` collection. Enables administrators to view profiles, delete users, and manually edit contact information.
- **Global Configurator:** Manages global app settings, like overriding the Google Sheet database ID dynamically and triggering manual sync operations.

### 3.3. Event Configuration Manager
- **Dynamic Event Editor:** Admin can create new events, define fee structures (rupees), set capacity rules (1 to 4 players), specify category names, and upload rules or prizes to the `events` collection. Updates reflect instantly on the public Events Selection Arena.

### 3.4. Registration & Payment Verification System
- **Registration Manager:** Aggregates all submitted registrations from the `registrations` collection.
- **Payment Verification Workflow:** 
  - Admin verifies the submitted 12-digit UPI transaction ID against bank records.
  - Admin updates the `paymentStatus` field in Firestore to `APPROVED` or `REJECTED`.
  - **Email Triggers:** Status updates trigger the automated email dispatcher (`sendPaymentVerificationEmail`) via `lib/email.ts` to notify the user.

### 3.5. Google Sheets Synchronization & Audit Logs
- **Audit Logging System:** Every administrative write operation (Approve/Reject Registration, Edit Event, Add Winner, Change App Settings) generates a timestamped record in the `auditLogs` collection.
- **Spreadsheet Autosync:** On every registration change (approval, rejection, creation) or audit log creation, the system makes an HTTP POST request to the Google Apps Script WebApp execution URL. The payload appends a new row to the linked Google Spreadsheet to serve as an immutable offline ledger of transactions.
- **Manual Sync:** A dedicated "Sync to Sheets" button pushes the entire current state of `registrations` and `auditLogs` sequentially to the Google Sheet.

### 3.6. Schedule & Winner Management
- **Schedule Board:** Admin can inject custom schedule blocks (e.g. 10:00 AM - "Registration Desk Opens") into the `schedule` collection.
- **Winner Assignment:** Post-event, admin can add winning team names/individuals and their respective positions (1st, 2nd, 3rd) to the `winners` collection, automatically populating the public Champions Board.

---

## 4. Analytics & Telemetry Implementation

### 4.1. Tracked Metrics (Firebase Analytics)
The system initializes Google Analytics tracking via Measurement ID `G-JX7FZ3380Z`. Functional reasons for tracking include:
- **Registration Funnel Conversion Rate:** Tracking progression through Step 1 (Identity), Step 2 (Event), Step 3 (Team), and Step 4 (Payment). **Reason:** Identifies UX bottlenecks; e.g., if a high percentage of users drop off at Step 3, the team roster UI may be confusing.
- **Event Popularity Heatmap:** Measures individual clicks/views on event cards within the Events Arena. **Reason:** Helps organizers allocate physical venue space, server bandwidth for eSports events, and time slots based on anticipated turnout before payments are fully processed.
- **Payment Drop-off Rate:** Measures the bounce rate at the UPI reference ID submission form. **Reason:** Determines if users are struggling with manual UPI entry, which could warrant pivoting to an automated payment gateway.
- **Admin Audit Telemetry:** Tracks admin login frequencies and sheet sync failures. **Reason:** To monitor administrative activity and detect configuration anomalies early if the offline Google Sheets failover encounters quota limits.
