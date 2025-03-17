#!/usr/bin/env bash
# Copyright 2025 The Karmada Authors.
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

set -o errexit
set -o nounset
set -o pipefail

# This script used to generate the Karmada API reference document and update the website content.
# 1. used by document releasing.
# 2. used when the Karmada API is updated.

function usage() {
    echo "Usage:"
    echo "    hack/reference-api.sh [-h]"
    echo "Args:"
    echo "    h: print help information"
}

MODULE_ROOT=$(dirname "${BASH_SOURCE[0]}")/..
REPO_ROOT=$MODULE_ROOT/../..

GITHUB_RAW_URL="https://raw.githubusercontent.com/karmada-io/karmada/master/api/openapi-spec/swagger.json"
LOCAL_FILENAME=$MODULE_ROOT/api/current/swagger.json

mkdir -p $MODULE_ROOT/api/current
curl -o "$LOCAL_FILENAME" "$GITHUB_RAW_URL"

VERSION="current" make

sed -i 's/\r//g' `find $MODULE_ROOT/kwebsite -name "*.md"`
# remove the redundant linefeed (LF)
sed -i '/^$/N;/^\n$/D' `find $MODULE_ROOT/kwebsite -name "*.md"`

rm -rf $REPO_ROOT/docs/reference/karmada-api
mv -f $MODULE_ROOT/kwebsite/content/en/docs $REPO_ROOT/docs/reference/karmada-api
rm -rf $MODULE_ROOT/kwebsite
rm -rf $MODULE_ROOT/api
