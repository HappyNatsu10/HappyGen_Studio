import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import MarketingLayout from './components/marketing/MarketingLayout'
import LandingPage from './pages/marketing/LandingPage'
import DownloadPage from './pages/marketing/DownloadPage'
import FaqPage from './pages/marketing/FaqPage'
import ContactPage from './pages/marketing/ContactPage'
import WalkthroughPage from './pages/marketing/WalkthroughPage'
import PrivacyPage from './pages/marketing/PrivacyPage'
import TermsPage from './pages/marketing/TermsPage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<MarketingLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="download" element={<DownloadPage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="walkthrough" element={<WalkthroughPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>,
)
