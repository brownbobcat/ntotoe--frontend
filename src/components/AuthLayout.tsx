import React, { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 bg-black relative">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 to-neutral-400 opacity-90"></div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-white max-w-lg">
            <h1 className="text-4xl font-bold mb-6">
              Project Management Made Simple
            </h1>
            <p className="text-xl">
              Streamline your workflow, track tasks, and collaborate with your
              team seamlessly.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Auth Component */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">{title}</h2>
            {subtitle && (
              <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
