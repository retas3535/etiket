import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// String değerlerini güvenli bir şekilde sayıya dönüştürmek için yardımcı fonksiyon
export function toNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (!value && value !== 0) return 0;
  // Türkçe lokalizasyonu için virgüllü sayıları işle (örn: "63,5" -> "63.5")
  const normalized = value.toString().replace(',', '.');
  return parseFloat(normalized);
}

export function formatDate(date: Date | string): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("tr-TR");
}

export function calculateLabelsLayout(
  pageWidth: number = 210,
  pageHeight: number = 297,
  topMargin: number = 4,
  bottomMargin: number = 4,
  leftMargin: number = 4,
  rightMargin: number = 4,
  horizontalSpacing: number = 3,
  verticalSpacing: number = 0,
  labelWidth: number = 63.5,
  labelHeight: number = 72,
  columns: number = 3,
  rows: number = 4
) {
  // Calculate usable space
  const usableWidth = pageWidth - leftMargin - rightMargin;
  const usableHeight = pageHeight - topMargin - bottomMargin;

  // Kullanıcının belirlediği sütun ve satır sayısını kullan
  // Eğer belirtilmişse satır ve sütun sayısını kullan, aksi halde hesaplanan değerleri kullan
  const labelsPerRow = columns > 0 ? columns : Math.floor((usableWidth + horizontalSpacing) / (labelWidth + horizontalSpacing));
  const labelsPerColumn = rows > 0 ? rows : Math.floor((usableHeight + verticalSpacing) / (labelHeight + verticalSpacing));

  // Her sütun için genişlik hesapla (boşluklar dahil)
  const columnWidth = (usableWidth - (labelsPerRow - 1) * horizontalSpacing) / labelsPerRow;
  // Her satır için yükseklik hesapla (boşluklar dahil)
  const rowHeight = (usableHeight - (labelsPerColumn - 1) * verticalSpacing) / labelsPerColumn;

  // Calculate positions for each label
  const labelPositions = [];
  for (let row = 0; row < labelsPerColumn; row++) {
    for (let col = 0; col < labelsPerRow; col++) {
      // Etiket pozisyonunu hesapla - şablondan gelen kenar boşluklarına ve aralıklara göre
      const left = leftMargin + col * (labelWidth + horizontalSpacing);
      // Şablona göre saf yerleşim - üst marj değerine göre
      const top = topMargin + row * (labelHeight + verticalSpacing);
      
      labelPositions.push({
        left,
        top,
        width: labelWidth,
        height: labelHeight,
      });
    }
  }

  return {
    labelsPerRow,
    labelsPerColumn,
    totalLabels: labelsPerRow * labelsPerColumn,
    labelPositions,
  };
}

// Function to convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Function to convert a blob URL to a File object
export const blobUrlToFile = async (blobUrl: string, fileName: string, fileType: string): Promise<File> => {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new File([blob], fileName, { type: fileType });
};
