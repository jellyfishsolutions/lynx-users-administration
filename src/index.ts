import SimpleModule from "lynx-framework/simple.module";

export default class UsersAdminModule extends SimpleModule {
    static settings = {
        themeMasterPage: "/light-bootstrap-admin/master",
        moduleRoot: "/admin/"
    };

    get controllers(): string {
        return __dirname + "/controllers";
    }

    get translation(): string {
        return __dirname + "/locale";
    }
    get views(): string {
        return __dirname + "/views";
    }

    get public(): string {
        return __dirname + "/public";
    }
}
