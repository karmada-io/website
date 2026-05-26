#!/usr/bin/env node
/*
Copyright 2026 The Karmada Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// This script extracts the sidebar configuration from sidebars.js and generates
// a versioned sidebar JSON file (e.g., version-v1.17-sidebars.json) under the
// versioned_sidebars/ directory. It is used during the documentation release process
// to snapshot the current sidebar structure for a specific version.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

try {
    const args = process.argv.slice(2);
    const release = args[0];

    if (!release) {
        console.error('Error: Please provide a release version as parameter');
        console.log('Usage: node extract-sidebar.js <release>');
        console.log('Example: node extract-sidebar.js v1.17');
        console.log('used to extract versioned sidebars from sidebars.js')
        process.exit(1);
    }

    const sidebarPath = path.join(__dirname, '..', '..', '..', 'sidebars.js');
    let sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

    const sandbox = { module: { exports: {} }, require: () => ({}) };
    vm.runInNewContext(sidebarContent, sandbox);
    const sidebars = sandbox.module.exports;

    const docs = sidebars.docs;
    const jsonSidebar = {
        docs: docs
    };

    const jsonOutput = JSON.stringify(jsonSidebar, null, 2) + '\n';
    const outputFileName = `version-${release}-sidebars.json`;
    const outputPath = path.join(__dirname, '..', '..', '..', 'versioned_sidebars', outputFileName);


    fs.writeFileSync(outputPath, jsonOutput, 'utf8');

} catch (error) {
    console.error('Error occurred:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
}
