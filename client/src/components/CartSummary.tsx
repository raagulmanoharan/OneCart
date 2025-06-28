import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, AlertCircle } from "lucide-react";
import type { Product, Rule } from "@shared/schema";

export default function CartSummary() {
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
    retry: false,
  });

  const { data: rules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ["/api/rules"],
    retry: false,
  });

  const calculateSubtotal = () => {
    return products.reduce((total: number, product: Product) => {
      return total + (parseFloat(product.price) * product.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const activeRules = rules.filter((rule: Rule) => rule.isActive);

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
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Estimated Shipping</span>
            <span className="text-gray-900">Varies by store</span>
          </div>
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
