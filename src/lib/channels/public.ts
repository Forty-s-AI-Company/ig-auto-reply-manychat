import type { Prisma } from "@prisma/client";

export const publicChannelSelect = {
  id: true,
  type: true,
  name: true,
  enabled: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ChannelSelect;
