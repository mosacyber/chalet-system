// ── Enums ──

export type Role = "ADMIN" | "CUSTOMER" | "OWNER";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "BLOCKED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

// ── Models ──

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  password: string;
  role: Role;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Chalet {
  id: string;
  slug: string;
  ownerId: string | null;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  images: string[];
  amenities: string[];
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  pricePerNight: number;
  weekendPrice: number | null;
  locationAr: string;
  locationEn: string;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  chaletId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  notes: string | null;
  guestName: string | null;
  guestPhone: string | null;
  paymentMethod: string | null;
  deposit: number | null;
  remainingAmount: number | null;
  remainingPaymentMethod: string | null;
  remainingCollected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  method: string;
  status: PaymentStatus;
  stripeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  chaletId: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface WaterExpense {
  id: string;
  chaletId: string;
  amount: number;
  notes: string | null;
  date: string;
  createdAt: string;
}

export interface LinkPage {
  id: string;
  userId: string;
  slug: string;
  displayName: string;
  subtitle: string | null;
  bio: string | null;
  avatarUrl: string | null;
  themeColor: string;
  backgroundStyle: string;
  buttonStyle: string;
  fontFamily: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LinkItem {
  id: string;
  linkPageId: string;
  title: string;
  url: string;
  iconType: string;
  linkType: string;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  thumbnail: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppSession {
  id: string;
  userId: string;
  phone: string;
  instanceId: string | null;
  status: string;
  lastConnectedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
}

export interface Visit {
  id: string;
  page: string;
  referrer: string | null;
  userAgent: string | null;
  ip: string | null;
  createdAt: string;
}
