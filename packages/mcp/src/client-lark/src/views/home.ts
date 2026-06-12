import { View } from "@lark.js/mvc";
import template from "./home.html";
import { usePromptStore } from "@/prompt-store";
import { t } from "@/locales/i18n";

export default View.extend({
  template,

  init() {
    const syncToView = () => {
      const s = usePromptStore.getState();
      this.updater.digest({
        appTitle: t("app_title"),
        appSubtitle: t("app_subtitle"),
        switchLang: t("switch_lang"),
        lang: s.lang || "en",
      });
    };

    const off = usePromptStore.subscribe(syncToView);
    this.on("destroy", off);
    syncToView();
  },

  "onToggleLang<click>"() {
    usePromptStore.getState().changeLang();
  },
});
