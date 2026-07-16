import { render } from "@swifty.js/preact";
import { useTranslation } from "react-i18next";
import PromptForm from "./prompt-form.js";
import NetworkDiagnosePanel from "./network/components/network-diagnose-panel.js";
import "./i18n.js";
// @ts-ignore
import "./index.css";

const App = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === "en" ? "zh" : "en";
    i18n.changeLanguage(nextLang);
  };

  const diagnosticConfig = {
    apiList: [
      "https://api.github.com",
      "https://jsonplaceholder.typicode.com/todos/1",
      "https://httpbin.org/get",
    ],
    resourceList: [
      "https://vitejs.dev/logo.svg",
      "https://react.dev/favicon.ico",
      "https://www.google.com/favicon.ico",
    ],
    speedTestFileUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/3d/LARGE_elevation.jpg",
  };

  const handleOnCall = (results: unknown[]) => {
    const payload = JSON.stringify({
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      results,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/onCall", payload);
    } else {
      fetch("/onCall", {
        method: "POST",
        body: payload,
        keepalive: true,
      }).catch(console.error);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Language toggle */}
      <button
        onClick={toggleLanguage}
        className="btn btn-ghost btn-sm absolute top-5 right-5 rounded-full px-4 text-sm font-medium tracking-wide text-[#5ba3e6]/70 hover:bg-[#5ba3e6]/8 hover:text-[#5ba3e6]"
      >
        {t("mcp.switch_lang")}
      </button>

      <div className="mx-auto w-full max-w-3xl animate-[fade-in_0.6s_ease-out]">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-[#2e4a6e] sm:text-5xl">
            {t("mcp.app_title")}
          </h1>
          {/* Decorative line */}
          <div className="mx-auto mt-6 flex items-center justify-center gap-2">
            <span className="h-px w-12 bg-linear-to-r from-transparent to-[#89c4f4]/30"></span>
            <span className="h-1 w-1 rounded-full bg-[#89c4f4]/40"></span>
            <span className="h-px w-12 bg-linear-to-l from-transparent to-[#89c4f4]/30"></span>
          </div>
        </div>

        <PromptForm />
      </div>

      <NetworkDiagnosePanel
        config={diagnosticConfig}
        onCallAction={handleOnCall}
      />
    </div>
  );
};

const container = document.getElementById("app");
if (container) {
  render(<App />, container);
}
