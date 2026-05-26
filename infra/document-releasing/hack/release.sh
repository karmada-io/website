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

# This script performs a full documentation release for a given version. It:
#   1. Adds the new version to versions.json
#   2. Copies current docs to versioned_docs/
#   3. Generates a versioned sidebar JSON file
#   4. Copies zh (Chinese) docs to the i18n versioned directory
#   5. Creates a zh versioned sidebar JSON with version label substitution

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <version>"
  echo "Example: $0 v1.18"
  exit 1
fi

VERSION="$1"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WEBSITE_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

cd "${WEBSITE_ROOT}"

# Step 1: Prepend new version to versions.json
echo "Updating versions.json..."
TMP=$(mktemp)
jq --arg ver "${VERSION}" 'if contains([$ver]) then . else [$ver] + . end' versions.json > "${TMP}" && mv "${TMP}" versions.json

# Step 2: Copy docs to versioned_docs
echo "Creating versioned_docs/version-${VERSION}..."
mkdir -p "versioned_docs/version-${VERSION}"
cp -r docs/* "versioned_docs/version-${VERSION}/"

# Step 3: Generate versioned sidebar JSON from sidebars.js
echo "Generating versioned_sidebars/version-${VERSION}-sidebars.json..."
node "${SCRIPT_DIR}/extract-sidebar.js" "${VERSION}"

# Step 4: Copy zh docs to versioned i18n directory
echo "Creating i18n zh versioned docs..."
ZH_DOCS_DIR="i18n/zh/docusaurus-plugin-content-docs"
mkdir -p "${ZH_DOCS_DIR}/version-${VERSION}"
cp -r "${ZH_DOCS_DIR}/current/"* "${ZH_DOCS_DIR}/version-${VERSION}/"

# Step 5: Create zh versioned sidebar JSON
echo "Creating i18n zh versioned sidebar..."
cp "${ZH_DOCS_DIR}/current.json" "${ZH_DOCS_DIR}/version-${VERSION}.json"
sed -i'' -e "s/Next/${VERSION}/g" "${ZH_DOCS_DIR}/version-${VERSION}.json"

echo "Release ${VERSION} done."
