import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
    email: z.string().email("البريد الإلكتروني غير صالح"),
    phone: z.string().optional(),
    password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمة المرور غير متطابقة",
    path: ["confirmPassword"],
  });

export const bookingSchema = z.object({
  chaletId: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  guests: z.number().min(1).max(50),
  notes: z.string().optional(),
});

export const reviewSchema = z.object({
  chaletId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "التعليق يجب أن يكون 10 أحرف على الأقل"),
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10),
});

export const chaletSchema = z.object({
  nameAr: z.string().min(2),
  nameEn: z.string().min(2),
  descriptionAr: z.string().min(10),
  descriptionEn: z.string().min(10),
  capacity: z.number().min(1),
  bedrooms: z.number().min(1),
  bathrooms: z.number().min(1),
  pricePerNight: z.number().positive(),
  weekendPrice: z.number().positive().optional(),
  locationAr: z.string().min(2),
  locationEn: z.string().min(2),
  amenities: z.array(z.string()),
  images: z.array(z.string()),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ChaletInput = z.infer<typeof chaletSchema>;
