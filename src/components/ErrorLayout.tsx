import React, { ReactNode } from "react";

interface ErrorLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  illustration?: ReactNode;
}

const ErrorLayout: React.FC<ErrorLayoutProps> = ({
  children,
  title,
  subtitle,
  illustration,
}) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left side - Custom illustration or image */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-50 relative flex-col items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-indigo-50 opacity-70"></div>
        <div className="relative z-10 flex flex-col items-center justify-center">
          {illustration || (
            <div className="text-blue-600 text-9xl font-extrabold">404</div>
          )}
          <div className="mt-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
            {subtitle && (
              <p className="mt-2 text-xl text-gray-600">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* Right side - Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile view title (shown only on small screens) */}
          <div className="block lg:hidden text-center mb-8">
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

export default ErrorLayout;
