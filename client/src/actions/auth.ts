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

export const protectSignUpAction = async (email: string) => {
  try {
    const req = await request();
    const decision = (await Promise.race([
      protectSignupRules.protect(req, { email }),
      new Promise<ArcjetDecision>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 3000)
      )
    ])) as ArcjetDecision; // <-- type assertion added

    if (decision.isDenied()) {
      if (decision.reason.isEmail() && decision.reason.emailTypes) {
        const emailTypes = decision.reason.emailTypes;
        if (emailTypes.includes("DISPOSABLE")) {
          return { error: "Disposable email address are not allowed", success: false, status: 403 };
        } else if (emailTypes.includes("INVALID")) {
          return { error: "Invalid email", success: false, status: 403 };
        } else if (emailTypes.includes("NO_MX_RECORDS")) {
          return {
            error: "Email domain does not have valid MX Records! Please try with different email",
            success: false,
            status: 403,
          };
        }
      } else if (decision.reason.isBot && decision.reason.isBot()) {
        return { error: "Bot activity detected", success: false, status: 403 };
      } else if (decision.reason.isRateLimit && decision.reason.isRateLimit()) {
        return { error: "Too many requests! Please try again later", success: false, status: 403 };
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Arcjet error:", error);
    return { success: true };
  }
};

export const protectSignInAction = async (email: string) => {
  try {
    const req = await request();
    const decision = (await Promise.race([
      protectLoginRules.protect(req, { email }),
      new Promise<ArcjetDecision>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 3000)
      )
    ])) as ArcjetDecision; // <-- type assertion added

    if (decision.isDenied()) {
      if (decision.reason.isEmail() && decision.reason.emailTypes) {
        const emailTypes = decision.reason.emailTypes;
        if (emailTypes.includes("DISPOSABLE")) {
          return { error: "Disposable email address are not allowed", success: false, status: 403 };
        } else if (emailTypes.includes("INVALID")) {
          return { error: "Invalid email", success: false, status: 403 };
        } else if (emailTypes.includes("NO_MX_RECORDS")) {
          return {
            error: "Email domain does not have valid MX Records! Please try with different email",
            success: false,
            status: 403,
          };
        }
      } else if (decision.reason.isRateLimit && decision.reason.isRateLimit()) {
        return { error: "Too many requests! Please try again later", success: false, status: 403 };
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Arcjet error:", error);
    return { success: true };
  }
};
