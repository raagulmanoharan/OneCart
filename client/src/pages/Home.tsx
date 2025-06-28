import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ProductUrlInput from "@/components/ProductUrlInput";
import CartDisplay from "@/components/CartDisplay";
import CartSummary from "@/components/CartSummary";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">OneCart</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:bg-gray-50"
                onClick={() => window.location.href = '/api/logout'}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add Product Section and Cart Display */}
          <div className="lg:col-span-2">
            <ProductUrlInput />
            <CartDisplay />
          </div>

          {/* Cart Summary Sidebar */}
          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
