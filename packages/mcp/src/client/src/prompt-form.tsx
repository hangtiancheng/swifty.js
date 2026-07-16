import { type FormEvent, type FC } from "@swifty.js/preact/compat";
import { useState, useEffect } from "@swifty.js/preact/hooks";
import { useTranslation } from "react-i18next";
import { CheckCircle2, AlertCircle } from "lucide-react";

export const PromptForm: FC = () => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (status && status !== t("mcp.saving")) {
      const timer = setTimeout(() => {
        setStatus("");
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [status, t]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(t("mcp.saving"));

    try {
      const response = await fetch("/prompts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          content,
        }),
      });

      if (response.ok) {
        setStatus(t("mcp.success_message"));
        setName("");
        setDescription("");
        setContent("");
      } else {
        const data = await response.json();
        setStatus(
          `${t("mcp.error_message")}: ${data.error || "Failed to create prompt"}`,
        );
      }
    } catch (err) {
      setStatus(t("mcp.network_error"));
    }
  };

  return (
    <div className="card w-full animate-[float-in_0.5s_ease-out] border border-[#cde4fb]/50 bg-white/60 shadow-[0_4px_32px_rgba(91,163,230,0.06)] backdrop-blur-sm">
      <div className="card-body p-8 lg:p-10">
        {/* Section header */}
        <div className="mb-8 flex items-center gap-3 border-b border-[#e1effe]/60 pb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-[#5ba3e6]/12 to-[#89c4f4]/8">
            <div className="h-3 w-3 rounded-sm bg-[#5ba3e6]/50"></div>
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-[#2e4a6e]">
            {t("mcp.form_title")}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Prompt Name */}
          <label className="form-control w-full">
            <div className="label pb-2">
              <span className="label-text text-xs font-medium tracking-wider text-[#5a7fa3]/60 uppercase">
                {t("mcp.prompt_name_label")}
              </span>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              className="input input-bordered w-full border-[#dceaf8] bg-[#f8fbff] text-[#2e4a6e] placeholder:text-[#8dabc4]/40"
              placeholder={t("mcp.prompt_name_placeholder")}
              required
            />
          </label>

          {/* Description */}
          <label className="form-control w-full">
            <div className="label pb-2">
              <span className="label-text text-xs font-medium tracking-wider text-[#5a7fa3]/60 uppercase">
                {t("mcp.description_label")}
              </span>
            </div>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              className="input input-bordered w-full border-[#dceaf8] bg-[#f8fbff] text-[#2e4a6e] placeholder:text-[#8dabc4]/40"
              placeholder={t("mcp.description_placeholder")}
              required
            />
          </label>

          {/* Content */}
          <label className="form-control w-full">
            <div className="label pb-2">
              <span className="label-text text-xs font-medium tracking-wider text-[#5a7fa3]/60 uppercase">
                {t("mcp.content_label")}
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.currentTarget.value)}
              className="textarea textarea-bordered h-40 w-full resize-y border-[#dceaf8] bg-[#f8fbff] leading-relaxed text-[#2e4a6e] placeholder:text-[#8dabc4]/40"
              placeholder={t("mcp.content_placeholder")}
              required
            ></textarea>
          </label>

          {/* Submit */}
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              className={`btn rounded-full border-none bg-linear-to-r from-[#5ba3e6] to-[#7cb8ec] px-8 font-medium tracking-wide text-white shadow-[0_2px_12px_rgba(91,163,230,0.25)] hover:shadow-[0_4px_20px_rgba(91,163,230,0.35)] hover:brightness-105 ${
                status === t("mcp.saving") ? "btn-disabled opacity-60" : ""
              }`}
            >
              {status === t("mcp.saving") ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                t("mcp.save_button")
              )}
            </button>
          </div>
        </form>

        {/* Status alert */}
        {status && status !== t("mcp.saving") && (
          <div
            className={`mt-6 flex animate-[fade-in-up_0.3s_ease-out] items-center gap-3 rounded-xl border p-4 ${
              status.includes(t("mcp.error_message"))
                ? "border-[#e88a8a]/20 bg-[#fef2f2]/60 text-[#b44040]"
                : "border-[#6bc4a6]/20 bg-[#f0fdf7]/60 text-[#2d7a5a]"
            }`}
          >
            {status.includes(t("mcp.error_message")) ? (
              <AlertCircle className="h-5 w-5 shrink-0" />
            ) : (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            )}
            <span className="text-sm font-medium">{status}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptForm;
