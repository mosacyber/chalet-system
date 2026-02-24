import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  WASocket,
} from "@whiskeysockets/baileys";
import * as QRCode from "qrcode";
import path from "path";
import fs from "fs";
import pino from "pino";

interface SessionInfo {
  socket: WASocket | null;
  qrCode: string | null;
  status: "disconnected" | "qr_pending" | "connected";
  qrResolve: ((qr: string | null) => void) | null;
}

// In-memory session store (persists while Node.js process runs)
const sessions = new Map<string, SessionInfo>();

const DATA_DIR = path.join(process.cwd(), "data", "whatsapp-sessions");

const logger = pino({ level: "silent" });

function getAuthDir(userId: string): string {
  const dir = path.join(DATA_DIR, userId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * Start a new WhatsApp session for a user.
 * Returns a base64 QR code data URL, or null if already connected or timeout.
 */
export async function startWhatsAppSession(
  userId: string
): Promise<string | null> {
  // If already connected, return status
  const existing = sessions.get(userId);
  if (existing?.status === "connected") {
    return null;
  }

  // Clean up previous socket
  if (existing?.socket) {
    try {
      existing.socket.end(undefined);
    } catch {
      // ignore
    }
  }

  const authDir = getAuthDir(userId);
  const { state, saveCreds } = await useMultiFileAuthState(authDir);

  const session: SessionInfo = {
    socket: null,
    qrCode: null,
    status: "disconnected",
    qrResolve: null,
  };
  sessions.set(userId, session);

  // Promise that resolves with first QR code or null on timeout
  const qrPromise = new Promise<string | null>((resolve) => {
    session.qrResolve = resolve;
    setTimeout(() => {
      if (session.qrResolve) {
        session.qrResolve = null;
        resolve(null);
      }
    }, 25000);
  });

  const socket = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: Browsers.ubuntu("Chrome"),
    logger,
  });

  session.socket = socket;

  socket.ev.on("creds.update", saveCreds);

  socket.ev.on("connection.update", async (update) => {
    const { qr, connection, lastDisconnect } = update;

    if (qr) {
      try {
        const qrDataURL = await QRCode.toDataURL(qr, {
          width: 256,
          margin: 2,
        });
        session.qrCode = qrDataURL;
        session.status = "qr_pending";

        // Resolve the initial promise with first QR
        if (session.qrResolve) {
          session.qrResolve(qrDataURL);
          session.qrResolve = null;
        }
      } catch (err) {
        console.error("[whatsapp] QR generation error:", err);
      }
    }

    if (connection === "open") {
      session.status = "connected";
      session.qrCode = null;
      console.log(`[whatsapp] Connected for user ${userId}`);
    }

    if (connection === "close") {
      const statusCode = (
        lastDisconnect?.error as { output?: { statusCode?: number } }
      )?.output?.statusCode;

      if (statusCode === DisconnectReason.loggedOut) {
        // User logged out - clean up everything
        session.status = "disconnected";
        session.socket = null;
        session.qrCode = null;
        sessions.delete(userId);
        try {
          fs.rmSync(authDir, { recursive: true, force: true });
        } catch {
          // ignore
        }
        console.log(`[whatsapp] User ${userId} logged out`);
      } else {
        session.status = "disconnected";
        session.socket = null;
        console.log(
          `[whatsapp] Connection closed for user ${userId}, reason: ${statusCode}`
        );
      }
    }
  });

  return qrPromise;
}

/**
 * Get current session status and QR code
 */
export function getSessionInfo(userId: string): {
  status: string;
  qrCode: string | null;
} {
  const session = sessions.get(userId);
  if (!session) return { status: "disconnected", qrCode: null };
  return { status: session.status, qrCode: session.qrCode };
}

/**
 * Disconnect and clean up a WhatsApp session
 */
export async function disconnectWhatsApp(userId: string): Promise<void> {
  const session = sessions.get(userId);
  if (session?.socket) {
    try {
      await session.socket.logout();
    } catch {
      // ignore
    }
    try {
      session.socket.end(undefined);
    } catch {
      // ignore
    }
  }
  sessions.delete(userId);

  const authDir = path.join(DATA_DIR, userId);
  try {
    fs.rmSync(authDir, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

/**
 * Check if a user has stored auth (previously connected)
 */
export function hasStoredAuth(userId: string): boolean {
  const authDir = path.join(DATA_DIR, userId);
  try {
    return fs.existsSync(path.join(authDir, "creds.json"));
  } catch {
    return false;
  }
}
