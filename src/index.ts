import SimpleModule from "lynx-framework/simple.module";

export default class UsersAdminModule extends SimpleModule {
    static settings = {
        themeMasterPage: "/light-bootstrap-admin/master",
        moduleRoot: "/admin/",
        usersListTemplate: "users-admin/users-list",
        usersEditTemplate: "users-admin/users-edit",
        rolesListTemplate: "users-admin/roles-list",
        rolesEditTemplate: "users-admin/roles-edit"
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
