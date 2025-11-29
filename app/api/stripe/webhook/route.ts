import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export const config = {
  api: {
    bodyParser: false
  }
};

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing webhook secret" }, { status: 400 });
  }

  const buf = Buffer.from(await req.arrayBuffer());

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};
    const stripeSessionId = session.id;
    const userId = metadata.userId as string | undefined;
    const type = metadata.type as string | undefined;
    const testId = metadata.testId as string | undefined;

    if (!userId || !type) {
      console.error("Missing metadata in checkout session.");
      return NextResponse.json({ received: true });
    }

    if (type === "ONE_TIME" && testId) {
      await prisma.purchase.create({
        data: {
          userId,
          testId,
          type: "ONE_TIME",
          status: "ACTIVE",
          stripeSessionId
        }
      });
    } else if (type === "SUBSCRIPTION_WEEKLY" || type === "SUBSCRIPTION_MONTHLY") {
      const subscriptionId = session.subscription as string | undefined;
      const weeks = type === "SUBSCRIPTION_WEEKLY" ? 1 : 4;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + weeks * 7);

      await prisma.purchase.create({
        data: {
          userId,
          type: "SUBSCRIPTION",
          status: "ACTIVE",
          stripeSessionId,
          stripeSubscriptionId: subscriptionId || undefined,
          expiresAt
        }
      });
    }
  }

  return NextResponse.json({ received: true });
}

