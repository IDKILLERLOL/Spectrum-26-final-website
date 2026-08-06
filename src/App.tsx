import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { RequireAuth } from './components/RequireAuth';
import { RequireAdmin } from './components/RequireAdmin';
import { LandingPage } from './pages/LandingPage';
import { EventsPage } from './pages/EventsPage';
import { SchedulePage } from './pages/SchedulePage';
import { LoginPage } from './pages/LoginPage';
import { RegistrationsPage } from './pages/RegistrationsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { AdminGatePage } from './pages/AdminGatePage';
import { RegisterPage } from './pages/RegisterPage';
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
import { ScrollToTop } from './components/ScrollToTop';
import { ContactPage } from './pages/ContactPage';
import { PublicEventDetailPage } from './pages/PublicEventDetailPage';
import { PublicRegistrationsPage } from './pages/PublicRegistrationsPage';
import { MaxErrorProvider } from './contexts/MaxErrorContext';
import { MaxErrorPopup } from './components/MaxErrorPopup';
import { PageCurlProvider } from './components/PageCurlTransition';


import { useLocation } from 'react-router-dom';

function PublicLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div
      className="min-h-screen w-full flex flex-col font-body relative"
      style={{ background: 'transparent', color: 'var(--color-text-primary)' }}
    >
      {/* Dynamic backdrop blur overlay on sub-pages */}
      {!isHome && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(6, 11, 19, 0.65)',
            backdropFilter: 'blur(10px)',
            zIndex: -1,
            pointerEvents: 'none',
          }}
        />
      )}
      <Navbar />
      <main className="flex-1 flex flex-col w-full relative">
        <Outlet />
      </main>
      {!isHome && <Footer />}
    </div>
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
              <Route path="login" element={<LoginPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="event/:id" element={<PublicEventDetailPage />} />
              <Route path="registrations" element={<PublicRegistrationsPage />} />
              <Route path="pass/:id" element={<PublicPassPage />} />
              <Route path="register/:eventId" element={<RegisterPage />} />

              {/* Participant routes — require login */}
              <Route element={<RequireAuth />}>
                <Route path="my-registrations" element={<RegistrationsPage />} />
                <Route path="event-dashboard" element={<EventDetailPage />} />
              </Route>

            </Route>

            {/* Admin gate (standalone, no sidebar) */}
            <Route path="/admin" element={<AdminGatePage />} />

            {/* Admin dashboard routes — require admin session */}
            <Route path="/admin" element={<RequireAdmin />}>
              <Route element={<AdminLayout />}>
                <Route path="registrations" element={<AdminRegistrationsPage />} />
                <Route path="registrations/new" element={<AdminCreateRegistrationPage />} />
                <Route path="registrations/edit/:id" element={<AdminEditRegistrationPage />} />
                <Route path="events" element={<AdminEventsPage />} />
                <Route path="schedule" element={<AdminSchedulePage />} />
                <Route path="winners" element={<AdminWinnersPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="accounts" element={<AdminAccountsPage />} />
                <Route path="audit-log" element={<AuditLogPage />} />

              </Route>
            </Route>
          </Routes>
        </PageCurlProvider>
      </Router>
    </MaxErrorProvider>
  );
}
