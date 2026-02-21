import { NextResponse } from "next/server";

export async function GET() {
  const reviews = [
    {
      id: "1",
      userId: "user-1",
      chaletId: "1",
      rating: 5,
      comment: "تجربة رائعة!",
      createdAt: "2024-03-15",
    },
  ];

  return NextResponse.json(reviews);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.chaletId || !body.rating || !body.comment) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const review = {
    id: `REV-${Date.now()}`,
    ...body,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(
    { message: "Review created", data: review },
    { status: 201 }
  );
}
