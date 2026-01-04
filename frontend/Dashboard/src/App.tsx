import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginGate from "./pages/LoginGate";
import DashboardLayout from "./pages/DashboardLayout";
import Portfolio from "./pages/Portfolio";
import Loans from "./pages/Loans";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import { MainLayout } from "./components/layout/MainLayout";

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
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LoginGate />} />
              <Route path="/dashboard" element={<MainLayout><DashboardLayout /></MainLayout>} />
              <Route path="/portfolio" element={<MainLayout><Portfolio /></MainLayout>} />
              <Route path="/loans" element={<MainLayout><Loans /></MainLayout>} />
              <Route path="/transactions" element={<MainLayout><Transactions /></MainLayout>} />
              <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
              <Route path="/legacy" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
