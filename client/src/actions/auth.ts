"use server";
import { protectLoginRules, protectSignupRules } from "@/arcjet";
import { request } from "@arcjet/next";

type ArcjetDecision = {
  isDenied: () => boolean;
  reason: {
    isEmail: () => boolean;
    isBot?: () => boolean;
    isRateLimit?: () => boolean;
    emailTypes?: string[];
  };
};

// Helper: try Arcjet request with timeout and retry
const tryArcjet = async (
  fn: (req: any) => Promise<ArcjetDecision>,
  email: string,
  retries = 1
): Promise<ArcjetDecision | null> => {
  try {
    const req = await request();
    const decision = (await Promise.race([
      fn(req), // <-- only req is passed
      new Promise<ArcjetDecision>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 10000)
      )
    ])) as ArcjetDecision;
    return decision;
  } catch (error) {
    console.error("Arcjet error:", error);
    if (retries > 0) {
      console.log("Retrying Arcjet request...");
      return tryArcjet(fn, email, retries - 1);
    }
    return null;
  }
};

export const protectSignUpAction = async (email: string) => {
  const decision = await tryArcjet((req) => protectSignupRules.protect(req, { email }), email, 1);

  if (!decision) return { success: true }; // fallback if Arcjet fails

  if (decision.isDenied()) {
    if (decision.reason.isEmail() && decision.reason.emailTypes) {
      const emailTypes = decision.reason.emailTypes;
      if (emailTypes.includes("DISPOSABLE"))
        return { error: "Disposable email address are not allowed", success: false, status: 403 };
      if (emailTypes.includes("INVALID"))
        return { error: "Invalid email", success: false, status: 403 };
      if (emailTypes.includes("NO_MX_RECORDS"))
        return {
          error: "Email domain does not have valid MX Records! Please try with different email",
          success: false,
          status: 403,
        };
    } else if (decision.reason.isBot && decision.reason.isBot()) {
      return { error: "Bot activity detected", success: false, status: 403 };
    } else if (decision.reason.isRateLimit && decision.reason.isRateLimit()) {
      return { error: "Too many requests! Please try again later", success: false, status: 403 };
    }
  }

  return { success: true };
};

export const protectSignInAction = async (email: string) => {
  const decision = await tryArcjet((req) => protectLoginRules.protect(req, { email }), email, 1);

  if (!decision) return { success: true }; // fallback if Arcjet fails

  if (decision.isDenied()) {
    if (decision.reason.isEmail() && decision.reason.emailTypes) {
      const emailTypes = decision.reason.emailTypes;
      if (emailTypes.includes("DISPOSABLE"))
        return { error: "Disposable email address are not allowed", success: false, status: 403 };
      if (emailTypes.includes("INVALID"))
        return { error: "Invalid email", success: false, status: 403 };
      if (emailTypes.includes("NO_MX_RECORDS"))
        return {
          error: "Email domain does not have valid MX Records! Please try with different email",
          success: false,
          status: 403,
        };
    } else if (decision.reason.isRateLimit && decision.reason.isRateLimit()) {
      return { error: "Too many requests! Please try again later", success: false, status: 403 };
    }
  }

  return { success: true };
};

