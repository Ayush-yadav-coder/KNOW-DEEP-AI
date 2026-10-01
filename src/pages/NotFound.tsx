import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const pathname = location.pathname;
    const lowerPath = pathname.toLowerCase();

    // If route is /home or /HOME, redirect to root '/'
    if (lowerPath === "/home" || lowerPath === "/index") {
      navigate("/", { replace: true });
      return;
    }

    // If upper-case route was accessed, try redirecting to lower-case route
    if (pathname !== lowerPath) {
      navigate(lowerPath, { replace: true });
      return;
    }

    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [location.pathname, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <Link to="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
