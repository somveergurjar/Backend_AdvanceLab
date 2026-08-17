import { z } from "zod";

// --- Auth ---
export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username and password are required."),
  password: z.string().min(1, "Username and password are required."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, "Reset token is required."),
  newPassword: z.string().min(6, "Password must be at least 6 characters."),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(6, "Password must be at least 6 characters."),
});

export const updateProfileSchema = z.object({
  username: z.string().trim().min(1, "Username and email are required."),
  email: z.string().trim().email("Enter a valid email address."),
  avatarUrl: z.string().trim().min(1).nullish(),
});

// --- Appointments ---
export const createAppointmentSchema = z.object({
  name: z.string().trim().min(1, "Name, address and phone number are required."),
  address: z.string().trim().min(1, "Name, address and phone number are required."),
  phoneNo: z.string().trim().min(1, "Name, address and phone number are required."),
  email: z.string().trim().email().nullish().or(z.literal("")),
  serviceItemId: z.number().int().nullish(),
  collectionDateTime: z.coerce.date({ message: "A valid collection date/time is required." }),
  description: z.string().trim().nullish(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(["Pending", "Confirmed", "Completed", "Cancelled"]),
  rejectionReason: z.string().trim().nullish(),
});

// --- B2B Inquiries ---
export const createB2BInquirySchema = z.object({
  organizationName: z.string().trim().min(1, "Organization name, contact person, email and phone are required."),
  contactPerson: z.string().trim().min(1, "Organization name, contact person, email and phone are required."),
  email: z.string().trim().email("Organization name, contact person, email and phone are required."),
  phone: z.string().trim().min(1, "Organization name, contact person, email and phone are required."),
  businessType: z.enum(["HospitalClinic", "Corporate"]),
  city: z.string().trim().nullish(),
  message: z.string().trim().nullish(),
});

export const updateB2BStatusSchema = z.object({
  status: z.enum(["New", "Contacted", "Closed"]),
});

// --- Callback requests ---
export const createCallbackRequestSchema = z.object({
  name: z.string().trim().nullish(),
  phoneNo: z.string().trim().regex(/^\d{10}$/, "Enter a valid 10-digit phone number."),
});

// --- Contact messages ---
export const createContactMessageSchema = z.object({
  name: z.string().trim().min(1, "Name and message are required."),
  email: z.string().trim().email().nullish().or(z.literal("")),
  phone: z.string().trim().nullish(),
  message: z.string().trim().min(1, "Name and message are required."),
});

// --- Content blocks / images ---
export const upsertContentBlockSchema = z.object({
  pageSlug: z.string().trim().min(1),
  key: z.string().trim().min(1),
  title: z.string().trim().nullish(),
  body: z.string().nullish(),
  imageUrl: z.string().trim().nullish(),
  sortOrder: z.number().int().default(0),
});

export const upsertSiteImageSchema = z.object({
  section: z.string().trim().min(1),
  url: z.string().trim().min(1),
  altText: z.string().trim().nullish(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

// --- Feature cards ---
export const upsertFeatureCardSchema = z.object({
  pageSlug: z.string().trim().min(1),
  iconKey: z.string().trim().min(1),
  title: z.string().trim().min(1),
  body: z.string().trim().nullish(),
  imageUrl: z.string().trim().nullish(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

// --- Services ---
export const upsertServiceCategorySchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  description: z.string().trim().nullish(),
  details: z.string().trim().nullish(),
  imageUrl: z.string().trim().nullish(),
  sortOrder: z.number().int().default(0),
});

export const upsertServiceItemSchema = z.object({
  serviceCategoryId: z.number().int(),
  name: z.string().trim().min(1),
  description: z.string().trim().nullish(),
  price: z.number().nonnegative(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  discountPercent: z.number().int().min(0, "Discount percent must be between 0 and 100.").max(100, "Discount percent must be between 0 and 100.").nullish(),
  offerBadgeText: z.string().trim().nullish(),
});

// --- Footer links ---
export const upsertFooterLinkSchema = z.object({
  groupKey: z.enum(["service", "rnd", "social"]),
  label: z.string().trim().min(1),
  url: z.string().trim().min(1),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

// --- Testimonials ---
export const upsertTestimonialSchema = z.object({
  customerName: z.string().trim().min(1),
  roleOrLocation: z.string().trim().nullish(),
  quote: z.string().trim().min(1),
  rating: z.number().int().min(1).max(5).default(5),
  imageUrl: z.string().trim().nullish(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});
