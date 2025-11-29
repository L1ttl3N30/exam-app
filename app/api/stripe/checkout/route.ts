import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_WEEKLY_PRICE_ID, STRIPE_MONTHLY_PRICE_ID } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { testId, mode } = body as {
    testId?: string;
    mode: "one_time" | "weekly" | "monthly";
  };

  let priceId = "";
  let metadata: Record<string, string> = {
    userId: session.user.id,
    type: ""
  };

  if (mode === "one_time") {
    if (!testId) {
      return NextResponse.json({ error: "Missing testId" }, { status: 400 });
    }

    const test = await prisma.test.findUnique({
      where: { id: testId }
    });

    if (!test || !test.stripePriceId) {
      return NextResponse.json({ error: "Test or Stripe price not found" }, { status: 404 });
    }

    priceId = test.stripePriceId;
    metadata.type = "ONE_TIME";
    metadata.testId = testId;
  } else if (mode === "weekly") {
    if (!STRIPE_WEEKLY_PRICE_ID) {
      return NextResponse.json({ error: "Weekly subscription price not configured" }, { status: 500 });
    }
    priceId = STRIPE_WEEKLY_PRICE_ID;
    metadata.type = "SUBSCRIPTION_WEEKLY";
  } else if (mode === "monthly") {
    if (!STRIPE_MONTHLY_PRICE_ID) {
      return NextResponse.json({ error: "Monthly subscription price not configured" }, { status: 500 });
    }
    priceId = STRIPE_MONTHLY_PRICE_ID;
    metadata.type = "SUBSCRIPTION_MONTHLY";
  } else {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: mode === "one_time" ? "payment" : "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=1`,
    metadata
  });

  return NextResponse.json({ url: checkoutSession.url });
}

