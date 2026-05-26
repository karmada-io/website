#!/usr/bin/env bash
# Copyright 2026 The Karmada Authors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# This script extracts a toc.yaml from a Karmada swagger.json file.
# It parses API paths to discover resources, groups them by API group,
# and outputs a toc.yaml with the same format used by gen-resourcesdocs.
# The "Common Definitions" and "skippedResources" sections are kept unchanged.
#
# Usage: bash extract-toc.sh <swagger.json> [output-toc.yaml]
# Example: bash extract-toc.sh ../api/current/swagger.json ../config/current/toc.yaml
#
# Dependencies: jq

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <swagger.json> [output-toc.yaml]"
  exit 1
fi

SWAGGER_FILE="$1"
OUTPUT_FILE="${2:-}"

if ! command -v jq &>/dev/null; then
  echo "Error: jq is required but not installed."
  exit 1
fi

# Extract karmada resources from swagger paths.
# For each path matching /apis/{group}.karmada.io/{version}/{resource},
# find the Kind from x-kubernetes-group-version-kind metadata.
# Output: sorted unique lines of "group|version|kind"
RESOURCES=$(jq -r '
  .paths | to_entries[] |
  select(.key | test("^/apis/[^/]+\\.karmada\\.io/[^/]+/(namespaces/[^/]+/)?[^/{]+$")) |
  .key as $path |
  .value | to_entries[] |
  select(.value | type == "object") |
  select(.value["x-kubernetes-group-version-kind"] != null) |
  .value["x-kubernetes-group-version-kind"] |
  if type == "array" then .[] else . end |
  "\(.group)|\(.version)|\(.kind)"
' "$SWAGGER_FILE" | sort -u)

# Build the YAML output
generate_yaml() {
  echo "parts:"

  local prev_group=""
  while IFS='|' read -r group version kind; do
    [ -z "$group" ] && continue

    if [ "$group" != "$prev_group" ]; then
      # Generate part name: first segment of group, capitalize
      local segment="${group%%.*}"
      local capitalized="$(echo "${segment:0:1}" | tr '[:lower:]' '[:upper:]')${segment:1}"
      local part_name="${capitalized} Resources"

      echo "  - name: ${part_name}"
      echo "    chapters:"
      prev_group="$group"
    fi

    echo "      - name: ${kind}"
    echo "        group: \"${group}\""
    echo "        version: ${version}"
  done <<< "$RESOURCES"

  # Common Definitions (kept unchanged)
  cat <<'EOF'
  - name: Common Definitions
    chapters:
      - name: DeleteOptions
        key: io.k8s.apimachinery.pkg.apis.meta.v1.DeleteOptions
      - name: LabelSelector
        key: io.k8s.apimachinery.pkg.apis.meta.v1.LabelSelector
      - name: ListMeta
        key: io.k8s.apimachinery.pkg.apis.meta.v1.ListMeta
      - name: NodeSelectorRequirement
        key: io.k8s.api.core.v1.NodeSelectorRequirement
      - name: ObjectMeta
        key: io.k8s.apimachinery.pkg.apis.meta.v1.ObjectMeta
      - name: Patch
        key: io.k8s.apimachinery.pkg.apis.meta.v1.Patch
      - name: Quantity
        key: io.k8s.apimachinery.pkg.api.resource.Quantity
      - name: Status
        key: io.k8s.apimachinery.pkg.apis.meta.v1.Status
      - name: TypedLocalObjectReference
        key: io.k8s.api.core.v1.TypedLocalObjectReference
skippedResources:
  - APIGroup
  - APIGroupList
  - APIResourceList
  - APIVersions
  - Status
EOF
}

if [ -n "$OUTPUT_FILE" ]; then
  generate_yaml > "$OUTPUT_FILE"
  echo "TOC written to: $OUTPUT_FILE"
else
  generate_yaml
fi

