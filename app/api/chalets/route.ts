import { NextResponse } from "next/server";

// Demo data - in production, use Prisma
const chalets = [
  {
    id: "1",
    slug: "royal-chalet",
    nameAr: "الشاليه الملكي",
    nameEn: "Royal Chalet",
    descriptionAr: "شاليه فاخر مع مسبح خاص وحديقة واسعة",
    descriptionEn: "Luxury chalet with private pool and spacious garden",
    images: ["https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=600&h=400&fit=crop"],
    pricePerNight: 800,
    weekendPrice: 1000,
    capacity: 15,
    bedrooms: 4,
    bathrooms: 3,
    amenities: ["pool", "wifi", "bbq", "parking", "ac", "kitchen"],
    locationAr: "الرياض - حي النرجس",
    locationEn: "Riyadh - Al Narjis District",
    isActive: true,
  },
];

export async function GET() {
  return NextResponse.json(chalets);
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json(
    { message: "Chalet created", data: body },
    { status: 201 }
  );
}
