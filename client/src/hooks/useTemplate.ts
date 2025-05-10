import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { TemplateSchema } from "@shared/schema";

export function useTemplate() {
  // Get all templates
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["/api/templates"],
  });
  
  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (template: TemplateSchema) => {
      const res = await apiRequest("POST", "/api/templates", template);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
    },
  });
  
  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/templates/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
    },
  });
  
  // Load template by id (primarily for client-side state management)
  const loadTemplate = (template: any) => {
    return template;
  };
  
  return {
    templates,
    createTemplate: createTemplateMutation.mutateAsync,
    deleteTemplate: deleteTemplateMutation.mutateAsync,
    loadTemplate,
    isLoading: createTemplateMutation.isPending || deleteTemplateMutation.isPending || isLoadingTemplates,
  };
}
