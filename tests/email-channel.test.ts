import { createServer } from "node:net";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildEmailMessage, sendEmailMessage } from "@/lib/channels/email";
import { getDb } from "@/lib/db";
import { ensureDefaultWorkspace } from "@/lib/workspaces";

const db = getDb();

function listen(server: ReturnType<typeof createServer>) {
  return new Promise<number>((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (address && typeof address === "object") resolve(address.port);
    });
  });
}

describe("email channel", () => {
  afterEach(async () => {
    vi.unstubAllEnvs();
    await db.message.deleteMany();
    await db.conversation.deleteMany();
    await db.contact.deleteMany();
    await db.channel.deleteMany({ where: { type: "email" } });
  });

  it("builds a UTF-8 plain text email message", () => {
    const message = buildEmailMessage({
      fromEmail: "noreply@example.com",
      fromName: "InboxPilot",
      toEmail: "customer@example.com",
      subject: "測試通知",
      text: "你好，這是測試訊息。",
    });

    expect(message).toContain("From: InboxPilot <noreply@example.com>");
    expect(message).toContain("To: customer@example.com");
    expect(message).toContain("Subject: =?UTF-8?B?");
    expect(message).toContain('Content-Type: text/plain; charset="UTF-8"');
    expect(message).toContain("你好，這是測試訊息。");
  });

  it("sends outbound mail through SMTP", async () => {
    const commands: string[] = [];
    let dataMode = false;
    let dataBody = "";
    const server = createServer((socket) => {
      socket.write("220 local smtp\r\n");
      socket.on("data", (chunk) => {
        const text = chunk.toString("utf8");
        if (dataMode) {
          dataBody += text;
          if (dataBody.includes("\r\n.\r\n")) {
            dataMode = false;
            socket.write("250 queued as local-12345\r\n");
          }
          return;
        }

        for (const rawLine of text.split(/\r?\n/).filter(Boolean)) {
          commands.push(rawLine);
          if (rawLine.startsWith("EHLO")) socket.write("250-localhost\r\n250 AUTH LOGIN\r\n");
          else if (rawLine.startsWith("MAIL FROM")) socket.write("250 ok\r\n");
          else if (rawLine.startsWith("RCPT TO")) socket.write("250 ok\r\n");
          else if (rawLine === "DATA") {
            dataMode = true;
            socket.write("354 end with dot\r\n");
          } else if (rawLine === "QUIT") {
            socket.write("221 bye\r\n");
            socket.end();
          }
        }
      });
    });
    const port = await listen(server);
    const workspace = await ensureDefaultWorkspace();
    const channel = await db.channel.create({
      data: {
        workspaceId: workspace.id,
        type: "email",
        name: "SMTP Test",
        enabled: true,
        configJson: {
          smtpHost: "127.0.0.1",
          smtpPort: port,
          smtpSecure: false,
          fromEmail: "noreply@example.com",
          fromName: "InboxPilot",
          subject: "測試主旨",
        },
      },
    });

    try {
      const result = await sendEmailMessage({
        channelId: channel.id,
        externalId: "customer@example.com",
        text: "Hello from InboxPilot",
      });

      expect(result.raw).toContain("queued as local-12345");
      expect(commands).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^EHLO /),
          "MAIL FROM:<noreply@example.com>",
          "RCPT TO:<customer@example.com>",
          "DATA",
        ]),
      );
      expect(dataBody).toContain("Subject: =?UTF-8?B?");
      expect(dataBody).toContain("Hello from InboxPilot");
    } finally {
      server.close();
    }
  });
});
