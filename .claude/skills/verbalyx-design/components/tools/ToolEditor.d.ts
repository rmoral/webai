import * as React from "react";

/**
 * The working surface of every Verbalyx tool: mode chips, paste pane,
 * streamed result pane with change highlighting, run button. Based on
 * `components/tools/tool-editor.tsx` (the real one streams from
 * `/api/ai/[tool]` and renders a Turnstile widget); the two panes now share
 * one bordered frame and the result marks what was rewritten vs added.
 */
export interface ToolEditorProps {
  /** Tool name in Spanish — doubles as the run-button label. */
  name?: string;
  /** Mode ids from `lib/ai/tools.ts`; the second one is preselected. Empty array hides the row. */
  modes?: string[];
  /** Words left today, appended to the word count. `null` hides it (Pro / anonymous). */
  wordsRemaining?: number | null;
  /** Result content as segments, so the demo can highlight changes. */
  segments?: Array<{ kind: "plain" | "rewritten" | "added"; text: string }>;
  /** Prefilled input text. */
  initialText?: string;
  /** Replaces the default "No guardamos tu texto." line next to the run button. */
  footer?: React.ReactNode;
}

export declare function ToolEditor(props: ToolEditorProps): React.ReactElement;
