import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useLabel } from "@/hooks/useLabel";
import FileUpload from "@/components/label/FileUpload";
import LabelCard from "@/components/label/LabelCard";
import { useState, useEffect } from "react";
import { fileToBase64 } from "@/lib/utils";

// Basitleştirilmiş label şeması
const simpleLabelSchema = z.object({
  name: z.string().min(1, { message: "Etiket adı gereklidir" }),
});

export default function LabelDesign() {
  const { toast } = useToast();
  const { labels, createLabel, deleteLabel, isLoading, refetch } = useLabel();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Sayfa yüklendiğinde etiketleri yeniden getir
  useEffect(() => {
    refetch();
  }, [refetch]);
  
  const form = useForm({
    resolver: zodResolver(simpleLabelSchema),
    defaultValues: {
      name: "",
    },
  });
  
  const resetForm = () => {
    form.reset({ name: "" });
    setSelectedFile(null);
    setPreviewImage(null);
  };
  
  const handleFileChange = async (file: File | null) => {
    console.log("handleFileChange çağrıldı:", file ? file.name : "dosya yok");
    setSelectedFile(file);
    
    if (file) {
      try {
        console.log("Dosya base64'e dönüştürülüyor");
        const base64 = await fileToBase64(file);
        console.log("Base64 dönüşümü başarılı, uzunluk:", base64.length);
        setPreviewImage(base64);
      } catch (error) {
        console.error("Dosya önizleme hatası:", error);
        toast({
          title: "Hata",
          description: "Dosya önizlenemedi. Lütfen tekrar deneyin.",
          variant: "destructive",
        });
      }
    } else {
      console.log("Dosya seçilmedi, önizleme temizleniyor");
      setPreviewImage(null);
    }
  };
  
  const onSubmit = async (data: any) => {
    if (!selectedFile) {
      toast({
        title: "Uyarı",
        description: "Lütfen bir dosya seçin.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log("Etiket kaydetme işlemi başlatıldı");
      const base64 = await fileToBase64(selectedFile);
      
      // API'ye gönderilecek veri
      const labelData = {
        name: data.name,
        imageData: base64,
        fileType: selectedFile.type
      };
      
      console.log("API'ye gönderilecek veri:", labelData);
      const result = await createLabel(labelData);
      console.log("API'den dönen sonuç:", result);
      
      toast({
        title: "Etiket kaydedildi",
        description: `"${data.name}" etiketi başarıyla kaydedildi.`,
      });
      
      // Formu sıfırla ve etiketleri yeniden getir
      resetForm();
      refetch();
    } catch (error) {
      console.error("Etiket kaydetme hatası:", error);
      toast({
        title: "Hata",
        description: "Etiket kaydedilemedi. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteLabel = async (id: number) => {
    if (confirm("Bu etiketi silmek istediğinizden emin misiniz?")) {
      try {
        await deleteLabel(id);
        toast({
          title: "Etiket silindi",
          description: "Etiket başarıyla silindi.",
        });
      } catch (error) {
        toast({
          title: "Hata",
          description: "Etiket silinemedi. Lütfen tekrar deneyin.",
          variant: "destructive",
        });
      }
    }
  };
  
  const handlePreviewLabel = (image: string) => {
    setPreviewImage(image);
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Label Design Form */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-gray-900">Etiket Tasarımı Yükleme</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Etiket Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="Etiket adını girin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <FormLabel>Etiket Dosyası (JPG veya PDF)</FormLabel>
                <FileUpload 
                  onFileChange={handleFileChange} 
                  acceptedFileTypes=".jpg,.jpeg,.pdf"
                  maxSizeMB={10}
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Kaydediliyor..." : "Etiketi Kaydet"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Temizle
                </Button>
              </div>
            </form>
          </Form>
          
          {/* Saved Labels List */}
          <div className="mt-8">
            <h3 className="text-md font-medium text-gray-900 mb-2">Kaydedilmiş Etiketler</h3>
            {labels.length === 0 ? (
              <div className="text-sm text-gray-500 p-4 border rounded-md">
                Henüz kaydedilmiş etiket bulunmamaktadır.
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-4">
                {labels.map((label: any) => (
                  <LabelCard
                    key={label.id}
                    label={label}
                    onPreview={() => handlePreviewLabel(label.imageData)}
                    onDelete={() => handleDeleteLabel(label.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Label Preview */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Etiket Önizleme</h2>
          <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center" style={{ height: "500px" }}>
            <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-md h-64 flex items-center justify-center relative">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Etiket önizleme"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <p className="text-gray-400">Henüz bir etiket seçilmedi.</p>
              )}
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p>Etiket dosyalarınız yüksek çözünürlükle saklanır. Yukarıdaki önizleme gerçek boyutunu göstermeyebilir.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
