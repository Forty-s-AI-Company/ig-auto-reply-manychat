import { getDb } from "@/lib/db";

export async function resolveContactFieldDefinition(input: {
  workspaceId: string;
  definitionId?: string;
  key?: string;
}) {
  if (input.definitionId) {
    return getDb().contactFieldDefinition.findFirst({
      where: { id: input.definitionId, workspaceId: input.workspaceId },
    });
  }

  if (input.key) {
    return getDb().contactFieldDefinition.findUnique({
      where: { workspaceId_key: { workspaceId: input.workspaceId, key: input.key } },
    });
  }

  return null;
}

export async function upsertContactFieldValue(input: {
  workspaceId: string;
  contactId: string;
  definitionId?: string;
  key?: string;
  value: string;
}) {
  const definition = await resolveContactFieldDefinition(input);
  if (!definition) throw new Error("找不到這個自訂欄位。");

  const contact = await getDb().contact.findFirst({
    where: { id: input.contactId, channel: { workspaceId: input.workspaceId } },
    select: { id: true },
  });
  if (!contact) throw new Error("找不到這個工作區的聯絡人。");

  return getDb().contactFieldValue.upsert({
    where: { contactId_definitionId: { contactId: input.contactId, definitionId: definition.id } },
    update: { value: input.value },
    create: {
      contactId: input.contactId,
      definitionId: definition.id,
      value: input.value,
    },
    include: { definition: true },
  });
}
