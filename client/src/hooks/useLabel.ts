import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { LabelSchema } from "@shared/schema";
import { useState, useEffect } from "react";

export function useLabel() {
  const [labels, setLabels] = useState<any[]>([]);
  
  // Get all labels
  const { data: fetchedLabels = [], isLoading: isLoadingLabels, refetch } = useQuery({
    queryKey: ["/api/labels"],
  });
  
  // Update local state when data is fetched
  useEffect(() => {
    if (fetchedLabels && Array.isArray(fetchedLabels)) {
      setLabels(fetchedLabels);
    } else {
      console.error("Fetched labels is not an array:", fetchedLabels);
    }
  }, [fetchedLabels]);
  
  // Create label mutation
  const createLabelMutation = useMutation({
    mutationFn: async (label: LabelSchema & { imageData: string, fileType: string }) => {
      console.log("Creating label:", label);
      const res = await apiRequest("POST", "/api/labels", label);
      const data = await res.json();
      console.log("Created label:", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("Label created successfully:", data);
      // Add the new label to the local state
      setLabels(prev => [...prev, data]);
      // Invalidate the query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["/api/labels"] });
      refetch();
    },
  });
  
  // Delete label mutation
  const deleteLabelMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/labels/${id}`);
      return res.json();
    },
    onSuccess: (_, id) => {
      // Remove the label from the local state
      setLabels(prev => prev.filter(label => label.id !== id));
      // Invalidate the query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["/api/labels"] });
      refetch();
    },
  });
  
  return {
    labels,
    createLabel: createLabelMutation.mutateAsync,
    deleteLabel: deleteLabelMutation.mutateAsync,
    isLoading: createLabelMutation.isPending || deleteLabelMutation.isPending || isLoadingLabels,
    refetch
  };
}
