// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const electron = require('electron');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
const BrowserWindow = require('electron').remote.BrowserWindow;
const dialog = require("electron").remote.dialog;
const path = require('path');

const newWindowBtn = document.getElementById('new-window');

newWindowBtn.addEventListener('click', function (event) {
    const modalPath = path.join('file://', __dirname, '/sections/modal.html');
    let win = new BrowserWindow({ width: 400, height: 320 });
    win.on('close', function () { win = null; });
    win.loadURL(modalPath);
    win.show();
});

const manageWindow = document.getElementById("manage-window");
manageWindow.addEventListener("click", function (event) {
    const modalPath = path.join('file://', __dirname, '/sections/modal.html');
    let win = new BrowserWindow({ width: 400, height: 300 });
    win.on("resize", updateReply);
    win.on("move", updateReply);
    win.on("close", function () { win = null; });
    win.loadURL(modalPath);
    win.show();
    function updateReply() {
        const manageWindowReply = document.getElementById("manage-window-reply");
        const message = `Size: ${win.getSize()} Postion: ${win.getPosition()}`;
        manageWindowReply.innerHTML = message;
    }
});

const listenToWindow = document.getElementById("listen-to-window");
const focusOnModalBtn = document.getElementById("focus-on-model-window");
listenToWindow.addEventListener("click", function (event) {
    let win;
    const modalPath = path.join('file://', __dirname, '/sections/modal.html');
    win = new BrowserWindow({ width: 400, height: 300 });
    win.on("focus", hideFocusBtn);
    win.on("blur", showFocusBtn);
    win.on("close", function (e) {
        hideFocusBtn();
        win = null;
    });
    win.loadURL(modalPath);
    win.show();

    function hideFocusBtn() {
        if (!win) {
            return;
        }
        focusOnModalBtn.addEventListener('click', function () { win.focus(); });

    }
    function showFocusBtn() {

    }
});

const noFrameWindow = document.getElementById("no-frame-window");
noFrameWindow.addEventListener("click", function (event) {
    const modalPath = path.join("file://", __dirname, "/sections/modal.html");
    let win = new BrowserWindow({
        frame: false,
    });
    win.on("close", function () {
        win = null;
    });
    win.loadURL(modalPath);
    win.show();
});

const processCrashBtn = document.getElementById("process-crash");
processCrashBtn.addEventListener("click", function (event) {
    const crashWindowPath = path.join("file://", __dirname, "/sections/crash.html");
    let win = new BrowserWindow({ width: 400, height: 300 });
    win.webContents.on("crashed", function () {
        const options = {
            type: "info",
            title: "Renderer Process Crashed",
            message: "This process has crashed",
            buttons: ["Reload", "Close"]
        };
        dialog.showMessageBox(options, function (index) {
            if (index === 0)
                win.reload();
            else
                win.close();
        });
    });
    win.on("close", function () {
        win = null;
    });
    win.loadURL(crashWindowPath);
    win.show();
});

const processHangingBtn = document.getElementById("process-hanging");
processHangingBtn.addEventListener("click", function (event) {
    const hangingPath = path.join("file://", __dirname, "/sections/hang.html");
    let win = new BrowserWindow({
        width: 400,
        height: 300
    });
    win.on("unresponsive", function () {
        const options = {
            type: "info",
            title: "Renderer Process Hanging",
            message: "This process is hanging",
            buttons: ["Reload", "Close"]
        };
        dialog.showMessageBox(options, function (index) {
            if (index === 0)
                win.reload();
            else
                win.close();
        });
    });
    win.on("close", function () {
        win = null;
    });
    win.loadURL(hangingPath);
    win.show();
});


const ipc = require('electron').ipcRenderer;

// Tell main process to show the menu when demo button is clicked
const contextMenuBtn = document.getElementById('context-menu');
contextMenuBtn.addEventListener('click', function () {
    ipc.send('show-context-menu');
});

//user interface
const shell = require("electron").shell;
const os = require("os");
const fileManagerBtn = document.getElementById("open-file-manager");
fileManagerBtn.addEventListener("click", () => shell.showItemInFolder(os.homedir()));
const exLinksBtn = document.getElementById("open-ex-links");
exLinksBtn.addEventListener("click", () => shell.openExternal("https://www.jd.com"));

const selectDirBtn = document.getElementById("select-directory");
selectDirBtn.addEventListener("click", () => ipc.send("open-file-dialog"));
ipc.on("selected-directory",
    (event, path) =>
        document.getElementById("selected-file").innerHTML = `You selected: ${path}`
);

const errorDialogBtn = document.getElementById("error-dialog");
errorDialogBtn.addEventListener("click", () => ipc.send("open-error-dialog"));

const infoDialogBtn = document.getElementById("information-dialog");
infoDialogBtn.addEventListener("click", () => ipc.send("open-information-dialog"));
ipc.on("information-dialog-selection", (event, index) => {
    let message = "您选择了【";
    if (index === 0)
        message += "是】";
    else
        message += "否】";
    document.getElementById("information-selection").innerHTML = message;
});

const saveDialogBtn = document.getElementById("save-dialog");
saveDialogBtn.addEventListener("click", () => ipc.send("open-save-dialog"));
ipc.on("saved-file", (event, path) => {
    if (!path)
        path = "请选择文件";
    document.getElementById("file-saved").innerHTML = `您选择了 : ${path}`;
});

const trayBtn = document.getElementById("put-in-tray");
let trayOn = false;
trayBtn.addEventListener("click", event => {
    if (trayOn) {
        trayToggle(false, "", "remove-tray");
    } else {
        const message = "再次点击关闭";
        trayToggle(true, message, "put-on-tray");
    }
});
// Tray removed from context menu on icon
ipc.on("tray-removed", event => trayToggle(false, "", "remove-tray"));

function trayToggle(status, message, call) {
    trayOn = status;
    document.getElementById("tray-countdown").innerHTML = message;
    ipc.send(call);
}

//Processes Communication
const asyncMsgBtn = document.getElementById("async-msg");
asyncMsgBtn.addEventListener("click", () => ipc.send("asynchronous-message", "ping"));
ipc.on("asynchronous-reply", (event, arg) => {
    const message = `异步请求信息 : ${arg}`;
    document.getElementById("reply").innerHTML = message;
});
const syncMsgBtn = document.getElementById("sync-msg");
syncMsgBtn.addEventListener("click", () => {
    const reply = ipc.sendSync("synchronous-message", "ping");
    const message = `同步请求信息 : ${reply}`;
    document.getElementById("reply").innerHTML = message.split("").reverse().join("");
});

const invisMsgBtn = document.getElementById("invis-msg");
const invisReply = document.getElementById("invis-reply");
invisMsgBtn.addEventListener("click", function (event) {
    const windowId = BrowserWindow.getFocusedWindow().id;
    const invisPath = path.join("file://", __dirname, "/sections/invisible.html");
    let win = new BrowserWindow({ width: 400, height: 400, show: false });
    win.loadURL(invisPath);
    win.webContents.on("did-finish-load", () => {
        const input = 5;
        win.webContents.send("compute-factorial", input, windowId);
    });
});
ipc.on("factorial-computed", (event, input, output) => {
    const message = `The factorial of ${input} is ${output}`;
    invisReply.textContent = message;
});

// App & System information
const appInfoBtn = document.getElementById("app-info-btn");
appInfoBtn.addEventListener("click", function (event) {
    ipc.send("get-app-path");
});
ipc.on("got-app-path", (event, path) => {
    const message = `You App Path is : ${path}`;
    document.getElementById("app-info").innerHTML = message;
});

const clipboard = require("electron").clipboard;
const copyBtn = document.getElementById("copy-btn");
const copyInput = document.getElementById("copy-to-input");
copyBtn.addEventListener("click", () => {
    const value = copyInput.value;
    if (value !== '') copyInput.value = '';
    copyInput.placeHolder = "Copied! Paste here to see.";
    clipboard.writeText(value);
});

const pasteBtn = document.getElementById("paste-btn");
pasteBtn.addEventListener("click", () => {
    const message = clipboard.readText();
    document.getElementById("paste-to-input").innerHTML = message;
});