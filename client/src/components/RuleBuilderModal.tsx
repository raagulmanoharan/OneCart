import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Loader2, InfoIcon, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Product, Rule } from "@shared/schema";

interface RuleBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  editingRule?: Rule | null;
  onEditRule?: (rule: Rule) => void;
}

export default function RuleBuilderModal({ isOpen, onClose, products, editingRule, onEditRule }: RuleBuilderModalProps) {
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

  // Get existing rules for the editing interface
  const { data: allRules = [] } = useQuery<Rule[]>({
    queryKey: ["/api/rules"],
    retry: false,
    enabled: isOpen && !editingRule, // Only fetch when modal is open and not editing a specific rule
  });

  // Get rule products if editing
  const { data: ruleProducts = [] } = useQuery<any[]>({
    queryKey: ["/api/rules", editingRule?.id, "products"],
    retry: false,
    enabled: !!editingRule?.id,
  });

  // Reset form when modal opens or when editingRule changes
  useEffect(() => {
    if (!isOpen) return;
    
    if (editingRule) {
      setFormData({
        name: editingRule.name,
        trigger: editingRule.trigger,
        conditionType: editingRule.conditionType || "",
        conditionValue: editingRule.conditionValue || "",
        action: editingRule.action || "",
        selectedProducts: ruleProducts.map((rp: any) => rp.productId) || [],
      });
    } else {
      setFormData({
        name: "",
        trigger: "",
        conditionType: "",
        conditionValue: "",
        action: "",
        selectedProducts: [],
      });
    }
  }, [editingRule?.id, isOpen]); // Removed ruleProducts dependency to prevent loop

  const saveRuleMutation = useMutation({
    mutationFn: async (ruleData: any) => {
      const { selectedProducts, ...rule } = ruleData;
      
      let response;
      if (editingRule) {
        // Update existing rule
        response = await apiRequest("PUT", `/api/rules/${editingRule.id}`, {
          ...rule,
          productIds: selectedProducts,
        });
      } else {
        // Create new rule
        response = await apiRequest("POST", "/api/rules", {
          ...rule,
          productIds: selectedProducts,
        });
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rules", editingRule?.id, "products"] });
      toast({
        title: editingRule ? "Rule updated" : "Rule created",
        description: editingRule ? "Your rule has been updated successfully" : "Your automation rule has been set up successfully",
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
        title: editingRule ? "Failed to update rule" : "Failed to create rule",
        description: error.message || "Could not save automation rule",
        variant: "destructive",
      });
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (ruleId: number) => {
      const response = await apiRequest("DELETE", `/api/rules/${ruleId}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rules"] });
      toast({
        title: "Rule deleted",
        description: "Your automation rule has been removed",
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
        title: "Failed to delete rule",
        description: error.message || "Could not remove automation rule",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (editingRule && confirm("Are you sure you want to delete this rule?")) {
      deleteRuleMutation.mutate(editingRule.id);
    }
  };

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

    saveRuleMutation.mutate(formData);
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
          <DialogTitle>{editingRule ? "Edit Rule" : "Create Rule"}</DialogTitle>
        </DialogHeader>

        {!editingRule && allRules.length > 0 ? (
          // Show existing rules for selection
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Select a rule to edit, or scroll down to create a new one:
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {allRules.map((rule) => (
                <div key={rule.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                     onClick={() => window.location.reload()} // Will be updated to edit specific rule
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{rule.name}</h4>
                      <p className="text-sm text-gray-600">
                        {rule.trigger.replace('_', ' ')} → {rule.action?.replace('_', ' ')}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onEditRule) {
                          onEditRule(rule);
                        }
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Or Create New Rule</h3>
            </div>
          </div>
        ) : null}

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
          <div className="flex justify-between items-center pt-4 border-t">
            <div>
              {editingRule && (
                <Button 
                  type="button" 
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteRuleMutation.isPending}
                >
                  {deleteRuleMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete Rule
                </Button>
              )}
            </div>
            <div className="flex space-x-3">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={saveRuleMutation.isPending || products.length === 0}
              >
                {saveRuleMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {editingRule ? "Update Rule" : "Create Rule"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
