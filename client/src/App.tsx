import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";

// Lazy-load pages (will be migrated later)
// For now these are placeholders
const HomePage = () => (
  <div className="p-8 text-center text-2xl font-bold">Amadewi Trans - Home</div>
);
const LoginPage = () => (
  <div className="p-8 text-center text-2xl font-bold">Login Page</div>
);
const RegisterPage = () => (
  <div className="p-8 text-center text-2xl font-bold">Register Page</div>
);
const DashboardPage = () => (
  <div className="p-8 text-center text-2xl font-bold">Admin Dashboard</div>
);

function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/dashboard" element={<DashboardPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
