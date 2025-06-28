import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Package, Zap, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">OneCart</h1>
            </div>
            <Button onClick={() => window.location.href = '/api/login'}>
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Universal Shopping Cart for
            <span className="text-primary"> Indian E-commerce</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Aggregate products from Amazon India, Flipkart, Myntra, Nykaa, and Ajio into one unified cart. 
            Set smart rules for automated purchasing and never miss a deal again.
          </p>
          <Button 
            size="lg" 
            className="px-8 py-4 text-lg"
            onClick={() => window.location.href = '/api/login'}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Get Started Free
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Package className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Multi-Store Cart</h3>
              <p className="text-gray-600">
                Add products from any supported e-commerce site by simply pasting the URL. 
                We'll extract all the details automatically.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Rules</h3>
              <p className="text-gray-600">
                Set up automated rules for price drops, stock availability, and shipping options. 
                Get notified when conditions are met.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure & Fast</h3>
              <p className="text-gray-600">
                Your data is secure and product information is extracted in under 3 seconds 
                for 80% of supported sites.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Supported Sites */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Supported Sites</h2>
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500">
            <div className="text-lg font-medium">Amazon India</div>
            <div className="text-lg font-medium">Flipkart</div>
            <div className="text-lg font-medium">Myntra</div>
            <div className="text-lg font-medium">Nykaa</div>
            <div className="text-lg font-medium">Ajio</div>
          </div>
        </div>
      </div>
    </div>
  );
}
