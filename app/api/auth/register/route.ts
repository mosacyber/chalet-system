import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
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

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "هذا البريد الإلكتروني مسجل بالفعل" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          phone: phone || null,
          password: hashedPassword,
          role: "OWNER",
        },
        select: { id: true, name: true, email: true, role: true },
      });

      const slug =
        chaletName.trim().replace(/\s+/g, "-") +
        "-" +
        newUser.id.slice(0, 6);

      await tx.chalet.create({
        data: {
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
          locationAr: "",
          locationEn: "",
          isActive: false,
        },
      });

      return newUser;
    });

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
