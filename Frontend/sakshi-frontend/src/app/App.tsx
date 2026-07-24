import { AppProviders }  from "./providers";
import { AppRouter }     from "@/router";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { DemoBanner }    from "@/components/common/DemoBanner";
import { AIBackground }   from "@/components/background/AIBackground";

/**
 * Root application component.
 * Order: ErrorBoundary → DemoBanner → Providers → Router
 */
export function App() {
  return (
    <ErrorBoundary>
      <AIBackground />
      <DemoBanner />
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </ErrorBoundary>
  );
}
