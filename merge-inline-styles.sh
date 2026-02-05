#!/usr/bin/env bash
set -euo pipefail

STYLES_FILE="${1:-styles.css}"
HTML_GLOB="${2:-*.html}"

TMP_DIR="$(mktemp -d)"
RAW_CSS="$TMP_DIR/inline.css"
MERGED_OUT="$TMP_DIR/merged.css"
CONFLICTS_OUT="$TMP_DIR/conflicts.txt"

cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

: > "$RAW_CSS"
: > "$CONFLICTS_OUT"

extract_styles() {
  awk '
    BEGIN { in_style=0 }
    /<style[^>]*>/ { in_style=1; next }
    /<\/style>/ { in_style=0; print ""; next }
    in_style { print }
  ' "$1"
}

echo "🔍 Scanning HTML files..."

shopt -s nullglob
matched=( $HTML_GLOB )
shopt -u nullglob

if [[ ${#matched[@]} -eq 0 ]]; then
  echo "No HTML files matched glob: $HTML_GLOB"
  exit 1
fi

for file in "${matched[@]}"; do
  [[ -f "$file" ]] || continue
  echo "→ Processing $file"
  extract_styles "$file" >> "$RAW_CSS"
  echo >> "$RAW_CSS"
done

python3 - "$RAW_CSS" "$MERGED_OUT" "$CONFLICTS_OUT" <<'PY'
import re
import sys
from collections import OrderedDict

raw_css_path, merged_out_path, conflicts_out_path = sys.argv[1:4]

with open(raw_css_path, "r", encoding="utf-8") as f:
    css = f.read()

css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)


def normalize_space(s: str) -> str:
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def parse_top_level_blocks(source: str):
    blocks = []
    depth = 0
    start = None

    for i, ch in enumerate(source):
        if ch == "{":
            if depth == 0:
                start = i
            depth += 1
        elif ch == "}":
            if depth > 0:
                depth -= 1
                if depth == 0 and start is not None:
                    open_brace = start
                    close_brace = i
                    j = open_brace - 1
                    while j >= 0 and source[j].isspace():
                        j -= 1
                    k = j
                    while k >= 0 and source[k] != "}":
                        k -= 1
                    prelude = source[k + 1 : open_brace]
                    body = source[open_brace + 1 : close_brace]
                    blocks.append((normalize_space(prelude), normalize_space(body)))
                    start = None
    return blocks

blocks = parse_top_level_blocks(css)

first_body = OrderedDict()
conflicts = set()

for selector, body in blocks:
    if not selector:
        continue
    if selector not in first_body:
        first_body[selector] = body
    elif first_body[selector] != body:
        conflicts.add(selector)

with open(merged_out_path, "w", encoding="utf-8") as out_css:
    for selector, body in first_body.items():
        if selector in conflicts:
            continue
        out_css.write(f"{selector} {{ {body} }}\n")

with open(conflicts_out_path, "w", encoding="utf-8") as out_conflicts:
    for selector in sorted(conflicts):
        out_conflicts.write(selector + "\n")
PY

echo "🧹 Writing merged $STYLES_FILE"
mv "$MERGED_OUT" "$STYLES_FILE"

echo "✅ Done"
echo "⚠️ Conflicting selectors left in HTML:"
cat "$CONFLICTS_OUT"
