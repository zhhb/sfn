import * as path from "path";
import * as date from "sfn-date";
import { Server } from "socket.io";
import { config } from "../../init";
import { SocketError } from "../tools/SocketError";
import { WebSocket } from "../tools/interfaces";
import { callsiteLog } from "../tools/functions-inner";
import { realDB } from "../tools/symbols";
import { WebSocketController } from "../controllers/WebSocketController";
import { EventMap } from "../tools/EventMap";

type SocketEventInfo = {
    time: number;
    event: string;
    code: number;
}

function finish(ctrl: WebSocketController, info: SocketEventInfo) {
    let socket = ctrl.socket;

    // If has session, save.
    // if (socket.session)
    //     socket.session.save(() => void 0);

    // If has db connection bound to the socket, release.
    if (socket[realDB])
        socket[realDB].release();

    ctrl.emit("finish", socket);

    // If it is dev mode, log runtime information.
    if (config.env === "dev") {
        let cost: number | string = Date.now() - info.time,
            dateTime: string = `[${date("Y-m-d H:i:s.ms")}]`.cyan,
            type: string = <any>socket.protocol.toUpperCase().bold,
            event: string = info.event.yellow,
            code: number = info.code,
            codeStr: string = code.toString();

        cost = `${cost}ms`.cyan;

        if (code < 200) {
            codeStr = codeStr.cyan;
        } else if (code >= 200 && code < 300) {
            codeStr = codeStr.green;
        } else if (code >= 300 && code < 400) {
            codeStr = codeStr.yellow;
        } else {
            codeStr = codeStr.red;
        }

        console.log(`${dateTime} ${type} ${event} ${codeStr} ${cost}`);
    }
}

function handleError(err: any, ctrl: WebSocketController, info: SocketEventInfo) {
    let _err: Error = err; // The original error.

    if (!(err instanceof SocketError)) {
        if (err instanceof Error && config.server.error.show)
            err = new SocketError(500, err.message);
        else
            err = new SocketError(500);
    }

    info.code = (<SocketError>err).code;

    // Send error to the client.
    if (info.event) {
        ctrl.socket.emit(info.event, ctrl.error(err.message, info.code));
    } else {
        ctrl.logConfig.action = info.event = "unknown";
    }

    if (config.server.error.log) {
        // Log the original error to a file.
        ctrl.logger.error(_err.message);
    }

    finish(ctrl, info);

    if (config.env == "dev" && !(_err instanceof SocketError)) {
        callsiteLog(_err);
    }
}

function getNextHandler(
    method: string,
    action: string,
    data: any[],
    resolve: Function
) {
    return (ctrl: WebSocketController) => {
        ctrl.logConfig.action = action;

        // Handle authentication.
        let Class = <typeof WebSocketController>ctrl.constructor;
        if (Class.RequireAuth.includes(method) && !ctrl.authorized)
            throw new SocketError(401);

        resolve(ctrl[method](...data, ctrl.socket));
    }
}

function handleEvent(socket: WebSocket, event: string, ...data: any[]): void {
    let { Class, method } = EventMap[event];
    let className = Class.name === "default_1" ? "default" : Class.name;
    let action = `${className}.${method} (${Class.filename})`;

    let ctrl: WebSocketController = null,
        info: SocketEventInfo = {
            time: Date.now(),
            event,
            code: 200
        };

    // Handle the procedure in a Promise context.
    new Promise((resolve, reject) => {
        try {
            let handleNext = getNextHandler(method, action, data, resolve);

            if (Class.prototype.constructor.length === 2) {
                ctrl = new Class(socket, handleNext);
            } else {
                ctrl = new Class(socket);
                handleNext(ctrl);
            }
        } catch (err) {
            reject(err);
        }
    }).then((_data: any) => {
        if (_data !== undefined) {
            // Send data to the client.
            socket.emit(event, _data);
        }
        finish(ctrl, info);
    }).catch((err: Error) => {
        ctrl = ctrl || new WebSocketController(socket);
        ctrl.logConfig.action = action;

        handleError(err, ctrl, info);
    });
}

export function handleWebSocketEvent(io: Server): void {
    io.on("connection", (socket: WebSocket) => {
        // Bind all socket controllers to the events of underlying socket.
        for (let event in EventMap) {
            socket.on(event, (...data) => {
                handleEvent(socket, event, ...data);
            });
        }

        socket.on("error", (err: Error) => {
            let ctrl = new WebSocketController(socket);
            handleError(err, ctrl, {
                time: Date.now(),
                event: "",
                code: 500
            });
        });
    });
}