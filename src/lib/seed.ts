import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

// Seeds the DB with the content scraped from the old advancelab.org site,
// plus one default admin account so the panel is usable on first run.
// Mirrors the .NET DbSeeder exactly - only runs when each table is empty, so
// it is a no-op against the already-seeded production database.
export async function seed() {
  const hasAdmin = await prisma.adminUser.count();
  if (!hasAdmin) {
    await prisma.adminUser.create({
      data: {
        Username: "admin",
        Email: "info@advancelab.org",
        PasswordHash: bcrypt.hashSync("admin", 10),
        Role: "Admin",
        CreatedAt: new Date(),
      },
    });
  }

  const hasCategories = await prisma.serviceCategory.count();
  if (!hasCategories) {
    const item = (name: string, description: string | null, sort: number) => ({
      Name: name,
      Description: description,
      Price: 0,
      SortOrder: sort,
      IsActive: true,
    });

    await prisma.serviceCategory.create({
      data: {
        Name: "Pathology Service",
        Slug: "pathology",
        Description: "Routine and specialised pathology testing.",
        SortOrder: 1,
        IsActive: true,
        Items: {
          create: [
            item("Routine Haematological Test", "CBC, MP, Sickling Test, G-6PD, Blood Group, Coombs Test", 1),
            item("HB Electrophoresis", null, 2),
            item("Coagulation Profile", "BT/CT, PT/APTT, D-Dimer, Fibrinogen, FDP", 3),
            item("Clinical Pathology", "Analysis for Urine, Stool, Body Fluid", 4),
            item("Semen Wash for I.U.I.", null, 5),
            item("Biochemistry", "All biochemistry in fully automated instrument", 6),
            item("Immunoassay", "All hormones, Vit B12 and Vit D3", 7),
            item("ELISA Test", "TORCH Complex, ANA, ACA, APLA, LA", 8),
            item("Serological Tests", "HIV, HBsAg, Syphilis, HCV", 9),
            item("Biopsy Reporting", null, 10),
            item("Pap Smear Reporting", null, 11),
            item("FNAC Procedure and Reporting", null, 12),
            item("Tumour Markers", "AFP, CA125, CA19.9, CA15-3, CEA", 13),
            item("Critical Tests", "Arterial Blood Gas Analysis, Electrolytes, CPK Total, CPK-MB, Troponin", 14),
          ],
        },
      },
    });

    await prisma.serviceCategory.create({
      data: {
        Name: "Microbiology Service",
        Slug: "microbiology",
        Description: "Culture, sensitivity and microbial testing.",
        SortOrder: 2,
        IsActive: true,
        Items: {
          create: [
            item("Culture and Sensitivity", null, 1),
            item("Culture and Sensitivity for Specific Pathogens", null, 2),
            item("Fungus Culture and Sensitivity", null, 3),
            item("Acid Fast Bacilli Culture and Sensitivity", null, 4),
            item("Stained Smear Examination", "AFB, Gram, Hanging Drop, Albert Stain, Spore Stain", 5),
            item("MIC Determination", null, 6),
            item("Parasite Detection", null, 7),
            item("Antituberculous Activity of Unknown Compound", null, 8),
          ],
        },
      },
    });

    await prisma.serviceCategory.create({
      data: {
        Name: "Camp Profiles",
        Slug: "camp-profiles",
        Description: "Health check-up camp packages.",
        SortOrder: 3,
        IsActive: true,
      },
    });
  }

  const hasBlocks = await prisma.contentBlock.count();
  if (!hasBlocks) {
    const now = new Date();
    const block = (pageSlug: string, key: string, title: string, body: string, sortOrder: number) => ({
      PageSlug: pageSlug,
      Key: key,
      Title: title,
      Body: body,
      SortOrder: sortOrder,
      UpdatedAt: now,
    });

    await prisma.contentBlock.createMany({
      data: [
        block(
          "home",
          "welcome",
          "Welcome Advance Diagnostic Lab.",
          "Advance Diagnostic Lab. deals with a wide variety of diagnostic tests of pathology and microbiological samples including Operation Theater swabbing, sterility check of sanitized rooms and materials, Acid Fast Bacilli culture by Lowenstein-Jensen medium, Bacteriological culture (Pus, Urine, Blood, Stool, etc.), Fungus culture of skin, nail, hair, etc. We also deal with microbial testing of water, cloth, waste-water and milk samples.",
          1
        ),
        block("about-us", "intro", "About Advance Diagnostic Lab.", "Advance Diagnostic Laboratory, Surat - serving pathology and microbiology diagnostics since 2012.", 1),
        block("about-us", "facts", "Facts", "Years of Service:14+\nTest Categories:3\nDiagnostic Tests:22+", 0),
        block(
          "about-us",
          "vision",
          "Vision",
          "Our considerable experience and expertise in the field of Diagnostics Services has helped to address the growing health ailments by providing accurate & timely diagnosis with the help of specialized technologies and innovative services.\n\nAdvance Diagnostic Lab is committed to working with our customers, patients, clinicians and researchers to help them meet their individual needs. We firmly believe that creating exceptional value additions in healthcare is the best way of offering significant benefits to our customers.\n\nWe apply our vision to make a difference to the lives of our customers and patients, and this in turn helps our employees to reach greater heights in the organization.",
          2
        ),
        block(
          "about-us",
          "mission",
          "Mission",
          "There are two key aspects to Advance Diagnostic Lab's past and future success: our vision of maintaining world class standards and the values that we live by every day, as a company. Our mission:\n\n- To provide accurate and precise diagnostic, prognostic and predictive testing services in a timely manner\n- To ensure that every employee is treated with dignity and respect, and in a fair, consistent and equitable manner\n- To create a stimulating, enabling and supportive work atmosphere\n- To aid and encourage employees in realizing their full potential",
          3
        ),
        block("b2b", "hero", "B2B Services", "Partner with Advance Diagnostic Lab for hospital & clinic referrals or corporate health programs.", 1),
        block("b2b", "benefit-1", "Bulk & Negotiated Pricing", "Volume-based rates for hospitals, clinics and corporate health programs.", 2),
        block("b2b", "benefit-2", "Dedicated Sample Pickup", "Scheduled collection from your premises — no walk-ins required.", 3),
        block("b2b", "benefit-3", "Priority Turnaround", "Faster reporting for partner accounts, with digital report delivery.", 4),
        block("b2b", "benefit-4", "Dedicated Account Manager", "A single point of contact for onboarding, billing and support.", 5),
        block(
          "b2b",
          "type-hospitalclinic",
          "Hospital / Clinic",
          "Referral tie-ups for pathology & microbiology testing, with pickup support for your patients.",
          6
        ),
        block("b2b", "type-corporate", "Corporate", "Employee health check-up packages and on-site sample collection camps.", 7),
        block(
          "contact-us",
          "address",
          "Locate Us.",
          "102, Param Doctor House, Laldarwaja Station, Surat - 395003, Gujarat, INDIA.\nContact No.: 0261 245 1214\nEmail: info@advancelab.org",
          1
        ),
        { PageSlug: "navbar", Key: "brand", Title: "Advance Diagnostic Lab.", Body: null, SortOrder: 1, UpdatedAt: now },
        block(
          "footer",
          "info",
          "Advance Diagnostic Lab.",
          "102, Param Doctor House, Laldarwaja Station, Surat - 395003, Gujarat, INDIA.\nPhone: 0261 245 1214\nEmail: info@advancelab.org",
          1
        ),
        block(
          "research-overview",
          "overview",
          "Overview",
          "Clinical excellence requires a high quality science base and a robust evidence base. With the ever-increasing choice of clinical testing available, there is a compelling need for reliable and value-added services in the field of diagnostics. Advance Diagnostic Labs R&D division plays a major role in fulfilling this need. Research and Development in diagnostics has acquired a new meaning here - the research activities undertaken have been instrumental in translating basic research findings and cutting edge technologies into meaningful disease management tools.\n\nFunctionally, R&D anchors: development of new, clinically relevant biomarkers and assays; value addition activities such as validations and reference range establishment for existing or new assays; and absorption of advanced technologies and emerging concepts in Lab Medicine.",
          1
        ),
        block(
          "research-activities",
          "activities",
          "R&D Activities",
          "- New Assay Development\n- New Technology Evaluation\n- Validations\n- R&D Services in the field of Genomics and Proteomics\n- Contract Research (Clinical and Bio-technological)\n- Knowledge Management",
          1
        ),
        { PageSlug: "research-thrust-areas", Key: "intro", Title: "Thrust Areas of Research", Body: "", SortOrder: 1, UpdatedAt: now },
      ],
    });
  }

  const hasFooterLinks = await prisma.footerLink.count();
  if (!hasFooterLinks) {
    const link = (groupKey: string, label: string, url: string, sort: number) => ({
      GroupKey: groupKey,
      Label: label,
      Url: url,
      SortOrder: sort,
      IsActive: true,
    });

    await prisma.footerLink.createMany({
      data: [
        link("service", "Pathology", "/services/pathology", 1),
        link("service", "Microbiology", "/services/microbiology", 2),
        link("rnd", "Overview", "/research/overview", 1),
        link("rnd", "Thrust Areas of Research", "/research/thrust-areas", 2),
        link("rnd", "R&D Activities", "/research/activities", 3),
        link("social", "Facebook", "https://www.facebook.com/advance.diagnostic.5", 1),
        link("social", "Twitter", "https://twitter.com/AdvanceLabo", 2),
        link("social", "LinkedIn", "http://in.linkedin.com/pub/advance-diagnostic-lab/7b/251/b02/", 3),
        link("social", "Instagram", "#", 4),
      ],
    });
  }
}
