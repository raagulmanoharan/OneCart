import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, ShoppingCart, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import RuleBuilderModal from "./RuleBuilderModal";
import type { Product, Rule } from "@shared/schema";

export default function CartDisplay() {
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    retry: false,
  });

  const { data: rules = [] } = useQuery<Rule[]>({
    queryKey: ["/api/rules"],
    retry: false,
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Product> }) => {
      const response = await apiRequest("PUT", `/api/products/${id}`, updates);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Update failed",
        description: error.message || "Could not update product",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product removed",
        description: "Product has been removed from your cart",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Remove failed",
        description: error.message || "Could not remove product",
        variant: "destructive",
      });
    },
  });

  // Listen for rule builder events from CartSummary
  useEffect(() => {
    const handleOpenRuleBuilder = () => {
      setEditingRule(null);
      setIsRuleModalOpen(true);
    };

    const handleEditRule = (event: CustomEvent) => {
      const rule = event.detail;
      setEditingRule(rule);
      setIsRuleModalOpen(true);
    };

    window.addEventListener('openRuleBuilder', handleOpenRuleBuilder);
    window.addEventListener('editRule', handleEditRule as EventListener);

    return () => {
      window.removeEventListener('openRuleBuilder', handleOpenRuleBuilder);
      window.removeEventListener('editRule', handleEditRule as EventListener);
    };
  }, []);

  const handleQuantityChange = (product: Product, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateProductMutation.mutate({
      id: product.id,
      updates: { quantity: newQuantity },
    });
  };

  const handleRemoveProduct = (productId: number) => {
    deleteProductMutation.mutate(productId);
  };

  const handleBuyNow = () => {
    // Group products by store and open their original URLs
    const storeGroups = products.reduce((acc: Record<string, Product[]>, product: Product) => {
      if (!acc[product.storeDomain]) {
        acc[product.storeDomain] = [];
      }
      acc[product.storeDomain].push(product);
      return acc;
    }, {});

    Object.entries(storeGroups).forEach(([storeDomain, storeProducts]) => {
      storeProducts.forEach((product) => {
        window.open(product.originalUrl, '_blank');
      });
    });

    toast({
      title: "Opening checkout pages",
      description: "Original product pages have been opened in new tabs",
    });
  };

  // Group products by store domain
  const groupedProducts = products.reduce((acc: Record<string, Product[]>, product: Product) => {
    if (!acc[product.storeDomain]) {
      acc[product.storeDomain] = [];
    }
    acc[product.storeDomain].push(product);
    return acc;
  }, {});

  const getStoreIcon = (domain: string) => {
    if (domain.includes('amazon')) return '🛒';
    if (domain.includes('flipkart')) return '📦';
    if (domain.includes('myntra')) return '👕';
    if (domain.includes('nykaa')) return '💄';
    if (domain.includes('ajio')) return '👗';
    return '🏪';
  };

  const getStoreName = (domain: string) => {
    if (domain.includes('amazon')) return 'Amazon India';
    if (domain.includes('flipkart')) return 'Flipkart';
    if (domain.includes('myntra')) return 'Myntra';
    if (domain.includes('nykaa')) return 'Nykaa';
    if (domain.includes('ajio')) return 'Ajio';
    return domain;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="modern-card animate-in">
        <div className="p-8 border-b border-gray-100/50">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Your Cart</h2>
            <span className="text-sm text-gray-500 font-medium">
              {products.length} {products.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        {products.length === 0 ? (
          <CardContent className="p-6 text-center">
            <div className="py-8">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500">Add products by pasting URLs from supported e-commerce sites above.</p>
            </div>
          </CardContent>
        ) : (
          <>
            {Object.entries(groupedProducts).map(([storeDomain, storeProducts]) => (
              <div key={storeDomain} className="p-6 border-b border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 text-lg">
                    {getStoreIcon(storeDomain)}
                  </div>
                  <h3 className="font-medium text-gray-900">{getStoreName(storeDomain)}</h3>
                  <span className="ml-auto text-sm text-gray-500">
                    {storeProducts.length} {storeProducts.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <div className="space-y-4">
                  {storeProducts.map((product) => (
                    <div key={product.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                      {product.imageUrl && (
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={product.imageUrl} 
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {product.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          ₹{product.price}
                        </p>
                        {product.color && (
                          <Badge variant="outline" className="mt-1 mr-2">
                            {product.color}
                          </Badge>
                        )}
                        {product.size && (
                          <Badge variant="outline" className="mt-1">
                            {product.size}
                          </Badge>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-2">
                            <label className="text-xs text-gray-500">Qty:</label>
                            <Input
                              type="number"
                              min="1"
                              value={product.quantity}
                              onChange={(e) => handleQuantityChange(product, parseInt(e.target.value) || 1)}
                              className="w-16 h-8 text-sm"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveProduct(product.id)}
                            className="text-red-600 hover:text-red-800 h-8"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ₹{(parseFloat(product.price) * product.quantity).toFixed(2)}
                        </p>
                        {product.availability && (
                          <div className="flex items-center mt-1">
                            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                              product.availability.toLowerCase().includes('stock') ? 'bg-green-400' : 'bg-yellow-400'
                            }`}></span>
                            <span className="text-xs text-gray-500">{product.availability}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Cart Actions */}
            <div className="p-6">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Button 
                  disabled
                  className="flex-1 opacity-50 cursor-not-allowed"
                  size="lg"
                  title="Coming soon feature"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Buy Now (Coming Soon)
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsRuleModalOpen(true)}
                  className="flex-1"
                  size="lg"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  {rules.length > 0 ? "Edit Rules" : "Set Up Rules"}
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <RuleBuilderModal 
        isOpen={isRuleModalOpen}
        onClose={() => {
          setIsRuleModalOpen(false);
          setEditingRule(null);
        }}
        products={products}
        editingRule={editingRule}
        onEditRule={(rule) => {
          setEditingRule(rule);
          // Modal is already open, just switch to edit mode
        }}
      />
    </>
  );
}
