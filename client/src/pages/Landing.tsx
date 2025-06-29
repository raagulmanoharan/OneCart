import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Package, Settings, Home, ShoppingBag } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="h-6 w-6 text-black" />
          <span className="text-xl font-semibold text-black">OneCart</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-700">
          <a href="#how-it-works" className="hover:text-black transition-colors">How it Works</a>
          <a href="#features" className="hover:text-black transition-colors">Features</a>
          <a href="#pricing" className="hover:text-black transition-colors">Pricing</a>
        </nav>

        <Button 
          onClick={handleLogin}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6"
        >
          Login
        </Button>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-black leading-tight">
                Shop from everywhere.
                <br />
                Buy in one place.
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                A seamless cart that works across all your favorite online stores. Add products, track deals, and set smart purchase rules.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleLogin}
                className="bg-black hover:bg-gray-800 text-white px-8 py-3 text-base font-medium"
              >
                Get Started
              </Button>
              <Button 
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 text-base font-medium"
              >
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative">
            <div className="bg-gray-50 rounded-2xl p-8 relative overflow-hidden">
              {/* Store Logos */}
              <div className="absolute top-4 right-4 space-y-2">
                <div className="bg-white rounded-lg p-2 shadow-sm">
                  <div className="w-8 h-6 bg-orange-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">a</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-2 shadow-sm">
                  <div className="w-8 h-6 bg-black rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">ZARA</span>
                  </div>
                </div>
              </div>

              {/* Product Items */}
              <div className="space-y-4 mb-8">
                <div className="bg-blue-100 rounded-lg p-3 w-16 h-12 flex items-center justify-center">
                  <div className="w-8 h-6 bg-blue-400 rounded"></div>
                </div>
                <div className="bg-blue-100 rounded-lg p-3 w-20 h-16 flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>

              {/* Person Illustration */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 bg-orange-400 rounded-full flex items-center justify-center">
                    <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center">
                      <div className="w-16 h-16 bg-orange-600 rounded-full"></div>
                    </div>
                  </div>
                  {/* Laptop */}
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="w-24 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                      <div className="w-20 h-12 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How it Works Section */}
        <section id="how-it-works" className="mt-32">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Plus className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-black">Add Products</h3>
              <p className="text-gray-600 leading-relaxed">
                Browse any online store and add items directly to OneCart.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <ShoppingCart className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-black">Organize Your Cart</h3>
              <p className="text-gray-600 leading-relaxed">
                See all your saved items from different stores in one place
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Settings className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-black">Buy or Automate</h3>
              <p className="text-gray-600 leading-relaxed">
                Checkout instantly or set rules like "buy when price drops"
              </p>
            </div>
          </div>
        </section>

        {/* Automation Section */}
        <section className="mt-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-black">
                Let OneCart shop for you.
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Build custom rules to automate purchases based on price, shipping, or stock.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  If this product drops below 21,999
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">→</span>
                  <span className="text-gray-900">notify me</span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Set a Rule
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="mt-32 text-center">
          <h2 className="text-4xl font-bold text-black mb-4">
            Let OneCart shop for you.
          </h2>
          <p className="text-xl text-gray-600 mb-16 max-w-2xl mx-auto">
            Build custom rules to automate purchases based on price, shipping, or stock.
          </p>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-black">Holiday Shopping</h3>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Home className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-black">Furnishing a New Home</h3>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-32 text-center">
          <div className="bg-gray-50 rounded-3xl p-16">
            <h2 className="text-3xl font-bold text-black mb-6">
              Ready to simplify your shopping?
            </h2>
            <Button 
              onClick={handleLogin}
              className="bg-black hover:bg-gray-800 text-white px-12 py-4 text-lg font-medium"
            >
              Get Started Free
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}