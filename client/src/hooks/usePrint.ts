import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface PrintData {
  templateId: number;
  labels: {
    id: number;
    quantity: number;
    date?: string | null; // Her etiket için ayrı tarih
  }[];
  addDate: boolean;
  date: string | null; // Ortak genel tarih (geriye dönük uyumluluk için)
}

export function calcuateDatePosition(labelWidth: number, labelHeight: number) {
  // Formula: Date should be 1.5cm from bottom and 3.0cm from right edge
  const fromBottom = 15; // in mm
  const fromRight = 30; // in mm - Yeni değer: 30mm
  
  return {
    right: `${fromRight}mm`,
    bottom: `${fromBottom}mm`,
  };
}

export function usePrint() {
  // Generate PDF mutation
  const generatePdfMutation = useMutation({
    mutationFn: async (printData: PrintData) => {
      const res = await apiRequest("POST", "/api/print/pdf", printData);
      const blob = await res.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = `labels-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    },
  });
  
  // Önizleme için PDF oluştur
  const previewPdfMutation = useMutation({
    mutationFn: async (printData: PrintData) => {
      try {
        // Önizleme için URL parametresi ile şablon çizgilerini ekleyelim
        const res = await apiRequest("POST", "/api/print/pdf?showGridLines=true", printData);
        const blob = await res.blob();
        
        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Önce bir kullanıcı tıklaması ile PDF'i açmak için bir bağlantı oluşturalım
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.style.display = "none";
        a.textContent = "PDF'i Aç";
        
        // Kullanıcının tıklayabileceği görünür bir bağlantı ekleyelim
        document.body.appendChild(a);
        a.click();
        
        // Biraz bekleyip temizleyelim
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);
        
        return true;
      } catch (error) {
        console.error("Önizleme hatası:", error);
        throw error;
      }
    },
  });
  
  // Print labels directly mutation
  const printLabelsMutation = useMutation({
    mutationFn: async (printData: PrintData) => {
      const res = await apiRequest("POST", "/api/print", printData);
      const blob = await res.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Open a new window for printing
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.onload = function() {
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
            window.URL.revokeObjectURL(url);
          }, 500);
        };
      } else {
        // If popup is blocked, create an iframe for printing
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = url;
        
        iframe.onload = function() {
          // Focus the iframe and print
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          
          // Clean up
          setTimeout(() => {
            document.body.removeChild(iframe);
            window.URL.revokeObjectURL(url);
          }, 1000);
        };
        
        document.body.appendChild(iframe);
      }
      
      return true;
    },
  });
  
  return {
    generatePdf: generatePdfMutation.mutateAsync,
    printLabels: printLabelsMutation.mutateAsync,
    previewPdf: previewPdfMutation.mutateAsync,
    isGeneratingPdf: generatePdfMutation.isPending,
    isPrinting: printLabelsMutation.isPending,
    isPreviewingPdf: previewPdfMutation.isPending,
  };
}
