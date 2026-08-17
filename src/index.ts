import "dotenv/config";
import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import { assertRequiredEnv } from "./lib/env";
import { seed } from "./lib/seed";
import { authRouter } from "./routes/auth";
import { appointmentsRouter } from "./routes/appointments";
import { b2bInquiriesRouter } from "./routes/b2bInquiries";
import { callbackRequestsRouter } from "./routes/callbackRequests";
import { contactMessagesRouter } from "./routes/contactMessages";
import { contentRouter } from "./routes/content";
import { featureCardsRouter } from "./routes/featureCards";
import { footerLinksRouter } from "./routes/footerLinks";
import { servicesRouter } from "./routes/services";
import { testimonialsRouter } from "./routes/testimonials";
import { uploadRouter } from "./routes/upload";

assertRequiredEnv();

export const app = express();
const port = Number(process.env.PORT ?? 5081);

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? "").split(",").map((o) => o.trim()).filter(Boolean);

app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());
app.use(express.json());
// Helmet's default Cross-Origin-Resource-Policy is "same-origin", which
// silently blocks <img src> loads from a different origin (the SPA and API
// are separate origins both in local dev - :5173 vs :5080 - and in
// production - Vercel vs Render). Uploaded images need to be embeddable
// cross-origin, so relax the policy just for this static route.
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "..", "wwwroot", "uploads"))
);

app.use("/api/auth", authRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/b2b-inquiries", b2bInquiriesRouter);
app.use("/api/callback-requests", callbackRequestsRouter);
app.use("/api/contact-messages", contactMessagesRouter);
app.use("/api/content", contentRouter);
app.use("/api/features", featureCardsRouter);
app.use("/api/footer-links", footerLinksRouter);
app.use("/api/services", servicesRouter);
app.use("/api/testimonials", testimonialsRouter);
app.use("/api/upload", uploadRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "An unexpected error occurred." });
});

if (require.main === module) {
  seed()
    .then(() => {
      app.listen(port, () => {
        console.log(`AdvanceLab API (Node) listening on http://localhost:${port}`);
      });
    })
    .catch((err) => {
      console.error("Failed to seed database:", err);
      process.exit(1);
    });
}
