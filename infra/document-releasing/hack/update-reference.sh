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

# This script regenerates all API and CLI reference documentation from the
# karmada source repository. It:
#   1. Clones the karmada repo if not already present
#   2. Generates karmadactl CLI reference docs (en and zh)
#   3. Generates component reference docs (en and zh)
#   4. Generates API reference docs

set -euo pipefail

# Resolve paths relative to this script's location
# Script is at: website/infra/document-releasing/hack/update-reference.sh
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WEBSITE_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
KARMADA_ROOT="${WEBSITE_ROOT}/../karmada"

# Step 1: Clone karmada if not present
if [ ! -d "${KARMADA_ROOT}" ]; then
  echo "Karmada repo not found, cloning..."
  git clone https://github.com/karmada-io/karmada.git "${KARMADA_ROOT}"
fi

# Step 2: Generate CLI references
echo "Generating karmadactl docs..."
cd "${KARMADA_ROOT}"
go run ./hack/tools/genkarmadactldocs/gen_karmadactl_docs.go "${WEBSITE_ROOT}/docs/reference/karmadactl/karmadactl-commands/"
go run ./hack/tools/genkarmadactldocs/gen_karmadactl_docs.go "${WEBSITE_ROOT}/i18n/zh/docusaurus-plugin-content-docs/current/reference/karmadactl/karmadactl-commands/"

# Step 3: Generate component reference docs
echo "Generating component docs..."
cd "${KARMADA_ROOT}"
go build ./hack/tools/gencomponentdocs/.
./gencomponentdocs "${WEBSITE_ROOT}/docs/reference/components/" all
./gencomponentdocs "${WEBSITE_ROOT}/i18n/zh/docusaurus-plugin-content-docs/current/reference/components/" all

# Step 4: Generate API docs
echo "Generating API docs..."
cd "${WEBSITE_ROOT}/infra/gen-resourcesdocs"
bash hack/reference-api.sh

echo "Done."
