import { networkInterfaces } from "os";

export function validPeerAddr(addr: string): boolean {
  const parts = addr.split(":");
  if (parts.length !== 2) return false;
  const host = parts[0];
  if (host !== "localhost" && host.split(".").length !== 4) {
    return false;
  }
  return true;
}

export function getLocalIP(): string {
  const interfaces = networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (!iface.internal && iface.family === "IPv4") {
        return iface.address;
      }
    }
  }
  throw new Error("no valid local IP found");
}
