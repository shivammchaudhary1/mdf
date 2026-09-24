"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
};

const ALLOWED_PROTOCOL = /^(https?:\/\/|mailto:)/i;

function blocksFromHtml(html: string) {
  const container = document.createElement("div");
  container.innerHTML = html;

  const blocks = Array.from(container.childNodes)
    .map((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const value = node.textContent?.trim();
        return value
          ? `<p>${value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</p>`
          : "";
      }

      return node instanceof HTMLElement ? node.outerHTML.trim() : "";
    })
    .filter(Boolean);

  return blocks.length ? blocks : [""];
}

function textFromHtml(html: string) {
  if (typeof document === "undefined") return "";
  const node = document.createElement("div");
  node.innerHTML = html;
  return node.textContent ?? "";
}

export function AdminRichTextEditor({ value, onChange, disabled = false }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState(false);

  const html = useMemo(() => value.join(""), [value]);
  const words = useMemo(() => textFromHtml(html).trim().split(/\s+/).filter(Boolean).length, [html]);
  const minutes = Math.max(1, Math.ceil(words / 220));

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || editor.innerHTML === html) return;
    editor.innerHTML = html || "<p><br></p>";
  }, [html]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.execCommand("defaultParagraphSeparator", false, "p");
    }
  }, []);

  function emit() {
    const editor = editorRef.current;
    if (!editor) return;
    onChange(blocksFromHtml(editor.innerHTML));
  }

  function command(name: string, value?: string) {
    if (disabled) return;
    editorRef.current?.focus();
    document.execCommand(name, false, value);
    emit();
  }

  function block(tag: "p" | "h2" | "h3" | "blockquote") {
    command("formatBlock", tag);
  }

  function link() {
    if (disabled) return;
    const href = window.prompt("Paste an HTTPS or mailto link");
    if (!href) return;

    const clean = href.trim();
    if (!ALLOWED_PROTOCOL.test(clean)) {
      window.alert("Use an http(s) or mailto link.");
      return;
    }

    command("createLink", clean);
  }

  function toolbarButton(label: string, onPress: () => void, title?: string) {
    return (
      <button
        type="button"
        key={label}
        disabled={disabled}
        title={title ?? label}
        onMouseDown={(event) => {
          event.preventDefault();
          onPress();
        }}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="ad-rte-v1">
      <div className="ad-rte-toolbar-v1" aria-label="Rich text formatting">
        <div>
          {toolbarButton("P", () => block("p"), "Paragraph")}
          {toolbarButton("H2", () => block("h2"), "Heading 2")}
          {toolbarButton("H3", () => block("h3"), "Heading 3")}
        </div>
        <div>
          {toolbarButton("B", () => command("bold"), "Bold")}
          {toolbarButton("I", () => command("italic"), "Italic")}
          {toolbarButton("U", () => command("underline"), "Underline")}
        </div>
        <div>
          {toolbarButton("• List", () => command("insertUnorderedList"), "Bullet list")}
          {toolbarButton("1. List", () => command("insertOrderedList"), "Numbered list")}
          {toolbarButton("Quote", () => block("blockquote"))}
        </div>
        <div>
          {toolbarButton("Link", link)}
          {toolbarButton("Unlink", () => command("unlink"))}
          {toolbarButton("Clear", () => command("removeFormat"), "Clear inline formatting")}
        </div>
        <div>
          {toolbarButton("↶", () => command("undo"), "Undo")}
          {toolbarButton("↷", () => command("redo"), "Redo")}
        </div>

        <button
          type="button"
          className={preview ? "active" : ""}
          onClick={() => setPreview((current) => !current)}
          disabled={disabled}
        >
          {preview ? "Edit" : "Preview"}
        </button>
      </div>

      {preview ? (
        <article className="ad-rte-preview-v1" dangerouslySetInnerHTML={{ __html: html || "<p>Nothing to preview yet.</p>" }} />
      ) : (
        <div
          ref={editorRef}
          className="ad-rte-editor-v1"
          contentEditable={!disabled}
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          data-placeholder="Start writing your article…"
          onInput={emit}
          onBlur={emit}
          onPaste={(event) => {
            event.preventDefault();
            const text = event.clipboardData.getData("text/plain");
            document.execCommand("insertText", false, text);
            window.setTimeout(emit, 0);
          }}
        />
      )}

      <div className="ad-rte-footer-v1">
        <span>{words.toLocaleString("en-IN")} words</span>
        <span>≈ {minutes} min read</span>
        <span>{value.filter(Boolean).length} content blocks</span>
      </div>
    </div>
  );
}
