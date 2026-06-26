import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireApiUser: vi.fn(),
  getCurrentWorkspaceId: vi.fn(),
  getSelectedInstagramChannelId: vi.fn(),
  encryptMetaConfigJson: vi.fn((value: unknown) => value),
  createPlanInvoice: vi.fn(),
  completeInternalInvoicePaymentOrder: vi.fn(),
  getPlan: vi.fn(),
  getPlanAmount: vi.fn(),
  assertRateLimit: vi.fn(),
  assertSameOriginRequest: vi.fn(),
  getClientIp: vi.fn(),
  createMerchantTradeNo: vi.fn(),
  createPayuniCheckout: vi.fn(),
  getPayuniConfig: vi.fn(),
  isPayuniSandboxGateway: vi.fn(),
  renderAutoSubmitForm: vi.fn(),
  findOrCreateOpenConversation: vi.fn(),
  runManualAutomation: vi.fn(),
  db: {
    channel: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    contact: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    tag: {
      findFirst: vi.fn(),
    },
    contactTag: {
      upsert: vi.fn(),
      createMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    segment: {
      create: vi.fn(),
    },
    automation: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    automationFolder: {
      findFirst: vi.fn(),
    },
    automationStep: {
      deleteMany: vi.fn(),
    },
    paymentOrder: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({ requireApiUser: mocks.requireApiUser }));
vi.mock("@/lib/workspaces", () => ({ getCurrentWorkspaceId: mocks.getCurrentWorkspaceId }));
vi.mock("@/lib/db", () => ({ getDb: () => mocks.db }));
vi.mock("@/lib/channels/meta", () => ({ encryptMetaConfigJson: mocks.encryptMetaConfigJson }));
vi.mock("@/lib/channels/public", () => ({ publicChannelSelect: { id: true, name: true } }));
vi.mock("@/lib/account-scope", () => ({
  ALL_IG_ACCOUNTS: "all",
  IG_ACCOUNT_SCOPE_COOKIE: "ig_account_scope",
  getSelectedInstagramChannelId: mocks.getSelectedInstagramChannelId,
  instagramChannelWhere: (channelId?: string, workspaceId?: string) =>
    channelId
      ? { channelId, ...(workspaceId ? { channel: { workspaceId } } : {}) }
      : { channel: { ...(workspaceId ? { workspaceId } : {}) } },
}));
vi.mock("@/lib/billing/invoice-service", () => ({ createPlanInvoice: mocks.createPlanInvoice }));
vi.mock("@/lib/billing/payment-service", () => ({
  completeInternalInvoicePaymentOrder: mocks.completeInternalInvoicePaymentOrder,
}));
vi.mock("@/lib/billing/plans", () => ({ getPlan: mocks.getPlan, getPlanAmount: mocks.getPlanAmount }));
vi.mock("@/lib/security", () => ({
  assertRateLimit: mocks.assertRateLimit,
  assertSameOriginRequest: mocks.assertSameOriginRequest,
  getClientIp: mocks.getClientIp,
}));
vi.mock("@/lib/payuni", () => ({
  createMerchantTradeNo: mocks.createMerchantTradeNo,
  createPayuniCheckout: mocks.createPayuniCheckout,
  getPayuniConfig: mocks.getPayuniConfig,
  isPayuniSandboxGateway: mocks.isPayuniSandboxGateway,
  renderAutoSubmitForm: mocks.renderAutoSubmitForm,
}));
vi.mock("@/lib/messages", () => ({ findOrCreateOpenConversation: mocks.findOrCreateOpenConversation }));
vi.mock("@/lib/automation/triggers", () => ({ runManualAutomation: mocks.runManualAutomation }));
vi.mock("@/lib/audit", () => ({ recordAuditEvent: vi.fn() }));

import { POST as automationRunPost } from "@/app/api/automations/[id]/run/route";
import { PUT as automationPut } from "@/app/api/automations/[id]/route";
import { POST as billingCheckoutPost } from "@/app/api/billing/payuni/checkout/route";
import { PATCH as channelPatch } from "@/app/api/channels/[id]/route";
import { DELETE as contactBatchTagsDelete, POST as contactBatchTagsPost } from "@/app/api/contacts/batch-tags/route";
import { POST as contactSegmentPost } from "@/app/api/contacts/segments/route";
import { GET as contactGet } from "@/app/api/contacts/[id]/route";
import { PATCH as contactPatch } from "@/app/api/contacts/[id]/route";
import { POST as contactTagPost } from "@/app/api/contacts/[id]/tags/route";

function jsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function formRequest(body: Record<string, string>, headers?: HeadersInit) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(body)) formData.set(key, value);
  return new Request("http://local.test/api/billing/payuni/checkout", {
    method: "POST",
    body: formData,
    headers,
  });
}

describe("tenant isolation route regressions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    mocks.requireApiUser.mockResolvedValue({
      user: { id: "user-a", email: "owner@example.com" },
      response: null,
    });
    mocks.getCurrentWorkspaceId.mockResolvedValue("workspace-a");
    mocks.getSelectedInstagramChannelId.mockResolvedValue(undefined);
    mocks.assertSameOriginRequest.mockReturnValue(null);
    mocks.assertRateLimit.mockResolvedValue(null);
    mocks.getClientIp.mockReturnValue("127.0.0.1");
  });

  it("does not update a channel unless the id belongs to the current workspace", async () => {
    mocks.db.channel.findFirst.mockResolvedValue(null);

    const response = await channelPatch(
      new Request("http://local.test/api/channels/channel-b", {
        method: "PATCH",
        body: JSON.stringify({ enabled: false }),
      }),
      { params: Promise.resolve({ id: "channel-b" }) },
    );

    expect(response.status).toBe(404);
    expect(mocks.db.channel.findFirst).toHaveBeenCalledWith({
      where: { id: "channel-b", workspaceId: "workspace-a" },
      select: { id: true },
    });
    expect(mocks.db.channel.update).not.toHaveBeenCalled();
  });

  it("scopes contact reads to the current workspace through the contact channel", async () => {
    mocks.db.contact.findFirst.mockResolvedValue(null);

    const response = await contactGet(new Request("http://local.test/api/contacts/contact-b"), {
      params: Promise.resolve({ id: "contact-b" }),
    });

    expect(response.status).toBe(404);
    expect(mocks.db.contact.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: "contact-b",
          channel: { workspaceId: "workspace-a" },
        }),
      }),
    );
  });

  it("does not tag a contact from another workspace", async () => {
    mocks.db.contact.findFirst.mockResolvedValue(null);

    const response = await contactTagPost(jsonRequest("http://local.test/api/contacts/contact-b/tags", { tagId: "tag-a" }), {
      params: Promise.resolve({ id: "contact-b" }),
    });

    expect(response.status).toBe(404);
    expect(mocks.db.contact.findFirst).toHaveBeenCalledWith({
      where: {
        id: "contact-b",
        channel: { workspaceId: "workspace-a" },
      },
      select: { id: true },
    });
  });

  it("does not update a contact from another workspace", async () => {
    mocks.db.contact.findFirst.mockResolvedValue(null);

    const response = await contactPatch(
      new Request("http://local.test/api/contacts/contact-b", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: "new-name", email: "lead@example.com", phone: "0912345678" }),
      }),
      { params: Promise.resolve({ id: "contact-b" }) },
    );

    expect(response.status).toBe(404);
    expect(mocks.db.contact.findFirst).toHaveBeenCalledWith({
      where: {
        id: "contact-b",
        channel: { workspaceId: "workspace-a" },
      },
      select: { id: true },
    });
    expect(mocks.db.contact.update).not.toHaveBeenCalled();
  });

  it("does not attach a tag unless the tag belongs to the current workspace", async () => {
    mocks.db.contact.findFirst.mockResolvedValue({ id: "contact-a" });
    mocks.db.tag.findFirst.mockResolvedValue(null);

    const response = await contactTagPost(jsonRequest("http://local.test/api/contacts/contact-a/tags", { tagId: "tag-b" }), {
      params: Promise.resolve({ id: "contact-a" }),
    });

    expect(response.status).toBe(404);
    expect(mocks.db.tag.findFirst).toHaveBeenCalledWith({
      where: { id: "tag-b", workspaceId: "workspace-a" },
      select: { id: true },
    });
    expect(mocks.db.contactTag.createMany).not.toHaveBeenCalled();
  });

  it("batch tags only contacts scoped to the current workspace", async () => {
    mocks.db.tag.findFirst.mockResolvedValue({ id: "tag-a" });
    mocks.db.contact.findMany.mockResolvedValue([{ id: "contact-a" }]);
    mocks.db.contactTag.createMany.mockResolvedValue({ count: 1 });

    const response = await contactBatchTagsPost(
      jsonRequest("http://local.test/api/contacts/batch-tags", {
        contactIds: ["contact-a", "contact-b"],
        tagId: "tag-a",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true, count: 1, scopedCount: 1 });
    expect(mocks.db.tag.findFirst).toHaveBeenCalledWith({
      where: { id: "tag-a", workspaceId: "workspace-a" },
      select: { id: true },
    });
    expect(mocks.db.contact.findMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["contact-a", "contact-b"] },
        channel: { workspaceId: "workspace-a" },
      },
      select: { id: true },
    });
    expect(mocks.db.contactTag.createMany).toHaveBeenCalledWith({
      data: [{ contactId: "contact-a", tagId: "tag-a" }],
      skipDuplicates: true,
    });
  });

  it("does not batch tag contacts when the tag is outside the current workspace", async () => {
    mocks.db.tag.findFirst.mockResolvedValue(null);

    const response = await contactBatchTagsPost(
      jsonRequest("http://local.test/api/contacts/batch-tags", {
        contactIds: ["contact-a"],
        tagId: "tag-b",
      }),
    );

    expect(response.status).toBe(404);
    expect(mocks.db.contact.findMany).not.toHaveBeenCalled();
    expect(mocks.db.contactTag.createMany).not.toHaveBeenCalled();
  });

  it("batch removes tags only from contacts scoped to the current workspace", async () => {
    mocks.db.tag.findFirst.mockResolvedValue({ id: "tag-a" });
    mocks.db.contact.findMany.mockResolvedValue([{ id: "contact-a" }]);
    mocks.db.contactTag.deleteMany.mockResolvedValue({ count: 1 });

    const response = await contactBatchTagsDelete(
      jsonRequest("http://local.test/api/contacts/batch-tags", {
        contactIds: ["contact-a", "contact-b"],
        tagId: "tag-a",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true, count: 1, scopedCount: 1 });
    expect(mocks.db.tag.findFirst).toHaveBeenCalledWith({
      where: { id: "tag-a", workspaceId: "workspace-a" },
      select: { id: true },
    });
    expect(mocks.db.contact.findMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["contact-a", "contact-b"] },
        channel: { workspaceId: "workspace-a" },
      },
      select: { id: true },
    });
    expect(mocks.db.contactTag.deleteMany).toHaveBeenCalledWith({
      where: {
        tagId: "tag-a",
        contactId: { in: ["contact-a"] },
      },
    });
  });

  it("does not create a contact-filter segment when the tag is outside the current workspace", async () => {
    mocks.db.tag.findFirst.mockResolvedValue(null);

    const response = await contactSegmentPost(
      jsonRequest("http://local.test/api/contacts/segments", {
        name: "Cross workspace segment",
        q: "lead",
        status: "opted_in",
        tagId: "tag-b",
      }),
    );

    expect(response.status).toBe(404);
    expect(mocks.db.tag.findFirst).toHaveBeenCalledWith({
      where: { id: "tag-b", workspaceId: "workspace-a" },
      select: { id: true },
    });
    expect(mocks.db.segment.create).not.toHaveBeenCalled();
  });

  it("creates contact-filter segments with workspace and selected Instagram channel scope", async () => {
    mocks.getSelectedInstagramChannelId.mockResolvedValue("channel-a");
    mocks.db.tag.findFirst.mockResolvedValue({ id: "tag-a" });
    mocks.db.segment.create.mockResolvedValue({ id: "segment-a", name: "Filtered leads" });

    const response = await contactSegmentPost(
      jsonRequest("http://local.test/api/contacts/segments", {
        name: "Filtered leads",
        description: "from contacts",
        q: "lead",
        status: "opted_in",
        tagId: "tag-a",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ id: "segment-a", name: "Filtered leads" });
    expect(mocks.db.segment.create).toHaveBeenCalledWith({
      data: {
        workspaceId: "workspace-a",
        name: "Filtered leads",
        description: "from contacts",
        filterJson: {
          q: "lead",
          consentStatus: "opted_in",
          tagId: "tag-a",
          channelId: "channel-a",
        },
      },
    });
  });

  it("does not update an automation unless the automation and folder belong to the current workspace", async () => {
    mocks.db.automationFolder.findFirst.mockResolvedValue(null);

    const response = await automationPut(
      jsonRequest("http://local.test/api/automations/automation-b", {
        name: "Cross workspace edit",
        enabled: true,
        triggerType: "manual",
        folderId: "folder-b",
        triggerConfigJson: {},
        steps: [{ order: 1, type: "send_message", configJson: { text: "hello" } }],
      }),
      { params: Promise.resolve({ id: "automation-b" }) },
    );

    expect(response.status).toBe(404);
    expect(mocks.db.automationFolder.findFirst).toHaveBeenCalledWith({
      where: { id: "folder-b", workspaceId: "workspace-a" },
      select: { id: true },
    });
    expect(mocks.db.automationStep.deleteMany).not.toHaveBeenCalled();
    expect(mocks.db.automation.update).not.toHaveBeenCalled();
  });

  it("does not run a manual automation for a contact outside the current workspace", async () => {
    mocks.db.automation.findFirst.mockResolvedValue({ id: "automation-a" });
    mocks.db.contact.findFirst.mockResolvedValue(null);

    const response = await automationRunPost(
      jsonRequest("http://local.test/api/automations/automation-a/run", {
        contactId: "contact-b",
        text: "manual trigger",
      }),
      { params: Promise.resolve({ id: "automation-a" }) },
    );

    expect(response.status).toBe(404);
    expect(mocks.db.automation.findFirst).toHaveBeenCalledWith({
      where: { id: "automation-a", workspaceId: "workspace-a", enabled: true, triggerType: "manual" },
      select: { id: true },
    });
    expect(mocks.db.contact.findFirst).toHaveBeenCalledWith({
      where: { id: "contact-b", channel: { workspaceId: "workspace-a" } },
      select: { id: true, channelId: true },
    });
    expect(mocks.runManualAutomation).not.toHaveBeenCalled();
  });

  it("scopes PayUNI idempotency lookup and invoice creation to the current workspace and user", async () => {
    mocks.getPlan.mockReturnValue({ key: "creator", name: "Creator" });
    mocks.getPlanAmount.mockReturnValue(5990);
    mocks.db.paymentOrder.findFirst.mockResolvedValue(null);
    mocks.createPlanInvoice.mockResolvedValue({ id: "invoice-a", totalAmount: 0, currency: "TWD" });
    mocks.completeInternalInvoicePaymentOrder.mockResolvedValue({ alreadyProcessed: false });

    const response = await billingCheckoutPost(
      formRequest(
        {
          planKey: "creator",
          interval: "month",
          useCredits: "true",
        },
        { "idempotency-key": "idem-a" },
      ),
    );

    expect(response.status).toBe(303);
    expect(mocks.db.paymentOrder.findFirst).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.objectContaining({
          workspaceId: "workspace-a",
          userId: "user-a",
          provider: "payuni",
          status: "pending",
          planKey: "creator",
        }),
      }),
    );
    expect(mocks.db.paymentOrder.findFirst).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: expect.objectContaining({
          workspaceId: "workspace-a",
          userId: "user-a",
          provider: { in: ["payuni", "internal_credit"] },
          status: "paid",
          planKey: "creator",
        }),
      }),
    );
    expect(mocks.createPlanInvoice).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-a",
        workspaceId: "workspace-a",
        planKey: "creator",
      }),
    );
  });
});
