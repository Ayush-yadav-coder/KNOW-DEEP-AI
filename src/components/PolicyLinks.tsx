import { Link } from "react-router-dom";

interface PolicyLinksProps {
  className?: string;
  showAgreement?: boolean;
}

export function PolicyLinks({ className = "", showAgreement = false }: PolicyLinksProps) {
  return (
    <div className={`text-sm text-muted-foreground ${className}`}>
      {showAgreement && (
        <span>By continuing, you agree to our </span>
      )}
      <Link
        to="/privacy-policy"
        className="text-primary hover:underline font-medium"
      >
        Privacy Policy
      </Link>
      {showAgreement ? " and " : " · "}
      <Link
        to="/terms-of-service"
        className="text-primary hover:underline font-medium"
      >
        Terms of Service
      </Link>
    </div>
  );
}
