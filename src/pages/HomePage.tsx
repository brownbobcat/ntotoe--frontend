import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const HomePage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">
            Jira Clone Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
            <Button variant="outline" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Your Tasks</h2>
          <p className="text-gray-600">
            Welcome to your Jira Clone dashboard! This is a placeholder for your
            task management interface.
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* To Do Column */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-3 text-gray-700">To Do</h3>
              <div className="space-y-2">
                <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                  <div className="text-sm font-medium">
                    Implement API endpoints
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    High priority
                  </div>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                  <div className="text-sm font-medium">
                    Create user auth flow
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Medium priority
                  </div>
                </div>
              </div>
            </div>

            {/* In Progress Column */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-3 text-gray-700">In Progress</h3>
              <div className="space-y-2">
                <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                  <div className="text-sm font-medium">
                    Design dashboard layout
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Low priority</div>
                </div>
              </div>
            </div>

            {/* Done Column */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-3 text-gray-700">Done</h3>
              <div className="space-y-2">
                <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                  <div className="text-sm font-medium">
                    Set up project repository
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Completed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
