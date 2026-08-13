import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.featureCard.count({ where: { PageSlug: "home" } });
  if (existing > 0) {
    console.log(`Feature cards for home already exist (${existing}), skipping.`);
    return;
  }

  await prisma.featureCard.createMany({
    data: [
      {
        PageSlug: "home",
        IconKey: "automation",
        Title: "Automated Instruments",
        Body: "Calibrated equipment for consistent, accurate results.",
        SortOrder: 1,
        IsActive: true,
      },
      {
        PageSlug: "home",
        IconKey: "location",
        Title: "Home Collection",
        Body: "A phlebotomist comes to you, anywhere in Surat.",
        SortOrder: 2,
        IsActive: true,
      },
      {
        PageSlug: "home",
        IconKey: "booking",
        Title: "Digital Reports",
        Body: "Delivered to your inbox the moment they're verified.",
        SortOrder: 3,
        IsActive: true,
      },
      {
        PageSlug: "home",
        IconKey: "established",
        Title: "13+ Years Local",
        Body: "A Surat institution since 2012, not a passing franchise.",
        SortOrder: 4,
        IsActive: true,
      },
    ],
  });

  console.log("Seeded 4 feature cards for home.");
}

main().finally(() => prisma.$disconnect());
