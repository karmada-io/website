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

# This script removes all artifacts for a given documentation version, including:
#   - Versioned sidebar JSON
#   - Versioned docs directory
#   - zh (Chinese) versioned docs and sidebar JSON
#   - The version entry in versions.json
# Use this to clean up an old release that is no longer maintained.

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <version>"
  echo "Example: $0 v1.12"
  exit 1
fi

VERSION="$1"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WEBSITE_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

cd "${WEBSITE_ROOT}"

echo "Pruning release ${VERSION}..."

# Delete versioned sidebar
rm -f "versioned_sidebars/version-${VERSION}-sidebars.json"

# Delete versioned docs
rm -rf "versioned_docs/version-${VERSION}"

# Delete zh versioned docs
ZH_DOCS_DIR="i18n/zh/docusaurus-plugin-content-docs"
rm -rf "${ZH_DOCS_DIR}/version-${VERSION}"
rm -f "${ZH_DOCS_DIR}/version-${VERSION}.json"

# Remove version from versions.json (jq handles trailing comma automatically)
TMP=$(mktemp)
jq --arg ver "${VERSION}" 'map(select(. != $ver))' versions.json > "${TMP}" && mv "${TMP}" versions.json

echo "Done. ${VERSION} has been pruned."
