# Etiket Tasarımı Versiyon 1

Bu versiyon, Etiket Tasarım Uygulamasının temel özelliklerini içeren ilk tamamlanmış sürümüdür. Bu dosya ileride ortaya çıkabilecek sorunlarda geri dönüş noktası olarak kullanılabilir.

## Özellikler
- Sayfa şablonu ayarları (kenar boşlukları, etiket boyutları, etiket aralıkları)
- Etiket tasarımı yükleme ve yönetme (JPG ve PDF formatları desteklenir)
- Etiket baskı önizleme
- Etiket PDF oluşturma ve yazdırma
- Her etiket için ayrı tarih ekleme/çıkarma seçeneği
- Her etiket için bağımsız tarih seçimi

## Teknik Detaylar
- React.js frontend
- Express.js backend
- PostgreSQL veritabanı (Drizzle ORM)
- PDF oluşturma için pdf-lib kütüphanesi
- Responsive web tasarımı

## Tarih
- Versiyon 1 Tamamlanma Tarihi: 3 Mayıs 2025

## Notlar
- Bu versiyonda her etiket için ayrı tarih eklenip eklenmeyeceği ayrı ayrı kontrol edilebilir
- Etiketlerin PDF'deki görünümü sadece kendi tarih ayarlarına göre oluşturulur
- Varsayılan olarak yeni etiketlerde tarih ekleme kapalıdır