const SIDEBAR_PIN_KEY = "ngocore.admin.sidebarPinned";

export function getSidebarPinned(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(SIDEBAR_PIN_KEY) !== "false";
}

export function setSidebarPinned(pinned: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SIDEBAR_PIN_KEY, pinned ? "true" : "false");
}
