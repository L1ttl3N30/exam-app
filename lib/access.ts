import { prisma } from "./prisma";

export async function userHasAccessToTest(userId: string, testId: string): Promise<boolean> {
  const now = new Date();
  const purchases = await prisma.purchase.findMany({
    where: {
      userId,
      status: "ACTIVE",
      OR: [
        { testId },
        {
          type: "SUBSCRIPTION",
          expiresAt: {
            gt: now
          }
        }
      ]
    }
  });

  return purchases.length > 0;
}

