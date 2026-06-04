import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Directory from "./pages/Directory";
import BusinessProfile from "./pages/BusinessProfile";
import ClaimBusiness from "./pages/ClaimBusiness";
import SubmitListing from "./pages/SubmitListing";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/directory" component={Directory} />
      <Route path="/directory/:category" component={Directory} />
      <Route path="/business/:slug" component={BusinessProfile} />
      <Route path="/claim" component={ClaimBusiness} />
      <Route path="/submit-listing" component={SubmitListing} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
