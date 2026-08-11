import { useEffect, useState } from "react";

export type OrganizerAccess = "checking" | "allowed" | "denied";

export const isOrganizerHost = (hostname: string) => {
  const normalized = hostname.toLocaleLowerCase();
  return normalized === "localhost" ||
    normalized === "localhost." ||
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized === "[::1]";
};

export const useOrganizerAccess = (): OrganizerAccess => {
  const [access, setAccess] = useState<OrganizerAccess>("checking");

  useEffect(() => {
    setAccess(isOrganizerHost(window.location.hostname) ? "allowed" : "denied");
  }, []);

  return access;
};
