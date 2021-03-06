"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const init_1 = require("../../init");
const HttpController_1 = require("../controllers/HttpController");
const WebSocketController_1 = require("../controllers/WebSocketController");
const functions_inner_1 = require("../tools/functions-inner");
function isController(m) {
    return m && (m.prototype instanceof HttpController_1.HttpController
        || m.prototype instanceof WebSocketController_1.WebSocketController);
}
function loadControllers(controllerPath) {
    var files = fs.readdirSync(controllerPath);
    for (let file of files) {
        let filename = controllerPath + "/" + file;
        let stat = fs.statSync(filename);
        if (stat.isFile() && path.extname(file) == ".js") {
            let _module = require(filename), basename = path.basename(filename, ".js"), Class;
            if (isController(_module)) {
                Class = _module;
            }
            else if (_module[basename] && isController(_module[basename])) {
                Class = _module[basename];
            }
            else if (_module.default && isController(_module.default)) {
                Class = _module.default;
            }
            else {
                continue;
            }
            if (init_1.SRC_PATH !== init_1.APP_PATH) {
                let _filename = filename.substring(init_1.APP_PATH.length, filename.length - 3);
                _filename = init_1.SRC_PATH + _filename + ".ts";
                if (fs.existsSync(_filename)) {
                    filename = _filename;
                }
            }
            if (process.platform === "win32") {
                filename = filename.replace(/\//g, "\\");
            }
            if (Class.prototype instanceof HttpController_1.HttpController) {
                let _class = Class;
                _class.filename = filename;
                if (init_1.config.enableDocRoute)
                    functions_inner_1.applyHttpControllerDoc(_class);
            }
            else if (Class.prototype instanceof WebSocketController_1.WebSocketController) {
                let _class = Class;
                _class.filename = filename;
                if (init_1.config.enableDocRoute)
                    functions_inner_1.applyWebSocketControllerDoc(_class);
            }
        }
        else if (stat.isDirectory()) {
            loadControllers(filename);
        }
    }
}
loadControllers(`${init_1.APP_PATH}/controllers`);
//# sourceMappingURL=ControllerLoader.js.map