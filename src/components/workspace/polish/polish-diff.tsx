"use client";

import dynamic from "next/dynamic";

const ReactDiffViewer = dynamic(() => import("react-diff-viewer-continued"), {
  ssr: false,
});

interface PolishDiffProps {
  oldValue: string;
  newValue: string;
  leftTitle: string;
  rightTitle: string;
}

export function PolishDiff({
  oldValue,
  newValue,
  leftTitle,
  rightTitle,
}: PolishDiffProps) {
  return (
    <div className="flex-1 min-h-0 min-w-0 overflow-auto text-sm [&_table]:w-full [&_td]:break-all [&_td]:whitespace-pre-wrap [&_pre]:whitespace-pre-wrap [&_pre]:break-all [&_pre]:overflow-hidden">
      <ReactDiffViewer
        oldValue={oldValue}
        newValue={newValue}
        splitView
        leftTitle={leftTitle}
        rightTitle={rightTitle}
        useDarkTheme={false}
        styles={{
          variables: {
            light: {
              diffViewerBackground: "var(--surface-canvas)",
              addedBackground: "#e6ffed",
              addedColor: "#24292e",
              removedBackground: "#ffeef0",
              removedColor: "#24292e",
              wordAddedBackground: "#acf2bd",
              wordRemovedBackground: "#fdb8c0",
              addedGutterBackground: "#cdffd8",
              removedGutterBackground: "#ffdce0",
              gutterBackground: "var(--surface-panel)",
              gutterBackgroundDark: "var(--surface-panel)",
              codeFoldBackground: "var(--surface-panel)",
              codeFoldGutterBackground: "var(--surface-panel)",
              codeFoldContentColor: "var(--text-muted)",
              emptyLineBackground: "var(--surface-canvas)",
            },
          },
          contentText: {
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            lineHeight: "1.8",
          },
        }}
      />
    </div>
  );
}
