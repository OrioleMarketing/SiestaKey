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
import Admin from "./pages/Admin";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import Contact from "./pages/Contact";
import BlogIndex from "./pages/BlogIndex";
import BlogPost from "./pages/BlogPost";
import Events from "./pages/Events";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/directory" component={Directory} />
      <Route path="/directory/:category" component={Directory} />
      <Route path="/business/:slug" component={BusinessProfile} />
      <Route path="/claim" component={ClaimBusiness} />
      <Route path="/submit-listing" component={SubmitListing} />
      <Route path="/admin" component={Admin} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/contact" component={Contact} />
      <Route path="/guides" component={BlogIndex} />
      <Route path="/guides/:slug" component={BlogPost} />
      <Route path="/events" component={Events} />
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
