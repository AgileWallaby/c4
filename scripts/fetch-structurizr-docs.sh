#!/usr/bin/env bash
set -euo pipefail

REPO="structurizr/structurizr.github.io"
OUT_DIR="docs/structurizr"

fetch_dir() {
  local repo_path="$1"
  local out_path="$2"

  mkdir -p "$out_path"

  gh api "repos/$REPO/contents/$repo_path" --jq '.[] | [.type, .name, .path] | @tsv' | \
    while IFS=$'\t' read -r type name path; do
      if [[ "$type" == "file" && "$name" == *.md ]]; then
        gh api "repos/$REPO/contents/$path" --jq '.content' | base64 -d > "$out_path/$name"
        echo "  fetched: $out_path/$name"
      elif [[ "$type" == "dir" ]]; then
        fetch_dir "$path" "$out_path/$name"
      fi
    done
}

echo "Fetching Structurizr DSL docs to $OUT_DIR..."
fetch_dir "dsl" "$OUT_DIR"

count=$(find "$OUT_DIR" -name "*.md" | wc -l | tr -d ' ')
echo "Done. $count markdown files fetched to $OUT_DIR/"
