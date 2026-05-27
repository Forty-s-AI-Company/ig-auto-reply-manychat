import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { Socket, connect as netConnect } from "node:net";
import { TLSSocket, connect as tlsConnect } from "node:tls";
import type { ChannelAdapter, SendMessageInput } from "@/lib/channels";
import { getDb } from "@/lib/db";

type EmailChannelConfig = {
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPassword?: string;
  fromEmail?: string;
  fromName?: string;
  subject?: string;
};

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  password?: string;
  fromEmail: string;
  fromName?: string;
  subject: string;
};

type SmtpSocket = Socket | TLSSocket;

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function clean(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function booleanValue(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return ["1", "true", "yes"].includes(value.toLowerCase());
  return undefined;
}

export function parseEmailChannelConfig(value: unknown): EmailChannelConfig {
  const config = asRecord(value);
  return {
    smtpHost: clean(config.smtpHost),
    smtpPort: numberValue(config.smtpPort),
    smtpSecure: booleanValue(config.smtpSecure),
    smtpUser: clean(config.smtpUser),
    smtpPassword: clean(config.smtpPassword),
    fromEmail: clean(config.fromEmail),
    fromName: clean(config.fromName),
    subject: clean(config.subject),
  };
}

function envEmailConfig(): EmailChannelConfig {
  return {
    smtpHost: clean(process.env.EMAIL_SMTP_HOST),
    smtpPort: numberValue(process.env.EMAIL_SMTP_PORT),
    smtpSecure: booleanValue(process.env.EMAIL_SMTP_SECURE),
    smtpUser: clean(process.env.EMAIL_SMTP_USER),
    smtpPassword: clean(process.env.EMAIL_SMTP_PASSWORD),
    fromEmail: clean(process.env.EMAIL_FROM),
    fromName: clean(process.env.EMAIL_FROM_NAME),
    subject: clean(process.env.EMAIL_DEFAULT_SUBJECT),
  };
}

function mergeEmailConfig(channelConfig: EmailChannelConfig): SmtpConfig {
  const envConfig = envEmailConfig();
  const merged = { ...envConfig, ...channelConfig };
  if (!merged.smtpHost) throw new Error("EMAIL_SMTP_HOST is not configured.");
  if (!merged.fromEmail) throw new Error("EMAIL_FROM is not configured.");

  return {
    host: merged.smtpHost,
    port: merged.smtpPort || (merged.smtpSecure ? 465 : 587),
    secure: merged.smtpSecure ?? false,
    user: merged.smtpUser,
    password: merged.smtpPassword,
    fromEmail: merged.fromEmail,
    fromName: merged.fromName,
    subject: merged.subject || "InboxPilot message",
  };
}

async function getChannelEmailConfig(channelId: string) {
  const channel = await getDb().channel.findUnique({ where: { id: channelId } });
  return mergeEmailConfig(parseEmailChannelConfig(channel?.configJson));
}

function encodeHeader(value: string) {
  if (/^[\x20-\x7e]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function formatAddress(email: string, name?: string) {
  return name ? `${encodeHeader(name)} <${email}>` : email;
}

function dotStuff(value: string) {
  return value.replace(/\r?\n/g, "\r\n").replace(/^\./gm, "..");
}

export function buildEmailMessage(input: {
  fromEmail: string;
  fromName?: string;
  toEmail: string;
  subject: string;
  text: string;
}) {
  const messageId = `${randomUUID()}@inboxpilot.local`;
  return [
    `From: ${formatAddress(input.fromEmail, input.fromName)}`,
    `To: ${input.toEmail}`,
    `Subject: ${encodeHeader(input.subject)}`,
    `Message-ID: <${messageId}>`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    input.text,
  ].join("\r\n");
}

async function readSmtpResponse(socket: SmtpSocket) {
  let buffer = "";
  while (true) {
    const [chunk] = (await once(socket, "data")) as [Buffer];
    buffer += chunk.toString("utf8");
    const lines = buffer.split(/\r?\n/).filter(Boolean);
    const lastLine = lines.at(-1);
    if (lastLine && /^\d{3} /.test(lastLine)) return { code: Number(lastLine.slice(0, 3)), text: buffer };
  }
}

async function expectSmtp(socket: SmtpSocket, expected: number | number[]) {
  const response = await readSmtpResponse(socket);
  const expectedCodes = Array.isArray(expected) ? expected : [expected];
  if (!expectedCodes.includes(response.code)) {
    throw new Error(`SMTP server returned ${response.code}: ${response.text.trim()}`);
  }
  return response;
}

async function writeSmtp(socket: SmtpSocket, line: string, expected: number | number[]) {
  socket.write(`${line}\r\n`);
  return expectSmtp(socket, expected);
}

function connectSmtp(config: SmtpConfig) {
  return new Promise<SmtpSocket>((resolve, reject) => {
    const socket = config.secure
      ? tlsConnect({ host: config.host, port: config.port, servername: config.host })
      : netConnect({ host: config.host, port: config.port });

    const timeout = setTimeout(() => {
      socket.destroy(new Error("SMTP connection timed out."));
    }, Number(process.env.EMAIL_SMTP_TIMEOUT_MS || 15000));

    socket.once("error", reject);
    socket.once("connect", () => {
      clearTimeout(timeout);
      socket.off("error", reject);
      resolve(socket);
    });
  });
}

async function sendSmtpMail(config: SmtpConfig, toEmail: string, text: string) {
  const socket = await connectSmtp(config);
  socket.setEncoding("utf8");

  try {
    await expectSmtp(socket, 220);
    await writeSmtp(socket, `EHLO ${process.env.EMAIL_SMTP_HELO || "inboxpilot.local"}`, 250);

    if (config.user || config.password) {
      if (!config.user || !config.password) throw new Error("Both EMAIL_SMTP_USER and EMAIL_SMTP_PASSWORD are required.");
      await writeSmtp(socket, "AUTH LOGIN", 334);
      await writeSmtp(socket, Buffer.from(config.user).toString("base64"), 334);
      await writeSmtp(socket, Buffer.from(config.password).toString("base64"), 235);
    }

    await writeSmtp(socket, `MAIL FROM:<${config.fromEmail}>`, 250);
    await writeSmtp(socket, `RCPT TO:<${toEmail}>`, [250, 251]);
    await writeSmtp(socket, "DATA", 354);
    socket.write(`${dotStuff(buildEmailMessage({
      fromEmail: config.fromEmail,
      fromName: config.fromName,
      toEmail,
      subject: config.subject,
      text,
    }))}\r\n.\r\n`);
    const result = await expectSmtp(socket, 250);
    socket.write("QUIT\r\n");
    return { providerMessageId: result.text.match(/\b[0-9A-Za-z._:-]{6,}\b/)?.[0], raw: result.text };
  } finally {
    socket.end();
  }
}

export async function sendEmailMessage(input: SendMessageInput) {
  if (!input.externalId.includes("@")) {
    throw new Error("Email channel requires contact.externalId to be an email address.");
  }

  const config = await getChannelEmailConfig(input.channelId);
  return sendSmtpMail(config, input.externalId, input.text);
}

export const emailAdapter: ChannelAdapter = {
  type: "email",
  sendMessage: sendEmailMessage,
};
