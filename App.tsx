
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import TermsAndServicePage from './pages/TermsAndServicePage';
import PersonalDataPage from './pages/PersonalDataPage';
import SkillsPage from './pages/SkillsPage';
import VerificationPage from './pages/VerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import CreateServicePage from './pages/CreateServicePage';
import ProfilePage from './pages/ProfilePage';
import MyJobsPage from './pages/MyJobsPage';
import ProviderJobsPage from './pages/ProviderJobsPage';
import TimeBankPage from './pages/TimeBankPage';
import AchievementsPage from './pages/AchievementsPage';
import RequestHelpPage from './pages/RequestHelpPage';
import RequestDetailPage from './pages/RequestDetailPage';
import JobsPage from './pages/JobsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PublicServicesPage from './pages/PublicServicesPage';
import TransferCreditsPage from './pages/TransferCreditsPage';
import HistoryPage from './pages/HistoryPage';
import LinkLinePage from './pages/LinkLinePage';

import AuthenticatedLayout from './components/AuthenticatedLayout';
import { UserProvider } from './context/UserContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import TrophyUnlockToast from './components/TrophyUnlockToast';

const App: React.FC = () => {
  // For local development, use no basename
  // For production, you might need to set a specific basename
  const basename = process.env.NODE_ENV === 'production' ? '/timebank' : '/';
  
  return (
    <Router basename={basename}>
      <ToastProvider>
        <NotificationProvider>
          <DataProvider>
            <UserProvider>
              <TrophyUnlockToast />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<TermsAndServicePage />} />
                <Route path="/register/terms" element={<TermsAndServicePage />} />
                <Route path="/register/personal-data" element={<PersonalDataPage />} />
                <Route path="/register/skills" element={<SkillsPage />} />
                <Route path="/register/verification" element={<VerificationPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/services" element={<PublicServicesPage />} />
                <Route path="/link-line" element={<LinkLinePage />} />

                {/* Authenticated Routes */}
                <Route element={<AuthenticatedLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/jobs" element={<JobsPage />} />
                  <Route path="/my-jobs" element={<MyJobsPage />} />
                  <Route path="/provider-jobs" element={<ProviderJobsPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/create" element={<RequestHelpPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/timebank" element={<TimeBankPage />} />
                  <Route path="/timebank/transfer" element={<TransferCreditsPage />} />
                  <Route path="/achievements" element={<AchievementsPage />} />
                  <Route path="/request-help" element={<RequestHelpPage />} />
                  <Route path="/request/:requestId" element={<RequestDetailPage />} />
                </Route>
              </Routes>
            </UserProvider>
          </DataProvider>
        </NotificationProvider>
      </ToastProvider>
    </Router>
  );
};

export default App;
