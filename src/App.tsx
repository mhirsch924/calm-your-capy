import { Router as Wouter, Switch, Route } from "wouter"; // 1. Note the "as Wouter"
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import SimulationPage from "@/pages/simulation";

// 2. Renamed this to Navigation and wrapped it in Wouter with the base path
function Navigation() {
  return (
    <Wouter base="/calm-your-capy">
      <Switch>
        <Route path="/" component={SimulationPage} />
        <Route component={NotFound} />
      </Switch>
    </Wouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Navigation /> {/* 3. Update the name here too */}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
