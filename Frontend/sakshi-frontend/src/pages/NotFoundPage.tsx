import { useNavigate } from "react-router-dom";
import { ErrorLayout } from "@/components/layout/ErrorLayout";
import { Button } from "@/components/ui/buttons";
import { ROUTES } from "@/router/routes";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <ErrorLayout>
      <div className="text-center space-y-4 max-w-sm">
        <p className="text-8xl font-bold text-[hsl(var(--primary))]">404</p>
        <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
        <p className="text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <Button onClick={() => navigate(ROUTES.HOME)}>Go home</Button>
      </div>
    </ErrorLayout>
  );
}
