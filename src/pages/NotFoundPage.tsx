import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../contexts/AuthContext";
import NotFoundIllustration from "@/components/NotFoundIllustration";

const NotFoundPage: React.FC = () => {
  const { user } = useAuth();

  const homeLink = user ? "/" : "/login";
  const homeText = user ? "Back to Home" : "Back to Login";

  return (
    <AuthLayout
      title="404 - Page Not Found"
      subtitle="The page you're looking for doesn't exist or has been moved."
    >
      <div className="flex flex-col items-center justify-center space-y-6">
        <NotFoundIllustration />

        <div className="text-center">
          <p className="text-gray-600 mb-8">
            We can't seem to find the page you're looking for.
          </p>
        </div>

        <div className="space-y-4 w-full max-w-xs">
          <Button asChild className="w-full">
            <Link to={homeLink}>{homeText}</Link>
          </Button>

          {user && (
            <Button asChild variant="outline" className="w-full">
              <Link to="/help">Contact Support</Link>
            </Button>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default NotFoundPage;
