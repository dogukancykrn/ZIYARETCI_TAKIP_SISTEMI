// KULLANICI TİPLERİ

// Admin kullanıcı tipini tanımlayan interface
export interface Admin {
  id: string;           // Admin'in benzersiz kimliği
  fullName: string;     // Admin'in tam adı
  phoneNumber: string;  // Admin'in telefon numarası
  email: string;        // Admin'in e-posta adresi
  role: 'Admin';        // Admin'in rolü (şu anda sadece 'Admin' destekleniyor)
}

// Ziyaretçi tipini tanımlayan interface
export interface Visitor {
  id: string;           // Ziyaretçinin benzersiz kimliği
  fullName: string;     // Ziyaretçinin tam adı
  tcNumber: string;     // Ziyaretçinin TC kimlik numarası
  visitReason: string;  // Ziyaret nedeni
  enteredAt: Date;      // Ziyaretçinin giriş tarihi/saati
  exitedAt?: Date;      // Ziyaretçinin çıkış tarihi/saati (opsiyonel - aktif ziyaretçilerde olmaz)
}

// FORM TİPLERİ

// Giriş formu için veri tipini tanımlayan interface
export interface LoginFormData {
  email: string;     // Giriş e-posta adresi
  password: string;  // Giriş şifresi
}

// Ziyaretçi kayıt formu için veri tipini tanımlayan interface
export interface VisitorFormData {
  fullName: string;     // Ziyaretçinin tam adı
  tcNumber: string;     // Ziyaretçinin TC kimlik numarası
  visitReason: string;  // Ziyaret nedeni
}

// API RESPONSE TİPLERİ

// Genel API yanıt formatını tanımlayan generic interface
export interface ApiResponse<T> {
  success: boolean;  // İşlem başarılı mı?
  data: T;          // Dönen veri (generic tip)
  message?: string; // Opsiyonel mesaj
}

// Kimlik doğrulama yanıtını tanımlayan interface
export interface AuthResponse {
  token: string;  // JWT token
  admin: Admin;   // Admin bilgileri
}

// FİLTRE TİPLERİ

// Ziyaretçi filtreleme için kullanılan interface
export interface VisitorFilter {
  fullName?: string;    // Tam ada göre filtreleme (opsiyonel)
  tcNumber?: string;    // TC numarasına göre filtreleme (opsiyonel)
  startDate?: Date;     // Başlangıç tarihine göre filtreleme (opsiyonel)
  endDate?: Date;       // Bitiş tarihine göre filtreleme (opsiyonel)
  visitReason?: string; // Ziyaret nedenine göre filtreleme (opsiyonel)
}

// ANALİTİK TİPLERİ

// Tarih aralığı analizi veri tipi
export interface DateRangeAnalytics {
  date: string;
  totalVisitors: number;
  activeVisitors: number;
  completedVisits: number;
  avgDurationMinutes: number;
}

// Saatlik analiz veri tipi
export interface HourlyAnalytics {
  hour: number;
  visitorCount: number;
  avgDurationMinutes: number;
}

// Tepe saatler analizi
export interface PeakHoursAnalysis {
  hourlyData: HourlyAnalytics[];
  peakHour: number;
  peakHourCount: number;
  quietHour: number;
  quietHourCount: number;
}

// Trend analizi veri tipleri
export interface DailyTrend {
  date: string;
  count: number;
  dayOfWeek: string;
}

export interface WeeklyTrend {
  year: number;
  week: number;
  count: number;
  weekStart: string;
}

export interface DayOfWeekTrend {
  dayOfWeek: string;
  avgCount: number;
  totalCount: number;
}

export interface TrendAnalysis {
  dailyTrend: DailyTrend[];
  weeklyTrend: WeeklyTrend[];
  dayOfWeekTrend: DayOfWeekTrend[];
}

// Süre analizi veri tipi
export interface DurationAnalysis {
  overallAverage: number;
  byHour: { [hour: number]: number };
  byDayOfWeek: { [day: string]: number };
  byReason: { [reason: string]: number };
  totalCompletedVisits: number;
  shortestVisit: number;
  longestVisit: number;
}

// Yoğunluk haritası veri tipi
export interface HeatmapData {
  dayOfWeek: string;
  hour: number;
  count: number;
}

// TABLO COLUMN TİPLERİ (Ant Design için)

// Ant Design tabloları için ziyaretçi veri tipini tanımlayan interface
export interface VisitorTableData extends Visitor {
  key: string; // Ant Design tabloları için gerekli benzersiz key
}
