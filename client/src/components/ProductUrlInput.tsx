import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function ProductUrlInput() {
  const [url, setUrl] = useState("");
  const [extractedProduct, setExtractedProduct] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const extractMutation = useMutation({
    mutationFn: async (productUrl: string) => {
      const response = await apiRequest("POST", "/api/products/extract", { url: productUrl });
      return await response.json();
    },
    onSuccess: (data) => {
      setExtractedProduct(data);
      toast({
        title: "Product extracted successfully",
        description: "Review the details and add to your cart",
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
        title: "Extraction failed",
        description: error.message || "Could not extract product information",
        variant: "destructive",
      });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await apiRequest("POST", "/api/products", productData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setExtractedProduct(null);
      setUrl("");
      toast({
        title: "Product added to cart",
        description: "Your product has been successfully added",
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
        title: "Failed to add product",
        description: error.message || "Could not add product to cart",
        variant: "destructive",
      });
    },
  });

  const handleExtract = () => {
    if (!url.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a product URL",
        variant: "destructive",
      });
      return;
    }
    extractMutation.mutate(url.trim());
  };

  const handleAddToCart = () => {
    if (!extractedProduct) return;
    
    addToCartMutation.mutate({
      title: extractedProduct.title,
      price: extractedProduct.price,
      originalUrl: url,
      imageUrl: extractedProduct.imageUrl,
      storeDomain: extractedProduct.storeDomain,
      color: extractedProduct.color,
      size: extractedProduct.size,
      availability: extractedProduct.availability,
      quantity: 1,
    });
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Product to Cart</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="productUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Product URL
            </Label>
            <div className="flex space-x-2">
              <Input
                id="productUrl"
                type="url"
                placeholder="Paste product URL from Amazon, Flipkart, Myntra, Nykaa, or Ajio..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                disabled={extractMutation.isPending}
              />
              <Button 
                onClick={handleExtract}
                disabled={extractMutation.isPending || !url.trim()}
              >
                {extractMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Extract"
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Supported sites: Amazon India, Flipkart, Myntra, Nykaa, Ajio
            </p>
          </div>

          {/* Loading State */}
          {extractMutation.isPending && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Extracting product information...
              </AlertDescription>
            </Alert>
          )}

          {/* Error State */}
          {extractMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {extractMutation.error.message || "Unable to extract product information. Please check the URL and try again."}
              </AlertDescription>
            </Alert>
          )}

          {/* Success State with Product Preview */}
          {extractedProduct && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="mt-2">
                  <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg bg-white">
                    {extractedProduct.imageUrl && (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={extractedProduct.imageUrl} 
                          alt="Product" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {extractedProduct.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        ₹{extractedProduct.price}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {extractedProduct.storeDomain}
                      </p>
                    </div>
                    <Button 
                      onClick={handleAddToCart}
                      disabled={addToCartMutation.isPending}
                      size="sm"
                    >
                      {addToCartMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Add to Cart"
                      )}
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
