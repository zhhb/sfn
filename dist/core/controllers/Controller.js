"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Service_1 = require("../tools/Service");
class Controller extends Service_1.Service {
    constructor() {
        super();
        this.authorized = false;
    }
    success(data, code = 200) {
        return {
            success: true,
            code,
            data,
        };
    }
    error(msg, code = 500) {
        msg = msg instanceof Error ? msg.message : msg;
        return {
            success: false,
            code,
            error: msg
        };
    }
}
Controller.RequireAuth = [];
exports.Controller = Controller;
//# sourceMappingURL=Controller.js.map