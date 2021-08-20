# Vue.js IDE Configuration

## Installation

* **Visual Studio Code**
Download VSCode IDE at https://code.visualstudio.com/

* **Node.js**
Download Node.js Javascript Framework at https://nodejs.org/
Node.js comes with npm package manager. This project is originally based on Node.js 10 LTS, e.g. v10.14.2

## VSCode Plugins

VSCode Plugins to install:
* ESLint (dbaeumer.vscode-eslint)
* EditorConfig for VS Code (editorconfig.editorconfig)
* Vetur (octref.vetur)
* Docker (peterjausovec.vscode-docker)
* npm (eg2.vscode-npm-script)


## Configure Settings

1. Open the file settings.json and copy the content (Ctrl.+A, Ctrl.+C)
2. Open VSCode Options: Navigate File > Preferences > Settings
3. Display in raw JSON: Click top right {} element "Open Settings (JSON)" 
4. Replace right side "User Settings" with the settings content and save (Ctrl.+V, Ctrl.+S).
    Can also be put into "Workspace Settings" if the corresponding folder is already opened (Step 5).

5. Open the visualization workspace folder: File > Open Folder, open `cloud/visualization/`
    This folder contains the package.json, where npm installs the required modules from.
6. Check if autoformat works: Open a `.vue` or `.js`, add unnecessary tabs at the start of a line and save (Ctrl.+S). The line should move back to its indentation level. 

## Install and Run

7. Run `npm install` to download modules.
8. Run `npm run serve` to start the page locally with hot-deploy enabled (automatically reloads once changes are saved).

## Breakpoints in VSCode

If you want to set breakpoints in VSCode, have a look at the extension [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome).

## Vue.js Guides

Vue progressive framework for building client-side web applications. 

* https://vuejs.org/v2/guide/
* https://vuex.vuejs.org/

