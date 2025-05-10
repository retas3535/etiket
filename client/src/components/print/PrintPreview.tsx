import React, { forwardRef, useImperativeHandle } from "react";
import { calculateLabelsLayout, formatDate, toNumber } from "@/lib/utils";

interface PrintPreviewProps {
  template: any;
  selectedLabels: any[];
  addDate: boolean;
  date: string;
}

const PrintPreview = forwardRef<any, PrintPreviewProps>(
  ({ template, selectedLabels, addDate, date }, ref) => {
    useImperativeHandle(ref, () => ({
      // Implementing methods that might be needed by parent
      getCurrentContent: () => ({
        template,
        selectedLabels,
        addDate,
        date
      }),
    }));
    
    if (!template) {
      return (
        <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center" style={{ height: "500px" }}>
          <div className="text-center text-gray-500">
            Lütfen bir şablon seçin
          </div>
        </div>
      );
    }
    
    // Sayfa şablonundaki tüm değerleri kullanarak etiket yerleşimini hesapla
    const layout = calculateLabelsLayout(
      210, // A4 width
      297, // A4 height
      toNumber(template.topMargin),
      toNumber(template.bottomMargin),
      toNumber(template.leftMargin),
      toNumber(template.rightMargin),
      toNumber(template.horizontalSpacing),
      toNumber(template.verticalSpacing),
      toNumber(template.labelWidth),
      toNumber(template.labelHeight),
      toNumber(template.columns),
      toNumber(template.rows)
    );
    
    // Flatten selected labels with quantities
    const labelsToRender: any[] = [];
    selectedLabels.forEach(label => {
      for (let i = 0; i < label.quantity; i++) {
        labelsToRender.push({
          ...label,
          instanceId: `${label.id}-${i}`,
        });
      }
    });
    
    return (
      <div className="bg-gray-100 p-4 rounded-lg overflow-auto" style={{ height: "500px" }}>
        <div className="a4-paper-scaled mx-auto origin-top" style={{ transform: "scale(0.3)" }}>
          <div 
            className="bg-white shadow-md relative"
            style={{
              width: "210mm",
              height: "297mm",
              overflow: "hidden"
            }}
          >
            {/* Şablon çizgilerini göster - sadece önizleme için */}
            {layout.labelPositions.map((position, idx) => (
              <div
                key={`grid-${idx}`}
                className="absolute border border-dashed border-blue-300"
                style={{
                  width: `${position.width}mm`,
                  height: `${position.height}mm`,
                  left: `${position.left}mm`,
                  top: `${position.top}mm`,
                  zIndex: 5,
                  pointerEvents: "none" // Tıklamaları geçir
                }}
              />
            ))}
            
            {labelsToRender.map((label, index) => {
              if (index >= layout.labelPositions.length) return null;
              
              const position = layout.labelPositions[index];
              
              return (
                <div
                  key={label.instanceId}
                  className="absolute"
                  style={{
                    width: `${position.width}mm`,
                    height: `${position.height}mm`,
                    left: `${position.left}mm`,
                    top: `${position.top}mm`,
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={label.imageData}
                    alt={label.name}
                    className="w-full h-full object-contain"
                  />
                  
                  {addDate && (
                    <div 
                      className="absolute text-xs text-gray-600"
                      style={{
                        right: "30mm",    // 30mm from right edge (etiketin sağ kenarından içeri - 5mm daha sola kaydırıldı)
                        bottom: "15mm",   // 15mm from bottom (etiketin alt kenarından yukarı)
                        fontSize: "11pt", // 11pt font size
                        fontFamily: "Helvetica, Arial, sans-serif"
                      }}
                    >
                      {formatDate(label.date || date)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

PrintPreview.displayName = "PrintPreview";

export default PrintPreview;
