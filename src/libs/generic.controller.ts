import { BaseController } from "lynx-framework/base.controller";
import Request from "lynx-framework/request";
import { ValidationError } from "lynx-framework/validate-object";

import UserAdminModule from "../index";

export class GenericController extends BaseController {
    get context(): any {
        return {
            settings: UserAdminModule.settings
        };
    }
    errorsToObject(errors: ValidationError[], req: Request): any {
        let map: any = {};
        for (let err of errors) {
            map[err.name] = this.tr(err.message, req);
        }
        return map;
    }
}

export function isNumber(n: any) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
