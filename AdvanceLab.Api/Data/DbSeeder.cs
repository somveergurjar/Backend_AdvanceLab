using AdvanceLab.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AdvanceLab.Api.Data;

// Seeds the DB with the content scraped from the old advancelab.org site,
// plus one default admin account so the panel is usable on first run.
public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await db.Database.MigrateAsync();

        if (!await db.AdminUsers.AnyAsync())
        {
            db.AdminUsers.Add(new AdminUser
            {
                Username = "admin",
                Email = "info@advancelab.org",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin"),
                Role = "Admin"
            });
        }

        if (!await db.ServiceCategories.AnyAsync())
        {
            var pathology = new ServiceCategory
            {
                Name = "Pathology Service",
                Slug = "pathology",
                Description = "Routine and specialised pathology testing.",
                SortOrder = 1,
                Items = new List<ServiceItem>
                {
                    Item("Routine Haematological Test", "CBC, MP, Sickling Test, G-6PD, Blood Group, Coombs Test", 1),
                    Item("HB Electrophoresis", null, 2),
                    Item("Coagulation Profile", "BT/CT, PT/APTT, D-Dimer, Fibrinogen, FDP", 3),
                    Item("Clinical Pathology", "Analysis for Urine, Stool, Body Fluid", 4),
                    Item("Semen Wash for I.U.I.", null, 5),
                    Item("Biochemistry", "All biochemistry in fully automated instrument", 6),
                    Item("Immunoassay", "All hormones, Vit B12 and Vit D3", 7),
                    Item("ELISA Test", "TORCH Complex, ANA, ACA, APLA, LA", 8),
                    Item("Serological Tests", "HIV, HBsAg, Syphilis, HCV", 9),
                    Item("Biopsy Reporting", null, 10),
                    Item("Pap Smear Reporting", null, 11),
                    Item("FNAC Procedure and Reporting", null, 12),
                    Item("Tumour Markers", "AFP, CA125, CA19.9, CA15-3, CEA", 13),
                    Item("Critical Tests", "Arterial Blood Gas Analysis, Electrolytes, CPK Total, CPK-MB, Troponin", 14),
                }
            };

            var microbiology = new ServiceCategory
            {
                Name = "Microbiology Service",
                Slug = "microbiology",
                Description = "Culture, sensitivity and microbial testing.",
                SortOrder = 2,
                Items = new List<ServiceItem>
                {
                    Item("Culture and Sensitivity", null, 1),
                    Item("Culture and Sensitivity for Specific Pathogens", null, 2),
                    Item("Fungus Culture and Sensitivity", null, 3),
                    Item("Acid Fast Bacilli Culture and Sensitivity", null, 4),
                    Item("Stained Smear Examination", "AFB, Gram, Hanging Drop, Albert Stain, Spore Stain", 5),
                    Item("MIC Determination", null, 6),
                    Item("Parasite Detection", null, 7),
                    Item("Antituberculous Activity of Unknown Compound", null, 8),
                }
            };

            var campProfiles = new ServiceCategory
            {
                Name = "Camp Profiles",
                Slug = "camp-profiles",
                Description = "Health check-up camp packages.",
                SortOrder = 3,
                Items = new List<ServiceItem>()
            };

            db.ServiceCategories.AddRange(pathology, microbiology, campProfiles);
        }

        if (!await db.ContentBlocks.AnyAsync())
        {
            db.ContentBlocks.AddRange(
                new ContentBlock
                {
                    PageSlug = "home", Key = "welcome",
                    Title = "Welcome Advance Diagnostic Lab.",
                    Body = "Advance Diagnostic Lab. deals with a wide variety of diagnostic tests of pathology and microbiological samples including Operation Theater swabbing, sterility check of sanitized rooms and materials, Acid Fast Bacilli culture by Lowenstein-Jensen medium, Bacteriological culture (Pus, Urine, Blood, Stool, etc.), Fungus culture of skin, nail, hair, etc. We also deal with microbial testing of water, cloth, waste-water and milk samples.",
                    SortOrder = 1
                },
                new ContentBlock
                {
                    PageSlug = "about-us", Key = "intro",
                    Title = "About Advance Diagnostic Lab.",
                    Body = "Advance Diagnostic Laboratory, Surat - serving pathology and microbiology diagnostics since 2012.",
                    SortOrder = 1
                },
                new ContentBlock
                {
                    PageSlug = "about-us", Key = "vision",
                    Title = "Vision",
                    Body = "Our considerable experience and expertise in the field of Diagnostics Services has helped to address the growing health ailments by providing accurate & timely diagnosis with the help of specialized technologies and innovative services.\n\nAdvance Diagnostic Lab is committed to working with our customers, patients, clinicians and researchers to help them meet their individual needs. We firmly believe that creating exceptional value additions in healthcare is the best way of offering significant benefits to our customers.\n\nWe apply our vision to make a difference to the lives of our customers and patients, and this in turn helps our employees to reach greater heights in the organization.",
                    SortOrder = 2
                },
                new ContentBlock
                {
                    PageSlug = "about-us", Key = "mission",
                    Title = "Mission",
                    Body = "There are two key aspects to Advance Diagnostic Lab's past and future success: our vision of maintaining world class standards and the values that we live by every day, as a company. Our mission:\n\n- To provide accurate and precise diagnostic, prognostic and predictive testing services in a timely manner\n- To ensure that every employee is treated with dignity and respect, and in a fair, consistent and equitable manner\n- To create a stimulating, enabling and supportive work atmosphere\n- To aid and encourage employees in realizing their full potential",
                    SortOrder = 3
                },
                new ContentBlock
                {
                    PageSlug = "b2b", Key = "hero",
                    Title = "B2B Services",
                    Body = "Partner with Advance Diagnostic Lab for hospital & clinic referrals or corporate health programs.",
                    SortOrder = 1
                },
                new ContentBlock
                {
                    PageSlug = "b2b", Key = "benefit-1",
                    Title = "Bulk & Negotiated Pricing",
                    Body = "Volume-based rates for hospitals, clinics and corporate health programs.",
                    SortOrder = 2
                },
                new ContentBlock
                {
                    PageSlug = "b2b", Key = "benefit-2",
                    Title = "Dedicated Sample Pickup",
                    Body = "Scheduled collection from your premises — no walk-ins required.",
                    SortOrder = 3
                },
                new ContentBlock
                {
                    PageSlug = "b2b", Key = "benefit-3",
                    Title = "Priority Turnaround",
                    Body = "Faster reporting for partner accounts, with digital report delivery.",
                    SortOrder = 4
                },
                new ContentBlock
                {
                    PageSlug = "b2b", Key = "benefit-4",
                    Title = "Dedicated Account Manager",
                    Body = "A single point of contact for onboarding, billing and support.",
                    SortOrder = 5
                },
                new ContentBlock
                {
                    PageSlug = "b2b", Key = "type-hospitalclinic",
                    Title = "Hospital / Clinic",
                    Body = "Referral tie-ups for pathology & microbiology testing, with pickup support for your patients.",
                    SortOrder = 6
                },
                new ContentBlock
                {
                    PageSlug = "b2b", Key = "type-corporate",
                    Title = "Corporate",
                    Body = "Employee health check-up packages and on-site sample collection camps.",
                    SortOrder = 7
                },
                new ContentBlock
                {
                    PageSlug = "contact-us", Key = "address",
                    Title = "Locate Us.",
                    Body = "102, Param Doctor House, Laldarwaja Station, Surat - 395003, Gujarat, INDIA.\nContact No.: 0261 245 1214\nEmail: info@advancelab.org",
                    SortOrder = 1
                },
                new ContentBlock
                {
                    PageSlug = "navbar", Key = "brand",
                    Title = "Advance Diagnostic Lab.",
                    SortOrder = 1
                },
                new ContentBlock
                {
                    PageSlug = "footer", Key = "info",
                    Title = "Advance Diagnostic Lab.",
                    Body = "102, Param Doctor House, Laldarwaja Station, Surat - 395003, Gujarat, INDIA.\nPhone: 0261 245 1214\nEmail: info@advancelab.org",
                    SortOrder = 1
                },
                new ContentBlock
                {
                    PageSlug = "research-overview", Key = "overview",
                    Title = "Overview",
                    Body = "Clinical excellence requires a high quality science base and a robust evidence base. With the ever-increasing choice of clinical testing available, there is a compelling need for reliable and value-added services in the field of diagnostics. Advance Diagnostic Labs R&D division plays a major role in fulfilling this need. Research and Development in diagnostics has acquired a new meaning here - the research activities undertaken have been instrumental in translating basic research findings and cutting edge technologies into meaningful disease management tools.\n\nFunctionally, R&D anchors: development of new, clinically relevant biomarkers and assays; value addition activities such as validations and reference range establishment for existing or new assays; and absorption of advanced technologies and emerging concepts in Lab Medicine.",
                    SortOrder = 1
                },
                new ContentBlock
                {
                    PageSlug = "research-activities", Key = "activities",
                    Title = "R&D Activities",
                    Body = "- New Assay Development\n- New Technology Evaluation\n- Validations\n- R&D Services in the field of Genomics and Proteomics\n- Contract Research (Clinical and Bio-technological)\n- Knowledge Management",
                    SortOrder = 1
                },
                new ContentBlock
                {
                    // The original site's "Thrust Areas of Research" page returned a server error
                    // with no recoverable content, so this starts empty for the admin to fill in.
                    PageSlug = "research-thrust-areas", Key = "intro",
                    Title = "Thrust Areas of Research",
                    Body = "",
                    SortOrder = 1
                }
            );
        }

        await db.SaveChangesAsync();
    }

    private static ServiceItem Item(string name, string? description, int sort) => new()
    {
        Name = name,
        Description = description,
        Price = 0,
        SortOrder = sort
    };
}
