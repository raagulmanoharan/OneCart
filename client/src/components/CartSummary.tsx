import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Zap, AlertCircle, ChevronDown, ChevronUp, Truck, MapPin } from "lucide-react";
import type { Product, Rule } from "@shared/schema";

export default function CartSummary() {
  const [isShippingExpanded, setIsShippingExpanded] = useState(false);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    retry: false,
  });

  const { data: rules = [], isLoading: rulesLoading } = useQuery<Rule[]>({
    queryKey: ["/api/rules"],
    retry: false,
  });

  const calculateSubtotal = () => {
    return products.reduce((total: number, product: Product) => {
      return total + (parseFloat(product.price) * product.quantity);
    }, 0);
  };

  // Get user location for delivery estimation
  const getUserLocation = () => {
    if (userLocation) return userLocation;
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Use a reverse geocoding service or default to major cities
          const { latitude, longitude } = position.coords;
          // For demo purposes, we'll use some common Indian cities
          const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune"];
          const randomCity = cities[Math.floor(Math.random() * cities.length)];
          setUserLocation(randomCity);
        },
        () => {
          // Default to Mumbai if location access denied
          setUserLocation("Mumbai");
        }
      );
    } else {
      setUserLocation("Mumbai");
    }
    return "Detecting...";
  };

  // Calculate delivery estimates based on store and location
  const getDeliveryEstimate = (storeDomain: string, location: string) => {
    const baseDeliveryDays: Record<string, number> = {
      'amazon.in': 2,
      'flipkart.com': 3,
      'myntra.com': 4,
      'nykaa.com': 3,
      'ajio.com': 5,
    };

    // Add extra days for non-metro cities
    const metroCities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad"];
    const extraDays = metroCities.includes(location) ? 0 : 2;
    
    const domain = Object.keys(baseDeliveryDays).find(d => storeDomain.includes(d.split('.')[0]));
    const baseDays = domain ? baseDeliveryDays[domain] : 5;
    
    return baseDays + extraDays;
  };

  // Calculate delivery date range
  const getDeliveryDateRange = () => {
    const location = userLocation || "Mumbai";
    const deliveryDays = products.map(product => 
      getDeliveryEstimate(product.storeDomain, location)
    );
    
    if (deliveryDays.length === 0) return { earliest: null, latest: null };
    
    const minDays = Math.min(...deliveryDays);
    const maxDays = Math.max(...deliveryDays);
    
    const today = new Date();
    const earliest = new Date(today);
    earliest.setDate(today.getDate() + minDays);
    
    const latest = new Date(today);
    latest.setDate(today.getDate() + maxDays);
    
    return { earliest, latest };
  };

  const subtotal = calculateSubtotal();
  const activeRules = rules.filter((rule: Rule) => rule.isActive);
  const currentLocation = getUserLocation();
  const { earliest, latest } = getDeliveryDateRange();

  if (productsLoading || rulesLoading) {
    return (
      <Card className="sticky top-8">
        <CardContent className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-8">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cart Summary</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">₹{subtotal.toFixed(2)}</span>
          </div>
          
          {/* Expandable Shipping Section */}
          <Collapsible open={isShippingExpanded} onOpenChange={setIsShippingExpanded}>
            <CollapsibleTrigger className="w-full">
              <div className="flex justify-between items-center text-sm hover:bg-gray-50 p-2 rounded -mx-2">
                <div className="flex items-center">
                  <Truck className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Estimated Shipping</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-900 mr-2">
                    {products.length > 0 ? "View details" : "No items"}
                  </span>
                  {isShippingExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="pt-2">
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                {/* Location Display */}
                <div className="flex items-center text-xs text-gray-600">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>Delivering to: {currentLocation}</span>
                </div>
                
                {products.length > 0 ? (
                  <>
                    {/* Delivery Date Range */}
                    <div className="space-y-2">
                      {earliest && latest && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-green-600 font-medium">Earliest Delivery:</span>
                            <span className="text-green-600">
                              {earliest.toLocaleDateString('en-IN', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-orange-600 font-medium">Latest Delivery:</span>
                            <span className="text-orange-600">
                              {latest.toLocaleDateString('en-IN', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Store-wise Delivery Estimates */}
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-gray-700 mb-1">By Store:</div>
                      {Object.entries(
                        products.reduce((acc: Record<string, number>, product: Product) => {
                          const storeName = product.storeDomain.includes('amazon') ? 'Amazon India' :
                                           product.storeDomain.includes('flipkart') ? 'Flipkart' :
                                           product.storeDomain.includes('myntra') ? 'Myntra' :
                                           product.storeDomain.includes('nykaa') ? 'Nykaa' :
                                           product.storeDomain.includes('ajio') ? 'Ajio' : product.storeDomain;
                          
                          const deliveryDays = getDeliveryEstimate(product.storeDomain, currentLocation);
                          if (!acc[storeName] || acc[storeName] > deliveryDays) {
                            acc[storeName] = deliveryDays;
                          }
                          return acc;
                        }, {})
                      ).map(([storeName, days]) => (
                        <div key={storeName} className="flex justify-between text-xs">
                          <span className="text-gray-600">{storeName}</span>
                          <span className="text-gray-900">{days} days</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-gray-500 text-center py-2">
                    Add products to see delivery estimates
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between">
              <span className="text-base font-medium text-gray-900">Estimated Total</span>
              <span className="text-base font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Active Rules Display */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Active Rules</h4>
          
          {activeRules.length > 0 ? (
            <div className="space-y-2">
              {activeRules.map((rule: Rule) => (
                <div key={rule.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-800 font-medium">{rule.name}</span>
                  </div>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs">
                      {rule.trigger.replace('_', ' ')}
                    </Badge>
                    {rule.action && (
                      <Badge variant="outline" className="text-xs ml-1">
                        {rule.action.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-2">No rules set up yet</p>
              <p className="text-xs text-gray-400 mb-3">
                Create rules to get notified about price drops, stock changes, and more
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // This will be handled by the cart display component
                  const event = new CustomEvent('openRuleBuilder');
                  window.dispatchEvent(event);
                }}
              >
                Create your first rule
              </Button>
            </div>
          )}
        </div>

        {/* Store Breakdown */}
        {products.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Store Breakdown</h4>
            <div className="space-y-2">
              {Object.entries(
                products.reduce((acc: Record<string, { count: number; total: number }>, product: Product) => {
                  const domain = product.storeDomain;
                  if (!acc[domain]) {
                    acc[domain] = { count: 0, total: 0 };
                  }
                  acc[domain].count += product.quantity;
                  acc[domain].total += parseFloat(product.price) * product.quantity;
                  return acc;
                }, {})
              ).map(([domain, data]) => (
                <div key={domain} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {domain.includes('amazon') ? 'Amazon India' :
                     domain.includes('flipkart') ? 'Flipkart' :
                     domain.includes('myntra') ? 'Myntra' :
                     domain.includes('nykaa') ? 'Nykaa' :
                     domain.includes('ajio') ? 'Ajio' : domain}
                  </span>
                  <span className="text-gray-900">
                    {data.count} items · ₹{data.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
