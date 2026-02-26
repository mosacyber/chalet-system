import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, phone, password, chaletName } = result.data;
    const email = result.data.email.toLowerCase().trim();

    const existingUser = await db.users.findFirst(
      (u) => u.email === email
    );

    if (existingUser) {
      return NextResponse.json(
        { error: "هذا البريد الإلكتروني مسجل بالفعل" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 12);

    const newUser = await db.users.create({
      name,
      email,
      phone: phone || null,
      password: hashedPassword,
      role: "OWNER" as const,
      image: null,
    });

    const slug =
      chaletName.trim().replace(/\s+/g, "-") +
      "-" +
      newUser.id.slice(0, 6);

    await db.chalets.create({
      nameAr: chaletName,
      nameEn: chaletName,
      slug,
      ownerId: newUser.id,
      descriptionAr: "",
      descriptionEn: "",
      images: [],
      amenities: [],
      capacity: 0,
      bedrooms: 0,
      bathrooms: 0,
      pricePerNight: 0,
      weekendPrice: null,
      locationAr: "",
      locationEn: "",
      latitude: null,
      longitude: null,
      isActive: false,
    });

    const user = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    return NextResponse.json(
      { message: "تم إنشاء الحساب بنجاح", user },
      { status: 201 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Registration error:", msg, error);
    return NextResponse.json(
      { error: "حدث خطأ في إنشاء الحساب", detail: msg },
      { status: 500 }
    );
  }
}
