import type { SandboxMetaBusinessProviderId } from "@/lib/meta-business-sandbox";

export type SandboxCodeExchangeInput = {
  providerId: SandboxMetaBusinessProviderId;
  code: string | null;
  redirectUri: string | null;
  exchangeEnabled?: boolean;
  exchangeClient?: (input: { providerId: SandboxMetaBusinessProviderId; code: string; redirectUri: string }) => Promise<unknown>;
};

export type SandboxCodeExchangeResult =
  | {
      status: "skipped";
      mode: "dry_run";
      providerId: SandboxMetaBusinessProviderId;
      exchangeAttempted: false;
      code: "[REDACTED_CODE]" | null;
      token: null;
      errorType: null;
    }
  | {
      status: "error";
      mode: "dry_run";
      providerId: SandboxMetaBusinessProviderId;
      exchangeAttempted: boolean;
      code: "[REDACTED_CODE]" | null;
      token: null;
      errorType: "code_required" | "redirect_uri_required" | "exchange_client_required" | "token_exchange_failed";
    }
  | {
      status: "success";
      mode: "dry_run";
      providerId: SandboxMetaBusinessProviderId;
      exchangeAttempted: true;
      code: "[REDACTED_CODE]";
      token: "[REDACTED_TOKEN]";
      errorType: null;
    };

export function classifySandboxTokenExchangeError(error: unknown) {
  if (error instanceof Error && /redirect/i.test(error.message)) return "redirect_uri_required" as const;
  if (error instanceof Error && /code/i.test(error.message)) return "code_required" as const;
  return "token_exchange_failed" as const;
}

export async function exchangeSandboxAuthorizationCode(input: SandboxCodeExchangeInput): Promise<SandboxCodeExchangeResult> {
  if (!input.code) {
    return {
      status: "error",
      mode: "dry_run",
      providerId: input.providerId,
      exchangeAttempted: false,
      code: null,
      token: null,
      errorType: "code_required",
    };
  }

  if (!input.exchangeEnabled) {
    return {
      status: "skipped",
      mode: "dry_run",
      providerId: input.providerId,
      exchangeAttempted: false,
      code: "[REDACTED_CODE]",
      token: null,
      errorType: null,
    };
  }

  if (!input.redirectUri) {
    return {
      status: "error",
      mode: "dry_run",
      providerId: input.providerId,
      exchangeAttempted: false,
      code: "[REDACTED_CODE]",
      token: null,
      errorType: "redirect_uri_required",
    };
  }

  if (!input.exchangeClient) {
    return {
      status: "error",
      mode: "dry_run",
      providerId: input.providerId,
      exchangeAttempted: false,
      code: "[REDACTED_CODE]",
      token: null,
      errorType: "exchange_client_required",
    };
  }

  try {
    await input.exchangeClient({ providerId: input.providerId, code: input.code, redirectUri: input.redirectUri });
    return {
      status: "success",
      mode: "dry_run",
      providerId: input.providerId,
      exchangeAttempted: true,
      code: "[REDACTED_CODE]",
      token: "[REDACTED_TOKEN]",
      errorType: null,
    };
  } catch (error) {
    return {
      status: "error",
      mode: "dry_run",
      providerId: input.providerId,
      exchangeAttempted: true,
      code: "[REDACTED_CODE]",
      token: null,
      errorType: classifySandboxTokenExchangeError(error),
    };
  }
}
