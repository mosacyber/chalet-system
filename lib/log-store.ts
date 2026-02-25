export interface LogEntry {
  id: number;
  timestamp: string;
  level: "info" | "warn" | "error";
  source: string;
  message: string;
}

const MAX_LOGS = 500;
let logId = 0;
const logs: LogEntry[] = [];

export function addLog(
  level: LogEntry["level"],
  source: string,
  message: string
) {
  logs.push({
    id: ++logId,
    timestamp: new Date().toISOString(),
    level,
    source,
    message,
  });
  if (logs.length > MAX_LOGS) {
    logs.splice(0, logs.length - MAX_LOGS);
  }
}

export function getLogs(filter?: {
  level?: string;
  source?: string;
  limit?: number;
}) {
  let result = [...logs];
  if (filter?.level) {
    result = result.filter((l) => l.level === filter.level);
  }
  if (filter?.source) {
    result = result.filter((l) => l.source.includes(filter.source));
  }
  const limit = filter?.limit || 200;
  return result.slice(-limit).reverse();
}

export function clearLogs() {
  logs.length = 0;
  logId = 0;
}

// Override console methods to capture logs
const origConsoleLog = console.log;
const origConsoleWarn = console.warn;
const origConsoleError = console.error;

function extractSource(args: unknown[]): { source: string; message: string } {
  const full = args
    .map((a) =>
      typeof a === "string" ? a : a instanceof Error ? a.message : JSON.stringify(a)
    )
    .join(" ");

  const match = full.match(/^\[([^\]]+)\]/);
  if (match) {
    return { source: match[1], message: full.slice(match[0].length).trim() };
  }
  return { source: "app", message: full };
}

console.log = (...args: unknown[]) => {
  origConsoleLog(...args);
  const { source, message } = extractSource(args);
  addLog("info", source, message);
};

console.warn = (...args: unknown[]) => {
  origConsoleWarn(...args);
  const { source, message } = extractSource(args);
  addLog("warn", source, message);
};

console.error = (...args: unknown[]) => {
  origConsoleError(...args);
  const { source, message } = extractSource(args);
  addLog("error", source, message);
};
