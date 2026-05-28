const { app, BrowserWindow, dialog, shell } = require("electron");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const PORT = 4000;
const SERVER_URL = `http://127.0.0.1:${PORT}`;
let mainWindow;
let serverProcess;

// Required for the portable Windows build on some systems where Chromium's sandbox
// exits before the local server can start. This app is a local LAN utility.
app.commandLine.appendSwitch("no-sandbox");

function getAppRoot() {
  return path.resolve(__dirname, "..");
}

function appendServerLog(chunk) {
  const logPath = path.join(app.getPath("userData"), "server.log");
  fs.appendFile(logPath, chunk, () => {});
}

function startServer() {
  const appRoot = getAppRoot();
  const serverEntry = path.join(appRoot, "server", "src", "index.js");
  const clientDistDir = path.join(appRoot, "client", "dist");
  const userDataDir = app.getPath("userData");

  serverProcess = spawn(process.execPath, [serverEntry], {
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      PORT: String(PORT),
      HOST: "0.0.0.0",
      CLIENT_DIST_DIR: clientDistDir,
      CLIPBOARD_DATA_DIR: path.join(userDataDir, "data"),
      CLIPBOARD_UPLOADS_DIR: path.join(userDataDir, "uploads")
    },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true
  });

  serverProcess.stdout.on("data", (chunk) => appendServerLog(chunk));
  serverProcess.stderr.on("data", (chunk) => appendServerLog(chunk));
  serverProcess.on("exit", (code) => {
    appendServerLog(`\nServer exited with code ${code}\n`);
  });
}

function waitForServer(timeoutMs = 12000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      const request = http.get(`${SERVER_URL}/health`, (response) => {
        response.resume();
        if (response.statusCode === 200) {
          resolve();
          return;
        }
        retry();
      });

      request.on("error", retry);
      request.setTimeout(900, () => {
        request.destroy();
        retry();
      });
    };

    const retry = () => {
      if (Date.now() - startedAt > timeoutMs) {
        reject(new Error("Server did not start in time."));
        return;
      }
      setTimeout(check, 350);
    };

    check();
  });
}

function createWindow() {
  const iconPath = path.join(getAppRoot(), "build", "icon.png");

  mainWindow = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 980,
    minHeight: 680,
    backgroundColor: "#070812",
    title: "Clipboard Sync",
    icon: iconPath,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.loadURL(SERVER_URL);
}

async function boot() {
  startServer();

  try {
    await waitForServer();
    createWindow();
  } catch (error) {
    dialog.showErrorBox(
      "Clipboard Sync 启动失败",
      `内置服务没有启动成功。请确认 4000 端口没有被占用。\n\n日志位置：${path.join(app.getPath("userData"), "server.log")}`
    );
    app.quit();
  }
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

app.whenReady().then(boot);

app.on("second-instance", () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on("window-all-closed", () => {
  app.quit();
});

app.on("before-quit", () => {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
  }
});
