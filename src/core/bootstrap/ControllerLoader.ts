import * as fs from "fs";
import * as path from "path";
import { APP_PATH, config, SRC_PATH } from "../../init";
import { HttpController } from "../controllers/HttpController";
import { WebSocketController } from "../controllers/WebSocketController";
import {
    applyHttpControllerDoc,
    applyWebSocketControllerDoc
} from "../tools/functions-inner";
import { RouteMap } from "../tools/RouteMap";
import { EventMap } from "../tools/EventMap";

function isController(m): boolean {
    return m && (m.prototype instanceof HttpController
        || m.prototype instanceof WebSocketController);
}

function loadControllers(controllerPath: string) {
    var files = fs.readdirSync(controllerPath);

    for (let file of files) {
        let filename = controllerPath + "/" + file;
        let stat = fs.statSync(filename);

        if (stat.isFile() && path.extname(file) == ".js") {

            let _module = require(filename),
                basename: string = path.basename(filename, ".js"),
                Class: typeof HttpController | typeof WebSocketController;

            if (isController(_module)) {
                // export = Controller
                Class = _module;
            } else if (_module[basename] && isController(_module[basename])) {
                // export class Controller { }
                Class = _module[basename];
            } else if (_module.default && isController(_module.default)) {
                // export default class Controller { }
                Class = _module.default;
            } else {
                continue;
            }

            if (SRC_PATH !== APP_PATH) {
                let _filename = filename.substring(APP_PATH.length, filename.length - 3);
                _filename = SRC_PATH + _filename + ".ts";
                if (fs.existsSync(_filename)) {
                    filename = _filename;
                }
            }

            if (process.platform === "win32") {
                filename = filename.replace(/\//g, "\\");
            }

            if (Class.prototype instanceof HttpController) {
                let _class = <typeof HttpController>Class;
                _class.filename = filename;

                if (config.enableDocRoute)
                    applyHttpControllerDoc(_class);

            } else if (Class.prototype instanceof WebSocketController) {
                let _class = <typeof WebSocketController>Class;
                _class.filename = filename;

                if (config.enableDocRoute)
                    applyWebSocketControllerDoc(_class);
            }
        } else if (stat.isDirectory()) {
            // load files recursively.
            loadControllers(filename);
        }
    }
}

loadControllers(`${APP_PATH}/controllers`);