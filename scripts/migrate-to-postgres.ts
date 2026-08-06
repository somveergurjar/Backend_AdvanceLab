// One-time data migration: local MySQL (AdvanceLabDb) -> Neon Postgres.
// Run with: MYSQL_URL=mysql://root:root@localhost:3306/AdvanceLabDb npx tsx scripts/migrate-to-postgres.ts
// The destination is whatever DATABASE_URL is set to in .env (the Postgres one) -
// run `npx prisma db push` against it first so the tables exist.
import "dotenv/config";
import mysql from "mysql2/promise";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function toBool(v: unknown): boolean {
  return v === 1 || v === true;
}

async function main() {
  const mysqlUrl = process.env.MYSQL_URL;
  if (!mysqlUrl) throw new Error("Set MYSQL_URL to the source MySQL connection string.");

  const conn = await mysql.createConnection(mysqlUrl);
  console.log("Connected to source MySQL database.");

  async function rows<T = any>(table: string): Promise<T[]> {
    const [result] = await conn.execute(`SELECT * FROM ${table}`);
    return result as T[];
  }

  // Order matters: ServiceCategory before ServiceItem before Appointment (FK dependencies).
  const adminUsers = await rows<any>("adminusers");
  if (adminUsers.length) {
    await prisma.adminUser.createMany({
      data: adminUsers.map((r) => ({
        Id: r.Id,
        Username: r.Username,
        Email: r.Email,
        PasswordHash: r.PasswordHash,
        Role: r.Role,
        CreatedAt: r.CreatedAt,
        LastLoginAt: r.LastLoginAt,
        ResetToken: r.ResetToken,
        ResetTokenExpiresAt: r.ResetTokenExpiresAt,
        AvatarUrl: r.AvatarUrl,
      })),
    });
    console.log(`Migrated ${adminUsers.length} admin user(s).`);
  }

  const categories = await rows<any>("servicecategories");
  if (categories.length) {
    await prisma.serviceCategory.createMany({
      data: categories.map((r) => ({
        Id: r.Id,
        Name: r.Name,
        Slug: r.Slug,
        Description: r.Description,
        SortOrder: r.SortOrder,
        IsActive: toBool(r.IsActive),
      })),
    });
    console.log(`Migrated ${categories.length} service category(ies).`);
  }

  const items = await rows<any>("serviceitems");
  if (items.length) {
    await prisma.serviceItem.createMany({
      data: items.map((r) => ({
        Id: r.Id,
        ServiceCategoryId: r.ServiceCategoryId,
        Name: r.Name,
        Description: r.Description,
        Price: r.Price,
        SortOrder: r.SortOrder,
        IsActive: toBool(r.IsActive),
        DiscountPercent: r.DiscountPercent,
        OfferBadgeText: r.OfferBadgeText,
      })),
    });
    console.log(`Migrated ${items.length} service item(s).`);
  }

  const appointments = await rows<any>("appointments");
  if (appointments.length) {
    await prisma.appointment.createMany({
      data: appointments.map((r) => ({
        Id: r.Id,
        Name: r.Name,
        Address: r.Address,
        PhoneNo: r.PhoneNo,
        Email: r.Email,
        ServiceItemId: r.ServiceItemId,
        CollectionDateTime: r.CollectionDateTime,
        Description: r.Description,
        Status: r.Status,
        CreatedAt: r.CreatedAt,
        RejectionReason: r.RejectionReason,
      })),
    });
    console.log(`Migrated ${appointments.length} appointment(s).`);
  }

  const b2b = await rows<any>("b2binquiries");
  if (b2b.length) {
    await prisma.b2BInquiry.createMany({
      data: b2b.map((r) => ({
        Id: r.Id,
        OrganizationName: r.OrganizationName,
        ContactPerson: r.ContactPerson,
        Email: r.Email,
        Phone: r.Phone,
        BusinessType: r.BusinessType,
        City: r.City,
        Message: r.Message,
        Status: r.Status,
        CreatedAt: r.CreatedAt,
      })),
    });
    console.log(`Migrated ${b2b.length} B2B inquiry(ies).`);
  }

  const callbacks = await rows<any>("callbackrequests");
  if (callbacks.length) {
    await prisma.callbackRequest.createMany({
      data: callbacks.map((r) => ({
        Id: r.Id,
        Name: r.Name,
        PhoneNo: r.PhoneNo,
        IsContacted: toBool(r.IsContacted),
        CreatedAt: r.CreatedAt,
      })),
    });
    console.log(`Migrated ${callbacks.length} callback request(s).`);
  }

  const messages = await rows<any>("contactmessages");
  if (messages.length) {
    await prisma.contactMessage.createMany({
      data: messages.map((r) => ({
        Id: r.Id,
        Name: r.Name,
        Email: r.Email,
        Phone: r.Phone,
        Message: r.Message,
        IsRead: toBool(r.IsRead),
        CreatedAt: r.CreatedAt,
      })),
    });
    console.log(`Migrated ${messages.length} contact message(s).`);
  }

  const blocks = await rows<any>("contentblocks");
  if (blocks.length) {
    await prisma.contentBlock.createMany({
      data: blocks.map((r) => ({
        Id: r.Id,
        PageSlug: r.PageSlug,
        Key: r.Key,
        Title: r.Title,
        Body: r.Body,
        ImageUrl: r.ImageUrl,
        SortOrder: r.SortOrder,
        UpdatedAt: r.UpdatedAt,
      })),
    });
    console.log(`Migrated ${blocks.length} content block(s).`);
  }

  const cards = await rows<any>("featurecards");
  if (cards.length) {
    await prisma.featureCard.createMany({
      data: cards.map((r) => ({
        Id: r.Id,
        PageSlug: r.PageSlug,
        IconKey: r.IconKey,
        Title: r.Title,
        Body: r.Body,
        SortOrder: r.SortOrder,
        IsActive: toBool(r.IsActive),
      })),
    });
    console.log(`Migrated ${cards.length} feature card(s).`);
  }

  const images = await rows<any>("siteimages");
  if (images.length) {
    await prisma.siteImage.createMany({
      data: images.map((r) => ({
        Id: r.Id,
        Section: r.Section,
        Url: r.Url,
        AltText: r.AltText,
        SortOrder: r.SortOrder,
        IsActive: toBool(r.IsActive),
      })),
    });
    console.log(`Migrated ${images.length} site image(s).`);
  }

  const testimonials = await rows<any>("testimonials");
  if (testimonials.length) {
    await prisma.testimonial.createMany({
      data: testimonials.map((r) => ({
        Id: r.Id,
        CustomerName: r.CustomerName,
        RoleOrLocation: r.RoleOrLocation,
        Quote: r.Quote,
        Rating: r.Rating,
        SortOrder: r.SortOrder,
        IsActive: toBool(r.IsActive),
        CreatedAt: r.CreatedAt,
      })),
    });
    console.log(`Migrated ${testimonials.length} testimonial(s).`);
  }

  // Explicit Id values were inserted above, so each table's auto-increment
  // sequence is still at 1 - bump every sequence to max(Id)+1 or the next
  // insert will collide with an existing row.
  const tables = [
    "adminusers",
    "appointments",
    "b2binquiries",
    "callbackrequests",
    "contactmessages",
    "contentblocks",
    "featurecards",
    "servicecategories",
    "serviceitems",
    "siteimages",
    "testimonials",
  ];
  for (const table of tables) {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('${table}', 'Id'), COALESCE((SELECT MAX("Id") FROM ${table}), 1))`
    );
  }
  console.log("Reset all auto-increment sequences.");

  await conn.end();
  await prisma.$disconnect();
  console.log("Migration complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
