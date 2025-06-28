import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function ProductUrlInput() {
  const [url, setUrl] = useState("");
  const [extractedProduct, setExtractedProduct] = useState<any>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualProduct, setManualProduct] = useState({
    title: "",
    price: "",
    imageUrl: "",
  });
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
      
      // Pre-populate store domain for manual entry if needed
      try {
        const domain = new URL(url).hostname.replace('www.', '');
        setManualProduct(prev => ({ ...prev, storeDomain: domain }));
      } catch {}
      
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
      resetForms();
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

  const handleManualAddToCart = () => {
    if (!manualProduct.title || !manualProduct.price || !url) {
      toast({
        title: "Missing information",
        description: "Please fill in the title and price",
        variant: "destructive",
      });
      return;
    }

    try {
      const domain = new URL(url).hostname.replace('www.', '');
      
      addToCartMutation.mutate({
        title: manualProduct.title,
        price: manualProduct.price.replace(/[^\d.,]/g, ''),
        originalUrl: url,
        imageUrl: manualProduct.imageUrl,
        storeDomain: domain,
        quantity: 1,
      });
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please provide a valid product URL",
        variant: "destructive",
      });
    }
  };

  const resetForms = () => {
    setUrl("");
    setExtractedProduct(null);
    setShowManualEntry(false);
    setManualProduct({ title: "", price: "", imageUrl: "" });
  };

  return (
    <Card className="mb-8 modern-card animate-in">
      <CardContent className="p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">Add Product to Cart</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="productUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Product URL
            </Label>
            <div className="flex space-x-3">
              <Input
                id="productUrl"
                type="url"
                placeholder="Paste product URL from Amazon US/India, eBay, Flipkart, Myntra, Nykaa, Ajio..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 modern-input h-12 text-base px-4 rounded-xl border-gray-200/80 focus:border-primary/30 transition-all duration-200"
                disabled={extractMutation.isPending}
              />
              <Button 
                onClick={handleExtract}
                disabled={extractMutation.isPending || !url.trim()}
                className="h-12 px-8 rounded-xl font-medium bg-gray-900 hover:bg-gray-800 transition-all duration-200"
              >
                {extractMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Extract"
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2 font-medium">
              Supports Amazon US/India, eBay, Flipkart, Myntra, Nykaa, Ajio + more
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

          {/* Error State with Manual Entry Option */}
          {extractMutation.isError && !showManualEntry && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>Unable to extract product details automatically</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowManualEntry(true)}
                    className="ml-4"
                  >
                    Add Manually
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Manual Entry Form */}
          {showManualEntry && (
            <Alert className="border-blue-200 bg-blue-50">
              <Plus className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Add Product Manually</h4>
                  <p className="text-xs text-gray-600 mb-3">
                    Enter the product details from the original page:
                  </p>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="manualTitle" className="text-xs">Product Title *</Label>
                      <Input
                        id="manualTitle"
                        placeholder="Enter product title"
                        value={manualProduct.title}
                        onChange={(e) => setManualProduct(prev => ({ ...prev, title: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="manualPrice" className="text-xs">Price *</Label>
                      <Input
                        id="manualPrice"
                        placeholder="e.g., 1999 or ₹1,999"
                        value={manualProduct.price}
                        onChange={(e) => setManualProduct(prev => ({ ...prev, price: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="manualImage" className="text-xs">Image URL (optional)</Label>
                      <Input
                        id="manualImage"
                        placeholder="Paste image URL"
                        value={manualProduct.imageUrl}
                        onChange={(e) => setManualProduct(prev => ({ ...prev, imageUrl: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        onClick={handleManualAddToCart}
                        disabled={addToCartMutation.isPending || !manualProduct.title || !manualProduct.price}
                        size="sm"
                        className="flex-1"
                      >
                        {addToCartMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Add to Cart"
                        )}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setShowManualEntry(false)}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
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
