/**
 * App — main application component for the Lark Frame Tree Devtool.
 *
 * Layout:
 * - Header: URL input, connection status, controls
 * - Main area: Tree view (left) + Detail panel (right)
 * - Hidden iframe for loading the target Lark app
 */
import { useState, useCallback, useEffect, useMemo } from "react";
import { useFrameTree } from "./hooks/use-frame-tree";
import { Header } from "./components/header";
import { VirtualFrameTree } from "./components/virtual-frame-tree";
import { DetailPanel } from "./components/detail-panel";
import { EmptyState } from "./components/empty-state";
import { MfDemo } from "./components/mf-demo";
import { CdnManager } from "./components/cdn-manager";
import { SfCdnDemo } from "./components/sf-cdn-demo";
import { ErrorBoundary } from "./components/error-boundary";
import type { SerializedFrameNode } from "./types";

type TabKey = "inspector" | "mf-demo" | "cdn" | "sf-cdn";

const TABS: { key: TabKey; label: string }[] = [
  { key: "inspector", label: "Inspector" },
  { key: "mf-demo", label: "MF Demo" },
  { key: "cdn", label: "CDN" },
  { key: "sf-cdn", label: "MF CDN" },
];

/**
 * Parse the target URL from the current page's hash.
 * Format: http://localhost:5173#http://localhost:3000
 */
function getTargetUrlFromHash(): string | null {
  const hash = window.location.hash.slice(1); // Remove leading #
  if (!hash) return null;
  try {
    new URL(hash); // Validate URL
    return hash;
  } catch {
    return null;
  }
}

export default function App() {
  const [targetUrl, setTargetUrl] = useState<string | null>(
    getTargetUrlFromHash,
  );
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("inspector");

  const { tree, status, refresh, iframeRef } = useFrameTree({
    targetUrl,
    pollInterval: 2000,
  });

  /** Find a frame node by ID in the tree */
  const findFrameNode = useCallback(
    (id: string | null): SerializedFrameNode | null => {
      if (!id || !tree?.root) return null;
      const search = (
        node: SerializedFrameNode,
      ): SerializedFrameNode | null => {
        if (node.id === id) return node;
        for (const child of node.children) {
          const found = search(child);
          if (found) return found;
        }
        return null;
      };
      return search(tree.root);
    },
    [tree],
  );

  const selectedNode = useMemo(
    () => findFrameNode(selectedFrameId),
    [findFrameNode, selectedFrameId],
  );

  /** Handle URL change from header */
  const handleUrlChange = useCallback((url: string) => {
    window.location.hash = url;
    setTargetUrl(url);
    setSelectedFrameId(null);
  }, []);

  /** Listen for hash changes (browser back/forward) */
  useEffect(() => {
    const handleHashChange = (): void => {
      const newUrl = getTargetUrlFromHash();
      setTargetUrl(newUrl);
      setSelectedFrameId(null);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  /** Handle frame node selection */
  const handleSelect = useCallback((id: string) => {
    setSelectedFrameId(id);
  }, []);

  const isConnected = status === "connected";
  const showTree = isConnected && tree?.root != null;
  const rootNode = tree?.root;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-sky-50 text-slate-800">
      {/* Header */}
      <Header
        targetUrl={targetUrl}
        status={status}
        totalFrames={tree?.totalFrames ?? 0}
        lastUpdate={tree?.timestamp ?? null}
        onRefresh={refresh}
        onUrlChange={handleUrlChange}
      />

      {/* Tab bar */}
      <div className="flex border-b border-sky-200/60 bg-white">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 text-[11px] font-semibold tracking-wide uppercase transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-sky-600 text-sky-700"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "sf-cdn" ? (
        <ErrorBoundary fallbackTitle="MF CDN module crashed">
          <div className="flex-1 overflow-hidden">
            <SfCdnDemo />
          </div>
        </ErrorBoundary>
      ) : activeTab === "cdn" ? (
        <div className="flex-1 overflow-hidden">
          <CdnManager />
        </div>
      ) : activeTab === "mf-demo" ? (
        <ErrorBoundary fallbackTitle="MF Demo module crashed">
          <div className="flex-1 overflow-hidden">
            <MfDemo />
          </div>
        </ErrorBoundary>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {showTree ? (
            <>
              {/* Tree view */}
              <div className="flex w-120 shrink-0 flex-col overflow-hidden border-r border-sky-200/60 bg-white/70">
                <div className="border-b border-sky-200/60 bg-sky-50/80 px-4 py-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[11px] font-semibold tracking-wider text-sky-600 uppercase">
                      Frame Tree
                    </h2>
                    <span className="text-[10px] text-slate-400">
                      {tree?.rootId}
                    </span>
                  </div>
                </div>
                {rootNode && (
                  <VirtualFrameTree
                    root={rootNode}
                    selectedId={selectedFrameId}
                    onSelect={handleSelect}
                  />
                )}
              </div>

              {/* Detail panel */}
              <div className="flex flex-1 flex-col overflow-hidden bg-white/40">
                <div className="border-b border-sky-200/60 bg-sky-50/80 px-4 py-2">
                  <h2 className="text-[11px] font-semibold tracking-wider text-sky-600 uppercase">
                    Details
                  </h2>
                </div>
                <DetailPanel node={selectedNode} onSelect={handleSelect} />
              </div>
            </>
          ) : (
            <EmptyState status={status} targetUrl={targetUrl} />
          )}
        </div>
      )}

      {/* Hidden iframe for target Lark app */}
      {targetUrl && activeTab === "inspector" && (
        <iframe
          ref={iframeRef}
          src={targetUrl}
          className="hidden"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          title="Target @lark.js/mvc app"
        />
      )}
    </div>
  );
}
