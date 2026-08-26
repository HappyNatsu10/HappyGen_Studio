import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import MarketingLayout from './components/marketing/MarketingLayout.jsx';
import LandingPage from './pages/marketing/LandingPage.jsx';
import PricingPage from './pages/marketing/PricingPage.jsx';
import FaqPage from './pages/marketing/FaqPage.jsx';
import DownloadPage from './pages/marketing/DownloadPage.jsx';
import ContactPage from './pages/marketing/ContactPage.jsx';
import WalkthroughPage from './pages/marketing/WalkthroughPage.jsx';
import PrivacyPage from './pages/marketing/PrivacyPage.jsx';
import TermsPage from './pages/marketing/TermsPage.jsx';
import './index.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <MarketingLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "pricing", element: <PricingPage /> },
      { path: "faq", element: <FaqPage /> },
      { path: "download", element: <DownloadPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "walkthrough", element: <WalkthroughPage /> },
      { path: "privacy", element: <PrivacyPage /> },
      { path: "terms", element: <TermsPage /> },
      // I'll leave a simple features placeholder mapped to LandingPage for now
      { path: "features", element: <LandingPage /> },
    ]
  },
  {
    path: "/studio/*",
    element: <App />, // The existing application
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
