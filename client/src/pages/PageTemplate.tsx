import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { templateSchema } from "@shared/schema";
import { useTemplate } from "@/hooks/useTemplate";
import TemplatePreview from "@/components/template/TemplatePreview";

const defaultValues = {
  name: "",
  topMargin: 4,
  bottomMargin: 4,
  leftMargin: 4,
  rightMargin: 4,
  horizontalSpacing: 3,
  verticalSpacing: 0,
  labelWidth: 63.5,
  labelHeight: 72,
  columns: 3,
  rows: 4,
};

export default function PageTemplate() {
  const { toast } = useToast();
  const { templates, createTemplate, deleteTemplate, loadTemplate, isLoading } = useTemplate();
  
  const form = useForm({
    resolver: zodResolver(templateSchema),
    defaultValues,
  });
  
  const onSubmit = async (data: any) => {
    try {
      await createTemplate(data);
      toast({
        title: "Şablon kaydedildi",
        description: `"${data.name}" şablonu başarıyla kaydedildi.`,
      });
      form.reset(defaultValues);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Şablon kaydedilemedi. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    }
  };
  
  const handleLoadTemplate = (template: any) => {
    form.reset(template);
    toast({
      title: "Şablon yüklendi",
      description: `"${template.name}" şablonu yüklendi.`,
    });
  };
  
  const handleDeleteTemplate = async (id: number) => {
    if (confirm("Bu şablonu silmek istediğinizden emin misiniz?")) {
      try {
        await deleteTemplate(id);
        toast({
          title: "Şablon silindi",
          description: "Şablon başarıyla silindi.",
        });
      } catch (error) {
        toast({
          title: "Hata",
          description: "Şablon silinemedi. Lütfen tekrar deneyin.",
          variant: "destructive",
        });
      }
    }
  };
  
  const resetForm = () => {
    form.reset(defaultValues);
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Template Form */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-gray-900">Sayfa Şablonu Ayarları</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şablon Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="Şablon adını girin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="topMargin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Üst Boşluk (mm)</FormLabel>
                      <FormControl>
                        <Input 
                          type="text" 
                          inputMode="decimal"
                          {...field} 
                          value={field.value}
                          onChange={(e) => {
                            // Virgülü noktaya çevir
                            const value = e.target.value.replace(",", ".");
                            // Geçerli bir sayı ise state'i güncelle
                            if (!isNaN(parseFloat(value)) || value === "" || value === ".") {
                              field.onChange(value === "" ? 0 : parseFloat(value));
                            }
                          }} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bottomMargin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alt Boşluk (mm)</FormLabel>
                      <FormControl>
                        <Input 
                          type="text" 
                          inputMode="decimal"
                          {...field} 
                          value={field.value}
                          onChange={(e) => {
                            // Virgülü noktaya çevir
                            const value = e.target.value.replace(",", ".");
                            // Geçerli bir sayı ise state'i güncelle
                            if (!isNaN(parseFloat(value)) || value === "" || value === ".") {
                              field.onChange(value === "" ? 0 : parseFloat(value));
                            }
                          }} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="leftMargin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sol Boşluk (mm)</FormLabel>
                      <FormControl>
                        <Input 
                          type="text" 
                          inputMode="decimal"
                          {...field} 
                          value={field.value}
                          onChange={(e) => {
                            // Virgülü noktaya çevir
                            const value = e.target.value.replace(",", ".");
                            // Geçerli bir sayı ise state'i güncelle
                            if (!isNaN(parseFloat(value)) || value === "" || value === ".") {
                              field.onChange(value === "" ? 0 : parseFloat(value));
                            }
                          }} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="rightMargin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sağ Boşluk (mm)</FormLabel>
                      <FormControl>
                        <Input 
                          type="text" 
                          inputMode="decimal"
                          {...field} 
                          value={field.value}
                          onChange={(e) => {
                            const value = e.target.value.replace(",", ".");
                            if (!isNaN(parseFloat(value)) || value === "" || value === ".") {
                              field.onChange(value === "" ? 0 : parseFloat(value));
                            }
                          }} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="horizontalSpacing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yatay Boşluk (mm)</FormLabel>
                      <FormControl>
                        <Input 
                          type="text" 
                          inputMode="decimal"
                          {...field} 
                          value={field.value}
                          onChange={(e) => {
                            const value = e.target.value.replace(",", ".");
                            if (!isNaN(parseFloat(value)) || value === "" || value === ".") {
                              field.onChange(value === "" ? 0 : parseFloat(value));
                            }
                          }} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="verticalSpacing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dikey Boşluk (mm)</FormLabel>
                      <FormControl>
                        <Input 
                          type="text" 
                          inputMode="decimal"
                          {...field} 
                          value={field.value}
                          onChange={(e) => {
                            const value = e.target.value.replace(",", ".");
                            if (!isNaN(parseFloat(value)) || value === "" || value === ".") {
                              field.onChange(value === "" ? 0 : parseFloat(value));
                            }
                          }} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="labelWidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Etiket Genişliği (mm)</FormLabel>
                      <FormControl>
                        <Input 
                          type="text" 
                          inputMode="decimal"
                          {...field} 
                          value={field.value}
                          onChange={(e) => {
                            const value = e.target.value.replace(",", ".");
                            if (!isNaN(parseFloat(value)) || value === "" || value === ".") {
                              field.onChange(value === "" ? 0 : parseFloat(value));
                            }
                          }} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="labelHeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Etiket Yüksekliği (mm)</FormLabel>
                      <FormControl>
                        <Input 
                          type="text" 
                          inputMode="decimal"
                          {...field} 
                          value={field.value}
                          onChange={(e) => {
                            const value = e.target.value.replace(",", ".");
                            if (!isNaN(parseFloat(value)) || value === "" || value === ".") {
                              field.onChange(value === "" ? 0 : parseFloat(value));
                            }
                          }} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="columns"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sütun Sayısı (Yatay)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min={1}
                          max={10}
                          {...field} 
                          value={field.value}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value >= 1 && value <= 10) {
                              field.onChange(value);
                            }
                          }} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="rows"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Satır Sayısı (Dikey)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min={1}
                          max={20}
                          {...field} 
                          value={field.value}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value >= 1 && value <= 20) {
                              field.onChange(value);
                            }
                          }} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Kaydediliyor..." : "Şablonu Kaydet"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Temizle
                </Button>
              </div>
            </form>
          </Form>
          
          {/* Saved Templates List */}
          <div className="mt-8">
            <h3 className="text-md font-medium text-gray-900 mb-2">Kaydedilmiş Şablonlar</h3>
            <div className="mt-3 border rounded-md overflow-hidden">
              {templates.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                  Henüz kaydedilmiş şablon bulunmamaktadır.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {templates.map((template: any, index: number) => (
                    <li key={template.id} className={`px-4 py-3 flex justify-between items-center ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                      <span className="font-medium text-sm">{template.name}</span>
                      <div className="flex space-x-2">
                        <button 
                          className="text-primary hover:text-primary-dark text-sm font-medium"
                          onClick={() => handleLoadTemplate(template)}
                        >
                          Yükle
                        </button>
                        <button 
                          className="text-error hover:text-red-700 text-sm font-medium"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          Sil
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        
        {/* Template Preview */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Önizleme</h2>
          <TemplatePreview
            topMargin={form.watch('topMargin')}
            bottomMargin={form.watch('bottomMargin')}
            leftMargin={form.watch('leftMargin')}
            rightMargin={form.watch('rightMargin')}
            horizontalSpacing={form.watch('horizontalSpacing')}
            verticalSpacing={form.watch('verticalSpacing')}
            labelWidth={form.watch('labelWidth')}
            labelHeight={form.watch('labelHeight')}
            columns={form.watch('columns')}
            rows={form.watch('rows')}
          />
          <div className="mt-4 text-sm text-gray-500">
            <p>A4 sayfa boyutu (210mm x 297mm) gösterilmektedir. Etiketler ve boşluklar girdiğiniz değerlere göre düzenlenmektedir.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
