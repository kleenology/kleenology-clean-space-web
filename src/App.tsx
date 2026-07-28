import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import HomeCleaning from "./pages/HomeCleaning";
import OfficeCleaning from "./pages/OfficeCleaning";
import TermsAndConditions from "./pages/TermsAndConditions";
import Booking from "./pages/Booking";
import DeepCleaning from "./pages/DeepCleaning";
import CarpetCleaning from "./pages/CarpetCleaning";
import PostConstructionCleaning from "./pages/PostConstructionCleaning";
import AboutUs from "./pages/AboutUs";
import RiyadhCleaning from "./pages/RiyadhCleaning";
import AdsLanding from "./pages/AdsLanding";
import PremiumLanding from "./pages/PremiumLanding";
import Pricing from "./pages/Pricing";
import SecurityScanner from "./pages/SecurityScanner";
import Blog from "./pages/Blog";
import { PixelTracker } from "@/components/PixelTracker";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { EnhancedTracking } from "@/components/EnhancedTracking";
import { Component, ErrorInfo, ReactNode } from "react";
import React from "react";

const queryClient = new QueryClient();

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#f8f9fa',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h1 style={{ color: '#dc3545', marginBottom: '20px' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#6c757d', marginBottom: '20px' }}>
            We're experiencing technical difficulties. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  console.log("App component is rendering - FRESH DEPLOYMENT FIX");
  
  // Add a simple test to ensure the app is loading
  React.useEffect(() => {
    console.log("App mounted successfully - kleenology.me should work now!");
  }, []);
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <PixelTracker />
          <PerformanceMonitor />
          <BrowserRouter basename="/">
            <EnhancedTracking />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/home-cleaning" element={<HomeCleaning />} />
              <Route path="/office-cleaning" element={<OfficeCleaning />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/deep-cleaning" element={<DeepCleaning />} />
              <Route path="/carpet-cleaning" element={<CarpetCleaning />} />
              <Route path="/post-construction-cleaning" element={<PostConstructionCleaning />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/cleaning-riyadh" element={<RiyadhCleaning />} />
              <Route path="/book-now" element={<AdsLanding />} />
              <Route path="/premium" element={<PremiumLanding />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/scanner" element={<SecurityScanner />} />
              <Route path="/blog" element={<Blog />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
