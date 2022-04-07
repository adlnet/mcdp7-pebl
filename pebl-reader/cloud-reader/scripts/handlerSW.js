let pending = [];
let sendPendingMsgs = (sw) => {
    for (let msg of pending)
        sendSWMsg(msg[0], msg[1], sw.active);
    pending = [];
}

let dispatchHandlers = { ready: [sendPendingMsgs] };

let lookUpDispatch = (eventName) => {
    return dispatchHandlers[eventName];
};

let dispatchHandlerFn = (msg) => {
    let dispatchHandlers = lookUpDispatch(msg.data.eventName);
    for (let dispatchHandlerIndex in dispatchHandlers) {
        let dispatchHandler = dispatchHandlers[dispatchHandlerIndex];
        if (dispatchHandler) {
            dispatchHandler(msg.data);
        }
    }
};

let preventRefreshLoop;
let onStateChange = (sw) => {
    if (!preventRefreshLoop) {
        preventRefreshLoop = true;
        window.location.reload();
    }
}

function hookSWWorkerApi(reg) {
    reg.addEventListener('updatefound',
        () => {
            if (reg.active) {
                Dialogs.showModalPrompt("Upgrade Detected",
                    "New PeBL Web Reader version available, Reload?",
                    "Yes",
                    "No",
                    () => {
                        if (reg.waiting) {
                            sendSWMsg("updateWorker", {}, reg.waiting);
                        } else {
                            let fn = (e) => {
                                if (reg.waiting) {
                                    sendSWMsg("updateWorker", {}, reg.waiting);
                                }
                            }
                            if (reg.installing)
                                reg.installing.addEventListener("statechange", fn);
                        }
                    },
                    () => { });
            }
        });
    if (reg.active && (reg.waiting != null)) {
        let fn = () => {
            if (Dialogs) {
                Dialogs.showModalPrompt("Upgrade Detected",
                    "New PeBL Web Reader version available, Reload?",
                    "Yes",
                    "No",
                    () => {
                        if (reg.waiting) {
                            sendSWMsg("updateWorker", {}, reg.waiting);
                        }
                    },
                    () => { });
            } else {
                setTimeout(fn, 250);
            }
        }
        setTimeout(fn, 250);
    }
    navigator.serviceWorker.addEventListener('message', dispatchHandlerFn);
    navigator.serviceWorker.addEventListener('controllerchange', onStateChange);
    setInterval(() => {
        if (reg) {
            reg.update();
        }
    }, 30 * 60 * 1000);
    if (navigator.serviceWorker.controller && navigator.serviceWorker.controller.state === "activated") {
        sendPendingMsgs();
    }
}

function unhookSWWorkerApi() {
    navigator.serviceWorker.controller.removeEventListener('message', dispatchHandlerFn);
}

function sendSWMsg(eventName, payload, sw) {
    if (typeof payload === "undefined") {
        payload = {};
    }
    if (eventName) {
        payload.eventName = eventName;
    }
    if (sw) {
        sw.postMessage(payload);
    } else if (navigator.serviceWorker.controller && navigator.serviceWorker.controller.state === "activated") {
        navigator.serviceWorker.controller.postMessage(payload);
    } else {
        pending.push([eventName, payload]);
        if (pending.length == 1) {
            (async () => {
                navigator.serviceWorker.ready.then(sendPendingMsgs);
            })();
        }
    }
}

function registerSWListener(eventName, handler) {
    if (!dispatchHandlers[eventName]) {
        dispatchHandlers[eventName] = [];
    }
    dispatchHandlers[eventName].push(handler);
}

function registerSWListeners(eventName, handlers) {
    if (!dispatchHandlers[eventName]) {
        dispatchHandlers[eventName] = [];
    }
    for (let handler of handlers) {
        dispatchHandlers[eventName].push(handler);
    }
}

function unregisterSWListener(eventName, handler) {
    let dispatchHandlerSet = dispatchHandlers[eventName];
    if (dispatchHandlerSet) {
        for (let dispatchHandlerIndex in dispatchHandlerSet) {
            let dispatchHandler = dispatchHandlerSet[dispatchHandlerIndex];
            if (dispatchHandler == handler) {
                dispatchHandlerSet.splice(dispatchHandlerIndex, 1);
            }
        }
        if (dispatchHandlerSet.length == 0) {
            delete dispatchHandlers[eventName];
        }
    }
}

function unregisterSWListeners(eventName) {
    let dispatchHandlerSet = dispatchHandlers[eventName];
    if (dispatchHandlerSet) {
        for (let dispatchHandlerIndex in dispatchHandlerSet) {
            dispatchHandlerSet.splice(dispatchHandlerIndex, 1);
        }
        if (dispatchHandlerSet.length == 0) {
            delete dispatchHandlers[eventName];
        }
    }
}
