import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.testimonial.count();
  if (existing > 0) {
    console.log(`Testimonials already exist (${existing}), skipping.`);
    return;
  }

  await prisma.testimonial.createMany({
    data: [
      {
        CustomerName: "Rakesh Patel",
        RoleOrLocation: "Surat",
        Quote: "Quick sample collection and the report came back faster than I expected. Very professional.",
        Rating: 5,
        SortOrder: 1,
        IsActive: true,
        CreatedAt: new Date(),
      },
      {
        CustomerName: "Priya Shah",
        RoleOrLocation: "Surat",
        Quote: "Booked online, got a call to confirm within the hour. Smooth experience end to end.",
        Rating: 5,
        SortOrder: 2,
        IsActive: true,
        CreatedAt: new Date(),
      },
      {
        CustomerName: "Verified Patient",
        RoleOrLocation: "Surat",
        Quote: "Trust this lab for our family's routine checkups for over 5 years now.",
        Rating: 5,
        SortOrder: 3,
        IsActive: true,
        CreatedAt: new Date(),
      },
    ],
  });

  console.log("Seeded 3 testimonials.");
}

main().finally(() => prisma.$disconnect());
