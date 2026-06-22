/**
 * Sidebar View - navigation tree.
 *
 * Renders the sidebar navigation groups and items.
 * Reads sidebar data from State or passed via init params.
 */

import type { DocsConfig } from "@/types";

export function createSidebarView(View: any, template: any): any {
  return View.extend({
    template,

    init() {
      this.observeLocation([], true);
      this.assign();
    },

    assign() {
      this.updater.snapshot();

      const State = (this.owner as any)?.constructor?.State;
      const docsConfig: DocsConfig = State?.get?.("docsConfig") || {};
      const sidebar = docsConfig.sidebar || {};

      // Flatten sidebar groups into sidebarGroups array for the template
      const sidebarGroups: Array<{
        text: string;
        items: Array<{ text: string; link: string; isActive: boolean }>;
      }> = [];

      for (const [prefix, sidebarItems] of Object.entries(sidebar)) {
        if (Array.isArray(sidebarItems)) {
          sidebarGroups.push({
            text: formatPrefix(prefix),
            items: sidebarItems.map((item) => ({
              text: (item["text"] as string) || "",
              link: (item["link"] as string) || "#",
              isActive: false,
            })),
          });
        }
      }

      this.updater.set({ sidebarGroups });
      return this.updater.altered();
    },

    render() {
      this.updater.digest();
    },

    "navigateTo<click>"(e: Event) {
      const target = e.target as HTMLElement;
      const href = target.dataset["href"];
      if (href) {
        const Router = (this.owner as any)?.constructor?.Router;
        Router?.to?.(href);
      }
    },
  });
}

function formatPrefix(prefix: string): string {
  return prefix
    .replace(/^\//, "")
    .replace(/\/$/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
