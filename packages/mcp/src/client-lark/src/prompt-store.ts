import { create } from "@lark.js/mvc";
import { t, setLang, getLang } from "@/locales/i18n";

type Lang = "en" | "zh";

interface PromptStoreAPI {
  name: string;
  description: string;
  content: string;
  status: string;
  lang: Lang;

  setName: (val: string) => void;
  setDescription: (val: string) => void;
  setContent: (val: string) => void;
  submitForm: () => void;
  changeLang: () => void;
  clearStatus: () => void;
}

export const usePromptStore = create<PromptStoreAPI>("prompt", (set, get) => {
  let statusTimer: ReturnType<typeof setTimeout> | null = null;

  function setName(val: string) {
    set({ name: val });
  }

  function setDescription(val: string) {
    set({ description: val });
  }

  function setContent(val: string) {
    set({ content: val });
  }

  async function submitForm() {
    set({ status: t("saving") });

    try {
      const response = await fetch("/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: get().name,
          description: get().description,
          content: get().content,
        }),
      });

      if (response.ok) {
        set({
          status: t("success_message"),
          name: "",
          description: "",
          content: "",
        });
      } else {
        const data = (await response.json()) as { error?: string };
        set({
          status: `${t("error_message")}: ${data.error || "Failed to create prompt"}`,
        });
      }
    } catch {
      set({ status: t("network_error") });
    }

    if (get().status !== t("saving")) {
      if (statusTimer) clearTimeout(statusTimer);
      statusTimer = setTimeout(() => {
        set({ status: "" });
      }, 10_000);
    }
  }

  function changeLang() {
    const nextLang = get().lang === "en" ? "zh" : "en";
    set({ lang: nextLang });
    setLang(nextLang);
  }

  function clearStatus() {
    set({ status: "" });
  }

  return {
    name: "",
    description: "",
    content: "",
    status: "",
    lang: getLang(),
    setName,
    setDescription,
    setContent,
    submitForm,
    changeLang,
    clearStatus,
  };
});
