

# 🌍 Travel Booking Platform — Full Build Plan
*B2C OTA combining ShareTrip & BDFare features | Self-hosted on Ubuntu VPS*

---

## 1. Public-Facing Website (B2C Consumer Site)

### Homepage
- Hero section with search widget (tabs: Flight, Hotel, Visa, Holiday, eSIM, Recharge, Pay Bill)
- Flight search: One Way / Round Trip / Multi City with airport autocomplete, date picker, traveller & class selector, fare types (Regular, Student, Umrah)
- Hotel search: Destination, check-in/out dates, rooms & guests
- Visa search: Applying from, travelling to, traveller count, travel dates
- Holiday search: Destination picker with popular destinations
- Exclusive offers carousel with promotional banners
- Popular destinations section
- User reviews/testimonials section
- Footer with accreditations, payment methods, policies

### Flight Results & Booking
- Search results with filters (price, stops, airlines, departure time, duration)
- Sort options (cheapest, fastest, recommended)
- Flight details expand (baggage, layover info, fare rules)
- Passenger details form (adult, child, infant with passport info)
- Booking summary and confirmation page

### Hotel Results & Booking
- Hotel listings with map view, photos, ratings, amenities
- Room selection with pricing
- Guest details and booking confirmation

### Visa Application
- Country-specific visa requirements display
- Document checklist and application form
- Status tracking

### Holiday Packages
- Package listings with itinerary, pricing, inclusions
- Package detail page with day-by-day breakdown
- Booking and inquiry form

---

## 2. Customer Dashboard

### Authentication
- Registration with email and phone number
- Login via email/password + Phone OTP verification
- Password reset flow

### My Bookings
- All bookings list with status tabs: On Hold, Pending, In Progress, Confirmed, Void, Refund, Exchange, Expired, Cancelled, Un-Confirmed
- Booking detail view with full itinerary, passenger info, PNR
- Advanced filters and search by reference number, ticket number, name
- Pagination with configurable items per page

### Ticket Management
- View e-tickets and booking confirmations
- Download tickets as PDF
- Void, refund, and reissue request submission

### My Transactions
- Full transaction ledger showing: entry type (AirTicket, Bank Deposit, Card Payment, Refund, Mobile Banking), order reference, amount, running balance, date, description
- Filter by date range and transaction type

### Manage Payments
- **Make Payment** section with multiple methods:
  - Bank Deposit: select bank account, enter amount, payment date, upload receipt (JPG/PNG/PDF)
  - Bank Transfer: similar flow with transfer details
  - Cheque Deposit: cheque number, issuing bank, issue date, upload slip
  - Mobile Banking (bKash/Nagad): amount entry, gateway redirect
  - Credit/Debit Card: card BIN check for discount eligibility, gateway redirect
- **Payment History**: list of all payment requests with status (Approved/Pending/Rejected), date, channel
- Bank account list display (admin-configured accounts where customers send money)

### Manage Travellers
- Save frequent traveller profiles (name, passport, nationality, DOB)
- Quick-fill during booking

### Profile & Settings
- Personal information management
- Notification preferences
- Points/rewards balance display

---

## 3. Super Admin Dashboard

### Dashboard Overview
- Key metrics: total bookings, revenue, active users, pending payments
- Charts: daily/weekly/monthly booking trends, revenue graphs
- Recent activity feed

### User Management
- Customer list with search, filters, status
- View/edit customer profiles
- Activate/deactivate accounts
- Role-based access control for admin staff

### Booking Management
- All bookings across all customers
- Status management (confirm, void, refund processing)
- Manual booking creation
- Booking modification and reissue processing

### Payment & Finance
- Payment request approvals (verify bank deposits, receipts)
- Transaction ledger across all users
- Revenue reports and reconciliation
- Configure bank accounts for customer deposits
- Set gateway fees and commission rates

### Content Management System (CMS)
- **Pages**: Create/edit static pages (About, Terms, Privacy, Refund Policy, Contact)
- **Promotions & Banners**: Manage homepage carousel, promotional offers with scheduling
- **Destinations**: Manage popular destinations with images, descriptions
- **Holiday Packages**: Create/edit packages with itinerary builder
- **Blog/Articles**: Travel content publishing with SEO fields
- **Media Library**: Upload and manage images, documents
- **Navigation Menu**: Configure site navigation structure
- **Email Templates**: Manage transactional email templates (booking confirmation, payment receipt, etc.)

### Visa Management
- Configure visa requirements per country
- Document checklist management
- Application status tracking and updates

### Reports & Analytics
- Booking reports by date, destination, airline, status
- Revenue reports with breakdowns
- Customer analytics
- Export to CSV/Excel

### System Settings
- Company profile and branding (logo, colors, contact info)
- Payment gateway configuration
- API integration settings (BDFare, Amadeus/Sabre connection management)
- Commission and markup rules
- Notification settings (email, SMS)
- SEO settings (meta tags, sitemap)

---

## 4. Technical Architecture

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Fully responsive (mobile-first)
- No Lovable-specific dependencies — standard React build

### Backend
- Node.js with NestJS framework
- RESTful API architecture
- JWT-based authentication with OTP support
- API-ready architecture for travel supplier integrations (BDFare, Amadeus, Sabre, custom)

### Database
- MySQL/MariaDB with proper schema design
- Tables for: users, bookings, transactions, payments, travellers, content pages, promotions, visa applications, holiday packages, system settings

### Deployment (Ubuntu 24.04 VPS)
- Nginx reverse proxy
- PM2 for Node.js process management
- SSL via Let's Encrypt
- MySQL on same server or separate
- File storage for receipts and documents

---

## 5. Build Phases

**Phase 1** — Foundation: Auth system, database schema, admin dashboard shell, public homepage with search UI

**Phase 2** — Core Booking: Flight search & results (API integration layer), booking flow, customer dashboard with bookings list

**Phase 3** — Payments: Manual payment system with receipt upload, payment approval in admin, transaction ledger

**Phase 4** — Extended Services: Hotels, visa, holiday packages with full booking flows

**Phase 5** — CMS & Enterprise: Full content management, promotions, reports, analytics, email notifications

