

// React Router
import { BrowserRouter, Routes } from "react-router-dom";

// React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// UI / Providers (shadcn)
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";


// Auth Context
import { AuthProvider } from "@/contexts/AuthContext";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase"; 

const queryClient = new QueryClient();
   
const App = () => {
  useEffect(() => {
    const testSupabase = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("❌ Supabase error:", error.message);
      } else {
        console.log("✅ Supabase connected successfully");
        console.log("Session:", data);
      }
    };

    testSupabase();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* your routes stay SAME */}
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
