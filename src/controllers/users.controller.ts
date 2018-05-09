import Request from "lynx-framework/request";
import Response from "lynx-framework/lynx/response";
import { Route, GET, POST, Body, Name } from "lynx-framework/decorators";
import User from "lynx-framework/entities/user.entity";
import Role from "lynx-framework/entities/role.entity";
import * as userLib from "lynx-framework/libs/users";
import { ValidateObject } from "lynx-framework/validate-object";
import { DatatableConfiguration } from "lynx-framework/datatables";

import UserAdminModule from "../index";
import { editSchema, passwordSchema } from "../validations/users";

import { GenericController, isNumber } from "../libs/generic.controller";

@Route(UserAdminModule.settings.moduleRoot)
export default class UsersController extends GenericController {
    @Name("usra-users-list")
    @GET("/users")
    async getUsers(req: Request): Promise<Response> {
        let c = this.context;

        let dtConfig = new DatatableConfiguration(User.getRepository(), req);
        dtConfig.addTableHeader("id");
        dtConfig.addTableHeader("email");
        dtConfig.addTableHeader("firstName");
        dtConfig.addTableHeader("lastName");
        dtConfig.addTableHeader("nickName");
        dtConfig.addTableHeader("roles");
        dtConfig.addDataMap([
            "id",
            "email",
            "firstName",
            "lastName",
            "nickName",
            "createdAt",
            "roles"
        ]);

        let qb = User.getRepository()
            .createQueryBuilder("e")
            .leftJoinAndSelect("e.roles", "roles");
        if (req.query.filter) {
            let filter = (req.query.filter as string).toLowerCase();
            if (isNumber(filter)) {
                qb = qb.where("e.id = :filter", { filter: filter });
            } else {
                qb = qb.where(
                    "e.email LIKE :filter OR e.firstName LIKE :filter OR e.lastName LIKE :filter OR e.nickName LIKE :filter",
                    { filter: "%" + filter + "%" }
                );
            }
        }
        await dtConfig.fetchData(qb);
        c.config = dtConfig;

        return this.render("users-admin/users-list", req, c);
    }

    @Name("usra-users-edit")
    @GET("/users/edit/:id")
    async getEditUser(id: number, req: Request): Promise<Response> {
        let user;
        if (id != 0) {
            user = await User.getRepository().findOne(id);
        } else {
            user = new User();
            user.roles = [];
        }
        if (!user) {
            throw new Error("404");
        }
        let roles = (await Role.getRepository().find()) as Role[];
        let roleMap: any = {};
        for (let role of roles) {
            let found = false;
            for (let myRole of user.roles) {
                if (myRole.id == role.id) {
                    found = true;
                    break;
                }
            }
            roleMap[role.id] = found;
        }

        let c = this.context;
        c.user = user;
        c.roleMap = roleMap;
        c.roles = roles;
        return this.render("users-admin/users-edit", req, c);
    }

    @Name("usra-users-edit-do")
    @Body("u", editSchema)
    @POST("/users/edit/:id")
    async saveEditUser(
        id: number,
        u: ValidateObject<User>,
        req: Request
    ): Promise<Response> {
        let c = this.context;
        let user;
        if (id != 0) {
            user = await User.getRepository().findOne(id);
        } else {
            user = new User();
            user.roles = [];
        }
        if (!user) {
            throw new Error("404");
        }
        let roles = (await Role.getRepository().find()) as Role[];
        let currentRoleMap = req.body.roleMap;
        if (currentRoleMap && !(currentRoleMap instanceof Array)) {
            currentRoleMap = [currentRoleMap];
        }
        if (currentRoleMap) {
            user.roles = [];
            for (let id of currentRoleMap) {
                for (let role of roles) {
                    if (role.id == id) {
                        user.roles.push(role);
                    }
                }
            }
        }
        let roleMap: any = {};
        for (let role of roles) {
            let found = false;
            for (let myRole of user.roles) {
                if (myRole.id == role.id) {
                    found = true;
                    break;
                }
            }
            roleMap[role.id] = found;
        }
        if (!u.isValid) {
            c.user = user;
            c.roleMap = roleMap;
            c.roles = roles;
            c.errors = this.errorsToObject(u.errors, req);
            return this.render("users-admin/users-edit", req, c);
        }
        user.email = u.obj.email;
        user.firstName = u.obj.firstName;
        user.lastName = u.obj.lastName;
        user.nickName = u.obj.nickName;
        if (id == 0 && !u.obj.password) {
            c.user = user;
            c.roleMap = roleMap;
            c.roles = roles;
            c.errors = { password: this.tr("usra-empty-password", req) };
            return this.render("users-admin/users-edit", req, c);
        }
        if (u.obj.password) {
            let validatePassword = new ValidateObject<{ password: string }>(
                { password: u.obj.password },
                passwordSchema,
                req.acceptsLanguages()
            );
            if (!validatePassword.isValid) {
                c.user = user;
                c.roleMap = roleMap;
                c.roles = roles;
                c.errors = this.errorsToObject(validatePassword.errors, req);
                return this.render("users-admin/users-edit", req, c);
            }
            user.password = await userLib.hashPassword(u.obj.password);
        }

        await user.save();
        this.addSuccessMessagge("usra-successful-edit", req);
        return this.redirect("usra-users-list");
    }

    @Name("usra-users-delete-do")
    @GET("/users/delete/")
    async deleteUser(req: Request): Promise<Response> {
        let id = req.query.id;
        let user = (await User.findOne(id)) as User;
        user.roles = [];
        await user.save();
        await user.remove();
        this.addSuccessMessagge("usra-successful-edit", req);
        return this.redirect("usra-users-list");
    }
}
