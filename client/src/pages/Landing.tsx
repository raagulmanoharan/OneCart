import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, Sparkles, ArrowRight, Globe, Zap } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100/20 to-slate-200/20"></div>
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.15) 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }}
        ></div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center">
            <ShoppingCart className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-medium text-slate-900 tracking-tight">OneCart</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
          <a href="#platforms" className="hover:text-slate-900 transition-colors">Platforms</a>
          <a href="#automation" className="hover:text-slate-900 transition-colors">Automation</a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 py-20 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center space-y-8 max-w-4xl">
          <div className="space-y-6">
            <h1 className="text-6xl md:text-7xl font-light text-slate-900 tracking-tight leading-none">
              UNIFIED
              <br />
              <span className="font-medium">SHOPPING</span>
            </h1>
            
            <div className="w-24 h-px bg-slate-300 mx-auto"></div>
            
            <p className="text-xl text-slate-600 font-light max-w-2xl mx-auto leading-relaxed">
              Aggregate products from multiple e-commerce platforms 
              <br />
              into a single, intelligent shopping cart
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button 
              onClick={handleLogin}
              className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-8 py-3 text-base rounded-xl transition-all duration-200 flex items-center gap-2 group"
            >
              Start Shopping
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="ghost"
              className="text-slate-600 hover:text-slate-900 font-medium px-8 py-3 text-base"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full max-w-4xl">
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-lg">
            <div className="text-3xl font-light text-slate-900 mb-2">5+</div>
            <div className="text-sm font-medium text-slate-600 uppercase tracking-wide">Platforms</div>
            <p className="text-sm text-slate-500 mt-2">Supported e-commerce sites</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-lg">
            <div className="text-3xl font-light text-slate-900 mb-2">∞</div>
            <div className="text-sm font-medium text-slate-600 uppercase tracking-wide">Products</div>
            <p className="text-sm text-slate-500 mt-2">Unlimited cart capacity</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-lg">
            <div className="text-3xl font-light text-slate-900 mb-2">24/7</div>
            <div className="text-sm font-medium text-slate-600 uppercase tracking-wide">Automation</div>
            <p className="text-sm text-slate-500 mt-2">Smart purchasing rules</p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-24 w-full max-w-6xl" id="features">
          
          
          
        </div>

        {/* Platform Showcase */}
        <div className="mt-24 w-full max-w-6xl" id="platforms">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-slate-900 mb-4">Supported Platforms</h2>
            <div className="w-16 h-px bg-slate-300 mx-auto"></div>
          </div>
          
          <div className="bg-white/30 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
              <div className="text-center">
                <div className="text-lg font-medium text-slate-700">Amazon</div>
                <div className="text-xs text-slate-500 mt-1">India & US</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-slate-700">Flipkart</div>
                <div className="text-xs text-slate-500 mt-1">India</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-slate-700">Myntra</div>
                <div className="text-xs text-slate-500 mt-1">Fashion</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-slate-700">Nykaa</div>
                <div className="text-xs text-slate-500 mt-1">Beauty</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-slate-700">Ajio</div>
                <div className="text-xs text-slate-500 mt-1">Lifestyle</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
            Ready to simplify your shopping?
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-12 py-4 text-lg rounded-xl transition-all duration-200"
          >
            Get Started Free
          </Button>
        </div>
      </main>
    </div>
  );
}