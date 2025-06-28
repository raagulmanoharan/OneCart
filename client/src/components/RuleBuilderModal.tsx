import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, InfoIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Product } from "@shared/schema";

interface RuleBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

export default function RuleBuilderModal({ isOpen, onClose, products }: RuleBuilderModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    trigger: "",
    conditionType: "",
    conditionValue: "",
    action: "",
    selectedProducts: [] as number[],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createRuleMutation = useMutation({
    mutationFn: async (ruleData: any) => {
      const { selectedProducts, ...rule } = ruleData;
      const response = await apiRequest("POST", "/api/rules", {
        ...rule,
        productIds: selectedProducts,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rules"] });
      toast({
        title: "Rule created",
        description: "Your automation rule has been set up successfully",
      });
      handleClose();
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
        title: "Failed to create rule",
        description: error.message || "Could not create automation rule",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setFormData({
      name: "",
      trigger: "",
      conditionType: "",
      conditionValue: "",
      action: "",
      selectedProducts: [],
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.trigger || !formData.action) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.selectedProducts.length === 0) {
      toast({
        title: "No products selected",
        description: "Please select at least one product for this rule",
        variant: "destructive",
      });
      return;
    }

    createRuleMutation.mutate(formData);
  };

  const handleProductSelection = (productId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: checked
        ? [...prev.selectedProducts, productId]
        : prev.selectedProducts.filter(id => id !== productId)
    }));
  };

  const triggerOptions = [
    { value: "price_drop", label: "Price drops" },
    { value: "availability", label: "Item comes in stock" },
    { value: "fast_shipping", label: "Fast shipping available" },
    { value: "specific_date", label: "Specific date arrives" },
    { value: "low_stock", label: "Item is low in stock" },
  ];

  const conditionOptions = [
    { value: "price_below", label: "Price is below" },
    { value: "price_drop_percentage", label: "Price drops by %" },
    { value: "delivery_days", label: "Delivery within days" },
    { value: "stock_level", label: "Stock level" },
  ];

  const actionOptions = [
    { value: "notify", label: "Send notification" },
    { value: "highlight", label: "Highlight in cart" },
    { value: "email", label: "Send email alert" },
    { value: "mark_urgent", label: "Mark as urgent" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Rule</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rule Name */}
          <div>
            <Label htmlFor="ruleName">Rule Name *</Label>
            <Input
              id="ruleName"
              placeholder="e.g., Buy when price drops"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1"
            />
          </div>

          {/* Trigger Section */}
          <div>
            <Label>When... *</Label>
            <Select
              value={formData.trigger}
              onValueChange={(value) => setFormData(prev => ({ ...prev, trigger: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select trigger" />
              </SelectTrigger>
              <SelectContent>
                {triggerOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Condition Section */}
          <div>
            <Label>If...</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
              <Select
                value={formData.conditionType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, conditionType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Value"
                value={formData.conditionValue}
                onChange={(e) => setFormData(prev => ({ ...prev, conditionValue: e.target.value }))}
              />
            </div>
          </div>

          {/* Action Section */}
          <div>
            <Label>Then... *</Label>
            <Select
              value={formData.action}
              onValueChange={(value) => setFormData(prev => ({ ...prev, action: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                {actionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Alert className="mt-2">
              <InfoIcon className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Note: Automatic purchasing will be available in future versions
              </AlertDescription>
            </Alert>
          </div>

          {/* Apply to Products */}
          <div>
            <Label>Apply to Products *</Label>
            {products.length > 0 ? (
              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`product-${product.id}`}
                      checked={formData.selectedProducts.includes(product.id)}
                      onCheckedChange={(checked) => handleProductSelection(product.id, checked as boolean)}
                    />
                    <Label 
                      htmlFor={`product-${product.id}`}
                      className="text-sm text-gray-700 line-clamp-1 flex-1 cursor-pointer"
                    >
                      {product.title}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <Alert className="mt-2">
                <AlertDescription>
                  No products in cart. Add products first to create rules.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createRuleMutation.isPending || products.length === 0}
            >
              {createRuleMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Create Rule
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
