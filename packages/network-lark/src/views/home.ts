import { View } from "@lark.js/mvc";
import template from "./home.html";
import { useDiagnoseStore } from "@/diagnose-store";
import { t } from "@/locales/i18n";

export default View.extend({
  template,

  init() {
    const syncToView = () => {
      const s = useDiagnoseStore.getState();
      this.updater.digest({
        title: t("ui.title"),
        lang: s.lang || "zh",
        langLabel: s.lang === "zh" ? "中文" : "English",
      });
    };

    const off = useDiagnoseStore.subscribe(syncToView);
    this.on("destroy", off);
    syncToView();
  },

  "onChangeLangZh<click>"() {
    useDiagnoseStore.getState().changeLang("zh");
  },

  "onChangeLangEn<click>"() {
    useDiagnoseStore.getState().changeLang("en");
  },
});
