import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LendoraProvider } from "@/context/LendoraContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginGate from "./pages/LoginGate";
import DashboardLayout from "./pages/DashboardLayout";
import Portfolio from "./pages/Portfolio";
import Loans from "./pages/Loans";
import Transactions from "./pages/Transactions";
import Markets from "./pages/Markets";
import Settings from "./pages/Settings";
import { AppLayout } from "./components/layout/AppLayout";

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <LendoraProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
              <Route path="/" element={<LoginGate />} />
              <Route path="/dashboard" element={<AppLayout><DashboardLayout /></AppLayout>} />
              <Route path="/portfolio" element={<AppLayout><Portfolio /></AppLayout>} />
              <Route path="/loans" element={<AppLayout><Loans /></AppLayout>} />
              <Route path="/transactions" element={<AppLayout><Transactions /></AppLayout>} />
              <Route path="/markets" element={<AppLayout><Markets /></AppLayout>} />
              <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
              <Route path="/legacy" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LendoraProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
