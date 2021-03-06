"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date = require("sfn-date");
const init_1 = require("../../init");
const SocketError_1 = require("../tools/SocketError");
const functions_inner_1 = require("../tools/functions-inner");
const symbols_1 = require("../tools/symbols");
const WebSocketController_1 = require("../controllers/WebSocketController");
const EventMap_1 = require("../tools/EventMap");
function finish(ctrl, info) {
    let socket = ctrl.socket;
    if (socket[symbols_1.realDB])
        socket[symbols_1.realDB].release();
    ctrl.emit("finish", socket);
    if (init_1.config.env === "dev") {
        let cost = Date.now() - info.time, dateTime = `[${date("Y-m-d H:i:s.ms")}]`.cyan, type = socket.protocol.toUpperCase().bold, event = info.event.yellow, code = info.code, codeStr = code.toString();
        cost = `${cost}ms`.cyan;
        if (code < 200) {
            codeStr = codeStr.cyan;
        }
        else if (code >= 200 && code < 300) {
            codeStr = codeStr.green;
        }
        else if (code >= 300 && code < 400) {
            codeStr = codeStr.yellow;
        }
        else {
            codeStr = codeStr.red;
        }
        console.log(`${dateTime} ${type} ${event} ${codeStr} ${cost}`);
    }
}
function handleError(err, ctrl, info) {
    let _err = err;
    if (!(err instanceof SocketError_1.SocketError)) {
        if (err instanceof Error && init_1.config.server.error.show)
            err = new SocketError_1.SocketError(500, err.message);
        else
            err = new SocketError_1.SocketError(500);
    }
    info.code = err.code;
    if (info.event) {
        ctrl.socket.emit(info.event, ctrl.error(err.message, info.code));
    }
    else {
        ctrl.logConfig.action = info.event = "unknown";
    }
    if (init_1.config.server.error.log) {
        ctrl.logger.error(_err.message);
    }
    finish(ctrl, info);
    if (init_1.config.env == "dev" && !(_err instanceof SocketError_1.SocketError)) {
        functions_inner_1.callsiteLog(_err);
    }
}
function getNextHandler(method, action, data, resolve) {
    return (ctrl) => {
        ctrl.logConfig.action = action;
        let Class = ctrl.constructor;
        if (Class.RequireAuth.includes(method) && !ctrl.authorized)
            throw new SocketError_1.SocketError(401);
        resolve(ctrl[method](...data, ctrl.socket));
    };
}
function handleEvent(socket, event, ...data) {
    let { Class, method } = EventMap_1.EventMap[event];
    let className = Class.name === "default_1" ? "default" : Class.name;
    let action = `${className}.${method} (${Class.filename})`;
    let ctrl = null, info = {
        time: Date.now(),
        event,
        code: 200
    };
    new Promise((resolve, reject) => {
        try {
            let handleNext = getNextHandler(method, action, data, resolve);
            if (Class.prototype.constructor.length === 2) {
                ctrl = new Class(socket, handleNext);
            }
            else {
                ctrl = new Class(socket);
                handleNext(ctrl);
            }
        }
        catch (err) {
            reject(err);
        }
    }).then((_data) => {
        if (_data !== undefined) {
            socket.emit(event, _data);
        }
        finish(ctrl, info);
    }).catch((err) => {
        ctrl = ctrl || new WebSocketController_1.WebSocketController(socket);
        ctrl.logConfig.action = action;
        handleError(err, ctrl, info);
    });
}
function handleWebSocketEvent(io) {
    io.on("connection", (socket) => {
        for (let event in EventMap_1.EventMap) {
            socket.on(event, (...data) => {
                handleEvent(socket, event, ...data);
            });
        }
        socket.on("error", (err) => {
            let ctrl = new WebSocketController_1.WebSocketController(socket);
            handleError(err, ctrl, {
                time: Date.now(),
                event: "",
                code: 500
            });
        });
    });
}
exports.handleWebSocketEvent = handleWebSocketEvent;
//# sourceMappingURL=WebSocketEventHandler.js.map