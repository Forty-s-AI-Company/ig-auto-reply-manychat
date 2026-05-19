import type { Contact, ContactTag } from "@prisma/client";

export type BroadcastCandidate = Pick<Contact, "id" | "consentStatus" | "channelId"> & {
  tags?: Pick<ContactTag, "tagId">[];
};

export function canReceiveBroadcast(contact: Pick<Contact, "consentStatus">) {
  return contact.consentStatus === "opted_in";
}

export function filterBroadcastRecipients<T extends BroadcastCandidate>(
  contacts: T[],
  tagId: string,
) {
  return contacts.filter((contact) => {
    const hasTargetTag = contact.tags?.some((tag) => tag.tagId === tagId) ?? false;
    return hasTargetTag && canReceiveBroadcast(contact);
  });
}

export function isOfficialSendAllowed(channel: {
  type: string;
  enabled: boolean;
  configJson?: unknown;
}) {
  if (channel.type === "mock" || channel.type === "telegram") {
    return channel.enabled;
  }

  // Meta / WhatsApp adapters must not pretend delivery without an enabled,
  // token-backed official setup.
  return channel.enabled;
}
