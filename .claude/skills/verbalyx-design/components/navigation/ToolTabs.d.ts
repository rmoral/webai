import * as React from "react";

/**
 * The product's primary navigation: one tab per AI tool, sitting directly
 * under the header on both the marketing site and the app. Added Sept 2026 —
 * the upstream repo navigated tools through a card grid, which forced a
 * round trip through the index to switch tool. Competitive review (QuillBot,
 * Smodin) found top tabs to be the category convention.
 */
export interface ToolTabItem {
  /** Tool id, e.g. "humanize" from `lib/ai/tools.ts`. */
  id: string;
  /** Spanish tool name, e.g. "Humanizador". */
  label: string;
  /** Optional second line — a 3-5 word promise, not a description. */
  hint?: string;
  /** Renders muted and unclickable — use for tools not shipped yet. */
  disabled?: boolean;
}

export interface ToolTabsProps {
  items?: ToolTabItem[];
  /** Id of the selected tab. */
  value?: string;
  onChange?: (id: string) => void;
}

export declare function ToolTabs(props: ToolTabsProps): React.ReactElement;
