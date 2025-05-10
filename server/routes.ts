import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { PDFDocument, rgb, StandardFonts, PDFName } from "pdf-lib";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { templateSchema, labelSchema } from "@shared/schema";
import { toNumber } from "@/lib/utils";

// Create temporary directory if it doesn't exist
const tempDir = path.join(import.meta.dirname, "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Setup multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG and PDF are allowed.'));
    }
  }
});

// Print data validation schema
const printDataSchema = z.object({
  templateId: z.number(),
  labels: z.array(z.object({
    id: z.number(),
    quantity: z.number().min(1),
    date: z.string().nullable().optional(), // Her etiket için ayrı tarih
  })),
  addDate: z.boolean(),
  date: z.string().nullable(), // Genel tarih (geriye dönük uyumluluk için)
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Templates API
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getAllTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Error fetching templates" });
    }
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const validatedData = templateSchema.parse(req.body);
      
      // Convert numeric values to strings for the database
      const templateData = {
        name: validatedData.name,
        topMargin: String(validatedData.topMargin),
        bottomMargin: String(validatedData.bottomMargin),
        leftMargin: String(validatedData.leftMargin),
        rightMargin: String(validatedData.rightMargin),
        horizontalSpacing: String(validatedData.horizontalSpacing),
        verticalSpacing: String(validatedData.verticalSpacing),
        labelWidth: String(validatedData.labelWidth),
        labelHeight: String(validatedData.labelHeight),
        columns: validatedData.columns || 3,
        rows: validatedData.rows || 4,
      };
      
      const template = await storage.createTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid template data", errors: error.errors });
      } else {
        console.error("Template creation error:", error);
        res.status(500).json({ message: "Error creating template" });
      }
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getTemplate(id);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Error fetching template" });
    }
  });

  app.delete("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTemplate(id);
      
      if (!success) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json({ message: "Template deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting template" });
    }
  });

  // Labels API
  app.get("/api/labels", async (req, res) => {
    try {
      const labels = await storage.getAllLabels();
      res.json(labels);
    } catch (error) {
      res.status(500).json({ message: "Error fetching labels" });
    }
  });

  app.post("/api/labels", async (req, res) => {
    try {
      console.log("Label kaydetme isteği alındı");
      const { name, imageData, fileType } = req.body;
      
      // Validate the input data
      if (!name || !imageData || !fileType) {
        console.error("Eksik alanlar:", { name: !!name, imageData: !!imageData, fileType: !!fileType });
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      console.log(`Label oluşturuluyor: ${name}, dosya tipi: ${fileType}`);
      
      // Create the label
      const label = await storage.createLabel({
        name,
        imageData,
        fileType
      });
      
      console.log(`Label başarıyla oluşturuldu: ${label.id}`);
      res.status(201).json(label);
    } catch (error) {
      console.error("Label oluşturma hatası:", error);
      res.status(500).json({ message: "Error creating label" });
    }
  });

  app.get("/api/labels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const label = await storage.getLabel(id);
      
      if (!label) {
        return res.status(404).json({ message: "Label not found" });
      }
      
      res.json(label);
    } catch (error) {
      res.status(500).json({ message: "Error fetching label" });
    }
  });

  app.delete("/api/labels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteLabel(id);
      
      if (!success) {
        return res.status(404).json({ message: "Label not found" });
      }
      
      res.json({ message: "Label deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting label" });
    }
  });

  // Print API
  app.post("/api/print/pdf", async (req, res) => {
    try {
      const printData = printDataSchema.parse(req.body);
      const showGridLines = req.query.showGridLines === 'true'; // URL parametresiyle çizgileri gösterme seçeneği
      
      // Get template
      const template = await storage.getTemplate(printData.templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Get labels
      const labelPromises = printData.labels.map(async (item) => {
        const label = await storage.getLabel(item.id);
        if (!label) return null;
        
        return {
          ...label,
          quantity: item.quantity,
          date: item.date // Her etiket için ayrı tarih
        };
      });
      
      const labels = (await Promise.all(labelPromises)).filter(Boolean);
      
      // Generate PDF
      const pdfDoc = await generateLabelPDF(template, labels, printData.addDate, printData.date, showGridLines);
      
      // PDF dosyasını 1:1 ölçekte kaydetme ayarları
      const pdfOptions = {
        // PDF dosyasının tam ölçekte görüntülenmesi için gereken meta verileri ekleyelim
        // PDF görüntüleme ölçeğini 100% olarak ayarla
        addDefaultPage: false,
        useObjectStreams: false
      };
      
      // Convert PDF to buffer
      const pdfBytes = await pdfDoc.save(pdfOptions);
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=labels-${new Date().toISOString().slice(0, 10)}.pdf`);
      // Tam ölçek (100%) görüntülenmeyi desteklemek için ek başlık
      res.setHeader('X-PDF-Scale', '1.0');
      
      // Send PDF
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid print data", errors: error.errors });
      } else {
        console.error(error);
        res.status(500).json({ message: "Error generating PDF" });
      }
    }
  });

  app.post("/api/print", async (req, res) => {
    try {
      const printData = printDataSchema.parse(req.body);
      
      // Get template
      const template = await storage.getTemplate(printData.templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Get labels
      const labelPromises = printData.labels.map(async (item) => {
        const label = await storage.getLabel(item.id);
        if (!label) return null;
        
        return {
          ...label,
          quantity: item.quantity,
          date: item.date // Her etiket için ayrı tarih
        };
      });
      
      const labels = (await Promise.all(labelPromises)).filter(Boolean);
      
      // Generate PDF - yazdırma için şablon çizgilerini gösterme
      const pdfDoc = await generateLabelPDF(template, labels, printData.addDate, printData.date, false);
      
      // PDF dosyasını 1:1 ölçekte kaydetme ayarları
      const pdfOptions = {
        // PDF dosyasının tam ölçekte görüntülenmesi için gereken meta verileri ekleyelim
        // PDF görüntüleme ölçeğini 100% olarak ayarla
        addDefaultPage: false,
        useObjectStreams: false
      };
      
      // Convert PDF to buffer
      const pdfBytes = await pdfDoc.save(pdfOptions);
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      // Tam ölçek (100%) görüntülenmeyi desteklemek için ek başlık
      res.setHeader('X-PDF-Scale', '1.0');
      
      // Send PDF for printing
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid print data", errors: error.errors });
      } else {
        console.error(error);
        res.status(500).json({ message: "Error generating print job" });
      }
    }
  });

  // Helper function to generate PDF
  async function generateLabelPDF(template: any, labels: any[], addDate: boolean, date: string | null, showGridLines: boolean = false) {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Set up page size (A4)
    const pageWidth = 210; // mm
    const pageHeight = 297; // mm
    
    // Convert mm to points (1 mm = 2.83465 points)
    const mmToPoints = 2.83465;
    
    // Template margin/size değerlerinin sayısal değerlere dönüştürülmesi
    // Tüm değerler string olarak geldiği için sayısal değere çeviriyoruz
    const templateValues = {
      topMargin: toNumber(template.topMargin),
      bottomMargin: toNumber(template.bottomMargin),
      leftMargin: toNumber(template.leftMargin),
      rightMargin: toNumber(template.rightMargin),
      horizontalSpacing: toNumber(template.horizontalSpacing),
      verticalSpacing: toNumber(template.verticalSpacing),
      labelWidth: toNumber(template.labelWidth),
      labelHeight: toNumber(template.labelHeight),
      columns: template.columns ? toNumber(template.columns) : 3,
      rows: template.rows ? toNumber(template.rows) : 4
    };
    
    console.log("Şablon Değerleri:", templateValues);
    console.log("Ham Şablon Verileri:", template);
    console.log("Satır:", templateValues.rows, "Sütun:", templateValues.columns);
    
    // Şablondan alınan satır ve sütun sayısı değerlerini kullan
    // Kullanıcının tanımladığı etiket düzeni
    const labelsPerRow = toNumber(templateValues.columns);  // Sütun sayısı
    const labelsPerColumn = toNumber(templateValues.rows); // Satır sayısı
    
    // PDF boyutunda sorun olmaması için üst ve alt kenar boşluklarını kontrol et
    // Toplam kullanılan dikey alanı hesaplayalım ve sayfa dışına taşma olup olmadığını kontrol edelim
    const totalVerticalUsage = toNumber(templateValues.topMargin) + (labelsPerColumn * toNumber(templateValues.labelHeight)) + 
      ((labelsPerColumn - 1) * toNumber(templateValues.verticalSpacing)) + toNumber(templateValues.bottomMargin);
    
    console.log(`Toplam Dikey Kullanım: ${totalVerticalUsage}mm, Sayfa Yüksekliği: ${pageHeight}mm`);
    
    // Şablonun tasarlandığı şekilde tam olarak uygulanması için ek marj kullanmıyoruz
    // Kullanıcı isteği: Etiket yerleşimleri şablon sayfasında tasarlandığı şekilde yapılacak
    const pageSafetyMarginTop = 0; // Ek marj kullanılmıyor
    
    // Flatten labels with quantities
    const labelsToRender: any[] = [];
    labels.forEach(label => {
      for (let i = 0; i < label.quantity; i++) {
        labelsToRender.push(label);
      }
    });
    
    // Calculate number of pages needed
    const labelsPerPage = labelsPerRow * labelsPerColumn;
    const totalPages = Math.ceil(labelsToRender.length / labelsPerPage);
    
    // Add pages and place labels
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      // Sayfayı tam ölçekli (100%) olarak ayarlamak için A4 boyutunda bir sayfa ekleyelim
      // Standart A4 boyutları: 210mm x 297mm
      // Ölçekleme sorununu önlemek için PDF ölçekli sayfayla gönderilecek
      const page = pdfDoc.addPage([pageWidth * mmToPoints, pageHeight * mmToPoints]);
      
      // Sayfanın ölçeklendirme sorunlarını önlemek için sayfa ayarları
      // Media box: PDF'in boyutunu belirler (başlangıç X, başlangıç Y, genişlik, yükseklik)
      page.setMediaBox(0, 0, pageWidth * mmToPoints, pageHeight * mmToPoints);
      
      // Crop box: Görüntüleme alanını belirler
      page.setCropBox(0, 0, pageWidth * mmToPoints, pageHeight * mmToPoints);
      
      // Bleed, Trim ve ArtBox: Baskı için önemli alanları tanımlar
      page.setBleedBox(0, 0, pageWidth * mmToPoints, pageHeight * mmToPoints);
      page.setTrimBox(0, 0, pageWidth * mmToPoints, pageHeight * mmToPoints);
      page.setArtBox(0, 0, pageWidth * mmToPoints, pageHeight * mmToPoints);
      
      // Yazdırma ölçeğinin %100 olmasını sağlamak için görünüm bilgilerini ayarla
      // PDF'in sayfa özelliklerine ek meta veriler ekle
      page.setSize(pageWidth * mmToPoints, pageHeight * mmToPoints);
      
      // Varsayılan görünüm ölçeğini ayarla - PDF ölçeklendirme yapmasın 1:1 ölçekte olsun
      // PDF'in yazdırma özelliklerini değiştiriyoruz (PrintScaling=None)
      pdfDoc.catalog.set(PDFName.of('ViewerPreferences'), pdfDoc.context.obj({
        PrintScaling: PDFName.of('None')
      }));
      
      // Get labels for this page
      const pageLabels = labelsToRender.slice(
        pageIndex * labelsPerPage,
        (pageIndex + 1) * labelsPerPage
      );
      
      // Place each label on the page
      for (let labelIndex = 0; labelIndex < pageLabels.length; labelIndex++) {
        const label = pageLabels[labelIndex];
        
        // Calculate position
        const row = Math.floor(labelIndex / labelsPerRow);
        const col = labelIndex % labelsPerRow;
        
        // Şablonda belirtilen değerlere göre etiket yerleşimi hesaplaması
        
        // A4 sayfasının boyutları (mm)
        const pageWidthMm = 210;
        const pageHeightMm = 297;
        
        // String değerlerini güvenli bir şekilde sayıya dönüştürmek için yardımcı fonksiyon
        const toNumber = (value: any): number => {
          if (typeof value === 'number') return value;
          if (!value && value !== 0) return 0;
          // Türkçe lokalizasyonu için virgüllü sayıları işle (örn: "63,5" -> "63.5")
          const normalized = value.toString().replace(',', '.');
          return parseFloat(normalized);
        };
        
        // Etiket boyutları şablondan alınıyor (mm)
        const labelWidthMm = toNumber(templateValues.labelWidth); 
        const labelHeightMm = toNumber(templateValues.labelHeight);
        
        // Sayfa kenar boşlukları şablondan alınıyor (mm)
        const topMarginMm = toNumber(templateValues.topMargin);
        const leftMarginMm = toNumber(templateValues.leftMargin);
        const rightMarginMm = toNumber(templateValues.rightMargin);
        const bottomMarginMm = toNumber(templateValues.bottomMargin);
        
        // Etiketler arası boşluklar şablondan alınıyor (mm)
        const horizontalSpacingMm = toNumber(templateValues.horizontalSpacing);
        const verticalSpacingMm = toNumber(templateValues.verticalSpacing);
        
        console.log("Şablon Değerleri (toNumber ile dönüştürülmüş):", {
          topMargin: topMarginMm,
          bottomMargin: bottomMarginMm,
          leftMargin: leftMarginMm,
          rightMargin: rightMarginMm,
          horizontalSpacing: horizontalSpacingMm,
          verticalSpacing: verticalSpacingMm,
          labelWidth: labelWidthMm,
          labelHeight: labelHeightMm,
          columns: templateValues.columns,
          rows: templateValues.rows
        });
        
        // A4 Kağıdının ortası: 297 / 2 = 148.5 mm
        const pageMiddle = pageHeightMm / 2; // 148.5 mm
        
        // Her etiket için gerçek kullanılan alan - etiket boyutu ve aralarındaki boşluk
        // Etiketler arasındaki mesafe doğru şekilde hesaplanmalı
        const effectiveLabelWidth = labelWidthMm + horizontalSpacingMm; 
        const effectiveLabelHeight = labelHeightMm + verticalSpacingMm;
        
        // Etiket X pozisyonu - şablondan gelen sol kenar boşluğu değerine göre hesaplanır
        // Şablondan alınan leftMargin değerini kullanıyoruz!
        // Sütun indeksi * (etiket genişliği + yatay boşluk) + sol margin
        const xPosition = leftMarginMm + (col * effectiveLabelWidth);
        
        // Etiket Y pozisyonu hesaplayalım
        // Sayfanın üstünden aşağıya doğru konum
        // Şablondan alınan topMargin değerini kullanıyoruz!
        // Satırlar için boşluk hesabı: Üst marj + (satır indeksi * (etiket yüksekliği + dikey boşluk))
        // Ek olarak, sayfa üst güvenlik marjını ekliyoruz - bu etiketlerin üst kısmının kesilmemesi için
        const adjustedTopMargin = topMarginMm + pageSafetyMarginTop;
        const yPosition = adjustedTopMargin + (row * effectiveLabelHeight);
        
        // PDF koordinat sistemi için dönüşüm (PDF'de 0,0 noktası sol alt köşededir)
        // X koordinatını milimetreden PDF'in nokta sistemine dönüştürüyoruz
        const x = xPosition * mmToPoints;
        
        // Y koordinatını hesaplarken, PDF'in koordinat sistemi ile sayfa koordinat sistemi arasındaki
        // farkı dikkate almalıyız: PDF'de 0,0 noktası sol alt köşedir, bizim hesaplamalarımızda 
        // ise sayfanın üst kısmından başlıyoruz.
        //
        // Bu nedenle, sayfanın yüksekliğinden (pageHeightMm) etiketin Y konumunu (yPosition) ve 
        // etiket yüksekliğini (labelHeightMm) çıkararak etiketin alt kenarının sayfanın alt kenarından 
        // olan mesafesini buluyoruz.
        const y = (pageHeightMm - yPosition - labelHeightMm) * mmToPoints;
        
        console.log(`Etiket ${labelIndex+1}: Satır ${row+1}, Sütun ${col+1}, Konum: (${xPosition.toFixed(2)}mm, ${yPosition.toFixed(2)}mm) -> PDF Y: ${y/mmToPoints}mm`);
        
        // Eğer istenirse şablon çizgilerini (grid) göster - sadece önizleme için
        if (showGridLines) {
          // Kesik çizgili mavi çerçeve çiz
          page.drawRectangle({
            x: x,
            y: y,
            width: labelWidthMm * mmToPoints,
            height: labelHeightMm * mmToPoints,
            borderColor: rgb(0, 0, 0.8), // Mavi renk
            borderWidth: 0.5,
            borderDashArray: [3, 3], // Kesik çizgi
            borderOpacity: 0.7,
          });
        }
        
        // Embed the image
        if (label.imageData.startsWith('data:')) {
          // Extract the base64 part
          const base64Data = label.imageData.split(',')[1];
          
          if (label.fileType === 'application/pdf') {
            // Embed PDF
            const embedPdf = await pdfDoc.embedPdf(Buffer.from(base64Data, 'base64'));
            const pdfPage = embedPdf[0]; // Get the first page of the embedded PDF
            
            // Calculate dimensions to maintain aspect ratio
            const originalWidth = pdfPage.width;
            const originalHeight = pdfPage.height;
            const labelWidthPt = labelWidthMm * mmToPoints;
            const labelHeightPt = labelHeightMm * mmToPoints;
            
            const scale = Math.min(
              labelWidthPt / originalWidth,
              labelHeightPt / originalHeight
            );
            
            const scaledWidth = originalWidth * scale;
            const scaledHeight = originalHeight * scale;
            
            // Center the image within the label area
            const xOffset = (labelWidthPt - scaledWidth) / 2;
            const yOffset = (labelHeightPt - scaledHeight) / 2;
            
            // Draw the PDF page
            page.drawPage(pdfPage, {
              x: x + xOffset,
              y: y + yOffset, // PDF koordinat sisteminde Y yukarı doğru artar
              width: scaledWidth,
              height: scaledHeight,
            });
          } else {
            // Embed image (JPEG)
            const image = await pdfDoc.embedJpg(Buffer.from(base64Data, 'base64'));
            
            // Calculate dimensions to maintain aspect ratio
            const originalWidth = image.width;
            const originalHeight = image.height;
            const labelWidthPt = labelWidthMm * mmToPoints;
            const labelHeightPt = labelHeightMm * mmToPoints;
            
            const scale = Math.min(
              labelWidthPt / originalWidth,
              labelHeightPt / originalHeight
            );
            
            const scaledWidth = originalWidth * scale;
            const scaledHeight = originalHeight * scale;
            
            // Center the image within the label area
            const xOffset = (labelWidthPt - scaledWidth) / 2;
            const yOffset = (labelHeightPt - scaledHeight) / 2;
            
            // Draw the image
            page.drawImage(image, {
              x: x + xOffset,
              y: y + yOffset, // PDF koordinat sisteminde Y yukarı doğru artar
              width: scaledWidth,
              height: scaledHeight,
            });
          }
        }
        
        // Her etiket için tarih ekleme durumunu kontrol et
        // Etiketin kendi date değeri varsa, o etikette tarih seçilmiş demektir
        if (label.date) {
          // Load a standard font
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          
          // Format date
          const formattedDate = new Date(label.date).toLocaleDateString('tr-TR');
          
          // Calculate date position
          // İçeriden mesafe - etiketin SAĞ KENARININ 30mm içinde
          const rightInset = 30; // mm
          // Aşağıdan yukarı mesafe - etiketin ALT KENARININ 15mm yukarısında
          const bottomInset = 15; // mm
          
          // Etiketin sağ kenarından içeride (30mm)
          const dateX = x + (labelWidthMm - rightInset) * mmToPoints;
          
          // Etiketin alt kenarından yukarıda (15mm)
          // Not: PDF'de Y koordinatı aşağıdan yukarıya doğru artar (ters)
          const dateY = y + bottomInset * mmToPoints;
          
          console.log(`Tarih konumu: X=${dateX/mmToPoints}mm, Y=${dateY/mmToPoints}mm (etiket genişliği: ${labelWidthMm}mm)`);
          
          // Tarih yazı boyutu
          const fontSize = 11;
          
          // Draw the date
          page.drawText(formattedDate, {
            x: dateX,
            y: dateY,
            size: fontSize,
            font,
            color: rgb(0.3, 0.3, 0.3),
          });
        }
      }
    }
    
    return pdfDoc;
  }

  const httpServer = createServer(app);
  return httpServer;
}
