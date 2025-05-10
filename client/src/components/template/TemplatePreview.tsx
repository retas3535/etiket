import { calculateLabelsLayout } from "@/lib/utils";

interface TemplatePreviewProps {
  topMargin: number;
  bottomMargin: number;
  leftMargin: number;
  rightMargin: number;
  horizontalSpacing: number;
  verticalSpacing: number;
  labelWidth: number;
  labelHeight: number;
  columns?: number;
  rows?: number;
}

export default function TemplatePreview({
  topMargin = 4,
  bottomMargin = 4,
  leftMargin = 4,
  rightMargin = 4,
  horizontalSpacing = 3,
  verticalSpacing = 0,
  labelWidth = 63.5,
  labelHeight = 72,
  columns = 3,
  rows = 4,
}: TemplatePreviewProps) {
  const layout = calculateLabelsLayout(
    210, // A4 width
    297, // A4 height
    topMargin,
    bottomMargin,
    leftMargin,
    rightMargin,
    horizontalSpacing,
    verticalSpacing,
    labelWidth,
    labelHeight,
    columns,
    rows
  );
  
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
          {layout.labelPositions.map((position, index) => (
            <div
              key={index}
              className="absolute bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-500 text-sm"
              style={{
                width: `${position.width}mm`,
                height: `${position.height}mm`,
                left: `${position.left}mm`,
                top: `${position.top}mm`,
              }}
            >
              Etiket
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
