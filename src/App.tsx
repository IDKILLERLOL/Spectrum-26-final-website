import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { RequireAuth } from './components/RequireAuth';
import { RequireAdmin } from './components/RequireAdmin';
import { LandingPage } from './pages/LandingPage';
import { EventsPage } from './pages/EventsPage';
import { SchedulePage } from './pages/SchedulePage';
import { AdminGatePage } from './pages/AdminGatePage';
import { RegisterPage } from './pages/RegisterPage';
import QuestBoardPage from './pages/register/page';
import RegisterInfoStep from './pages/register/info/page';
import RegisterEventStep from './pages/register/event/page';
import RegisterTeamStep from './pages/register/team/page';
import RegisterPaymentStep from './pages/register/payment/page';
import RegisterConfirmationPage from './pages/register/confirmation/page';
import { AdminEventsPage } from './pages/AdminEventsPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminWinnersPage } from './pages/AdminWinnersPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { AdminRegistrationsPage } from './pages/AdminRegistrationsPage';
import { AdminSchedulePage } from './pages/AdminSchedulePage';
import { PublicPassPage } from './pages/PublicPassPage';
import { AdminEditRegistrationPage } from './pages/AdminEditRegistrationPage';
import { AdminCreateRegistrationPage } from './pages/AdminCreateRegistrationPage';
import { WinnersPage } from './pages/WinnersPage';
import { GalleryPage } from './pages/GalleryPage';
import { AdminAccountsPage } from './pages/AdminAccountsPage';
import { AdminGlobalDetailsPage } from './pages/AdminGlobalDetailsPage';
import { SponsorsPage } from './pages/SponsorsPage';
import { ScrollToTop } from './components/ScrollToTop';
import { ContactPage } from './pages/ContactPage';
import { PublicEventDetailPage } from './pages/PublicEventDetailPage';
import { PublicRegistrationsPage } from './pages/PublicRegistrationsPage';
import { MaxErrorProvider } from './contexts/MaxErrorContext';
import { MaxErrorPopup } from './components/MaxErrorPopup';
import { PageCurlProvider } from './components/PageCurlTransition';


import { useLocation } from 'react-router-dom';

import FlagshipLayout from './pages/layout';

function PublicLayout() {
  return (
    <FlagshipLayout>
      <Outlet />
    </FlagshipLayout>
  );
}

function AdminLayout() {
  return (
    <div
      className="min-h-screen w-full flex flex-col overflow-hidden font-body admin-theme"
      style={{ background: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}
    >
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 flex flex-col relative overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <MaxErrorProvider>
      <Router>
        <PageCurlProvider>
          <ScrollToTop />
          <MaxErrorPopup />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="winners" element={<WinnersPage />} />
              <Route path="gallery" element={<GalleryPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="event/:id" element={<PublicEventDetailPage />} />
              <Route path="registrations" element={<PublicRegistrationsPage />} />
              <Route path="pass/:id" element={<PublicPassPage />} />
              <Route path="register/:eventId" element={<RegisterPage />} />
              <Route path="register" element={<QuestBoardPage />} />
              <Route path="register/info" element={<RegisterInfoStep />} />
              <Route path="register/event" element={<RegisterEventStep />} />
              <Route path="register/team" element={<RegisterTeamStep />} />
              <Route path="register/payment" element={<RegisterPaymentStep />} />
              <Route path="register/confirmation" element={<RegisterConfirmationPage />} />
              <Route path="sponsors" element={<SponsorsPage />} />

            </Route>

            {/* Admin gate (standalone, no sidebar) */}
            <Route path="/supercore" element={<AdminGatePage />} />

            {/* Admin dashboard routes — require admin session */}
            <Route path="/supercore" element={<RequireAdmin />}>
              <Route element={<AdminLayout />}>
                <Route path="registrations" element={<AdminRegistrationsPage />} />
                <Route path="registrations/new" element={<AdminCreateRegistrationPage />} />
                <Route path="registrations/edit/:id" element={<AdminEditRegistrationPage />} />
                <Route path="events" element={<AdminEventsPage />} />
                <Route path="schedule" element={<AdminSchedulePage />} />
                <Route path="winners" element={<AdminWinnersPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="accounts" element={<AdminAccountsPage />} />
                <Route path="global-details" element={<AdminGlobalDetailsPage />} />
                <Route path="audit-log" element={<AuditLogPage />} />

              </Route>
            </Route>
          </Routes>
        </PageCurlProvider>
      </Router>
    </MaxErrorProvider>
  );
}
