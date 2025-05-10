import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useTemplate } from "@/hooks/useTemplate";
import { useLabel } from "@/hooks/useLabel";
import { usePrint } from "@/hooks/usePrint";
import PrintPreview from "@/components/print/PrintPreview";
import { calcuateDatePosition } from "@/hooks/usePrint";

export default function Print() {
  const { toast } = useToast();
  const { templates } = useTemplate();
  const { labels } = useLabel();
  const { generatePdf, printLabels, previewPdf } = usePrint();
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedLabels, setSelectedLabels] = useState<{ [key: string]: boolean }>({});
  const [labelQuantities, setLabelQuantities] = useState<{ [key: string]: number }>({});
  const [labelAddDate, setLabelAddDate] = useState<{ [key: string]: boolean }>({});
  const [labelDates, setLabelDates] = useState<{ [key: string]: string }>({});
  const [addDate, setAddDate] = useState<boolean>(false);
  const [printDate, setPrintDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const previewRef = useRef<any>(null);
  
  const handleLabelSelection = (labelId: string, checked: boolean) => {
    setSelectedLabels(prev => ({ ...prev, [labelId]: checked }));
    
    if (checked && !labelQuantities[labelId]) {
      setLabelQuantities(prev => ({ ...prev, [labelId]: 1 }));
    }
    
    // Etiket seçildiğinde varsayılan değerleri atama
    if (checked) {
      if (!labelDates[labelId]) {
        setLabelDates(prev => ({ ...prev, [labelId]: printDate }));
      }
      
      // Her etiket için tarih ekleme seçeneğini varsayılan olarak false yap
      if (labelAddDate[labelId] === undefined) {
        setLabelAddDate(prev => ({ ...prev, [labelId]: false }));
      }
    }
  };
  
  const handleLabelDateChange = (labelId: string, date: string) => {
    setLabelDates(prev => ({ ...prev, [labelId]: date }));
  };
  
  const handleLabelAddDateChange = (labelId: string, checked: boolean) => {
    setLabelAddDate(prev => ({ ...prev, [labelId]: checked }));
  };
  
  const handleQuantityChange = (labelId: string, quantity: number) => {
    setLabelQuantities(prev => ({ ...prev, [labelId]: quantity }));
  };
  
  const handlePrintLabels = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Uyarı",
        description: "Lütfen bir şablon seçin.",
        variant: "destructive",
      });
      return;
    }
    
    const selectedLabelIds = Object.entries(selectedLabels)
      .filter(([_, selected]) => selected)
      .map(([id]) => parseInt(id));
    
    if (selectedLabelIds.length === 0) {
      toast({
        title: "Uyarı",
        description: "Lütfen en az bir etiket seçin.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const printData = {
        templateId: parseInt(selectedTemplate),
        labels: selectedLabelIds.map(id => ({
          id,
          quantity: labelQuantities[id.toString()] || 1,
          date: labelAddDate[id.toString()] ? labelDates[id.toString()] || printDate : null
        })),
        addDate: true,  // Artık her etiketin kendi tarih durumunu kullanıyoruz
        date: printDate
      };
      
      await printLabels(printData);
      
      toast({
        title: "Başarılı",
        description: "Yazdırma işlemi başlatıldı.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Yazdırma işlemi başlatılamadı. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    }
  };
  
  const handlePreviewPdf = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Uyarı",
        description: "Lütfen bir şablon seçin.",
        variant: "destructive",
      });
      return;
    }
    
    const selectedLabelIds = Object.entries(selectedLabels)
      .filter(([_, selected]) => selected)
      .map(([id]) => parseInt(id));
    
    if (selectedLabelIds.length === 0) {
      toast({
        title: "Uyarı",
        description: "Lütfen en az bir etiket seçin.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const printData = {
        templateId: parseInt(selectedTemplate),
        labels: selectedLabelIds.map(id => ({
          id,
          quantity: labelQuantities[id.toString()] || 1,
          date: labelAddDate[id.toString()] ? labelDates[id.toString()] || printDate : null
        })),
        addDate: true,
        date: printDate
      };
      
      await previewPdf(printData);
      
      toast({
        title: "Önizleme",
        description: "PDF önizleme yeni sekmede açıldı.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "PDF önizleme oluşturulamadı. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    }
  };
  
  const handleExportPdf = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Uyarı",
        description: "Lütfen bir şablon seçin.",
        variant: "destructive",
      });
      return;
    }
    
    const selectedLabelIds = Object.entries(selectedLabels)
      .filter(([_, selected]) => selected)
      .map(([id]) => parseInt(id));
    
    if (selectedLabelIds.length === 0) {
      toast({
        title: "Uyarı",
        description: "Lütfen en az bir etiket seçin.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const printData = {
        templateId: parseInt(selectedTemplate),
        labels: selectedLabelIds.map(id => ({
          id,
          quantity: labelQuantities[id.toString()] || 1,
          date: labelAddDate[id.toString()] ? labelDates[id.toString()] || printDate : null
        })),
        addDate: true,
        date: printDate
      };
      
      await generatePdf(printData);
      
      toast({
        title: "Başarılı",
        description: "PDF dosyası oluşturuldu ve indirme işlemi başlatıldı.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "PDF dosyası oluşturulamadı. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    }
  };
  
  // Find selected template object
  const template = templates.find(t => t.id.toString() === selectedTemplate);
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Print Settings Form */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-gray-900">Baskı Ayarları</h2>
          
          <div>
            <Label htmlFor="select-template">Sayfa Şablonu</Label>
            <Select 
              value={selectedTemplate} 
              onValueChange={setSelectedTemplate}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Şablon seçin" />
              </SelectTrigger>
              <SelectContent>
                {templates.length === 0 ? (
                  <SelectItem value="none" disabled>Şablon bulunamadı</SelectItem>
                ) : (
                  templates.map((template: any) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">Etiketler</Label>
            <div className="border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto">
              {labels.length === 0 ? (
                <div className="py-2 text-gray-500 text-sm">Henüz etiket kaydedilmemiş.</div>
              ) : (
                labels.map((label: any) => (
                  <div key={label.id} className="flex flex-col py-2 border-b border-gray-200 last:border-0">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={`label-${label.id}`}
                        checked={selectedLabels[label.id] || false}
                        onCheckedChange={(checked) => handleLabelSelection(label.id.toString(), !!checked)}
                      />
                      <Label 
                        htmlFor={`label-${label.id}`} 
                        className="text-sm text-gray-700 flex-grow"
                      >
                        {label.name}
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`quantity-${label.id}`} className="text-sm text-gray-700">
                          Adet:
                        </Label>
                        <Input
                          id={`quantity-${label.id}`}
                          type="number"
                          value={labelQuantities[label.id] || 1}
                          onChange={(e) => handleQuantityChange(label.id.toString(), parseInt(e.target.value) || 1)}
                          className="w-16 p-1 text-sm"
                          min={1}
                          disabled={!selectedLabels[label.id]}
                        />
                      </div>
                    </div>
                    
                    {selectedLabels[label.id] && (
                      <div className="ml-7 mt-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id={`add-date-${label.id}`}
                            checked={labelAddDate[label.id] || false}
                            onCheckedChange={(checked) => handleLabelAddDateChange(label.id.toString(), !!checked)}
                          />
                          <Label htmlFor={`add-date-${label.id}`} className="text-sm text-gray-700">
                            Bu etikete tarih ekle
                          </Label>
                        </div>
                        
                        {labelAddDate[label.id] && (
                          <div className="flex items-center space-x-2 ml-5">
                            <Label htmlFor={`date-${label.id}`} className="text-sm text-gray-700">
                              Tarih:
                            </Label>
                            <Input
                              id={`date-${label.id}`}
                              type="date"
                              value={labelDates[label.id] || printDate}
                              className="w-36 p-1 text-sm"
                              onChange={(e) => handleLabelDateChange(label.id.toString(), e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="add-date"
                checked={addDate}
                onCheckedChange={(checked) => setAddDate(!!checked)}
              />
              <Label htmlFor="add-date" className="text-sm font-medium text-gray-700">
                Tarih Ekle
              </Label>
            </div>
            
            {addDate && (
              <div className="mt-3">
                <Label htmlFor="print-date" className="block text-sm font-medium text-gray-700">
                  Varsayılan Tarih Seçin
                </Label>
                <Input
                  id="print-date"
                  type="date"
                  value={printDate}
                  onChange={(e) => {
                    setPrintDate(e.target.value);
                    // Tüm seçili etiketler için varsayılan tarihi güncelle
                    Object.entries(selectedLabels)
                      .filter(([_, selected]) => selected)
                      .forEach(([id]) => {
                        handleLabelDateChange(id, e.target.value);
                      });
                  }}
                  className="mt-1 block w-full"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Tarih, etiketin sağ kenarından 3,0 cm içeride ve alt kenardan 1,5 cm yukarıda yazdırılacaktır.
                  Her etiket için ayrı tarih belirleyebilirsiniz.
                </p>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3 pt-4">
            <Button onClick={handlePrintLabels}>
              Yazdır
            </Button>
            <Button variant="outline" onClick={handlePreviewPdf}>
              Önizleme
            </Button>
            <Button variant="secondary" onClick={handleExportPdf}>
              PDF Olarak Kaydet
            </Button>
          </div>
        </div>
        
        {/* Print Preview */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Baskı Önizleme</h2>
          
          <PrintPreview
            ref={previewRef}
            template={template}
            selectedLabels={Object.entries(selectedLabels)
              .filter(([_, selected]) => selected)
              .map(([id]) => {
                const label = labels.find((l: any) => l.id.toString() === id);
                return {
                  ...label,
                  quantity: labelQuantities[id] || 1,
                  date: labelAddDate[id] ? labelDates[id] || printDate : null
                };
              })}
            addDate={true} // Her etiket kendi addDate değerini kullanacak
            date={printDate}
          />
          
          <div className="mt-4 text-sm text-gray-500">
            <p>Yukarıdaki önizleme, yazdırılacak etiketlerin yaklaşık düzenini gösterir. Gerçek baskı farklılık gösterebilir.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
