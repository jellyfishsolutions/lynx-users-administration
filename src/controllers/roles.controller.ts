import Request from "lynx-framework/request";
import Response from "lynx-framework/lynx/response";
import { Route, GET, POST, Body, Name } from "lynx-framework/decorators";
import User from "lynx-framework/entities/user.entity";
import Role from "lynx-framework/entities/role.entity";
import { ValidateObject } from "lynx-framework/validate-object";
import { DatatableConfiguration } from "lynx-framework/datatables";

import UserAdminModule from "../index";
import { roleSchema } from "../validations/users";

import { GenericController, isNumber } from "../libs/generic.controller";

@Route(UserAdminModule.settings.moduleRoot)
export default class RolesController extends GenericController {
    @Name("usra-roles-list")
    @GET("/roles")
    async getRoles(req: Request): Promise<Response> {
        let c = this.context;

        let dtConfig = new DatatableConfiguration(Role.getRepository(), req);
        dtConfig.addTableHeader("id");
        dtConfig.addTableHeader("name");
        dtConfig.addTableHeader("readableName");
        dtConfig.addTableHeader("level");
        dtConfig.addTableHeader("createdAt");
        dtConfig.addDataMap([
            "id",
            "name",
            "readableName",
            "level",
            "createdAt"
        ]);

        let qb = Role.getRepository().createQueryBuilder("e");
        if (req.query.filter) {
            let filter = (req.query.filter as string).toLowerCase();
            if (isNumber(filter)) {
                qb = qb.where("e.id = :filter", { filter: filter });
            } else {
                qb = qb.where(
                    "e.name LIKE :filter OR e.readableName LIKE :filter",
                    { filter: "%" + filter + "%" }
                );
            }
        }
        await dtConfig.fetchData(qb);
        c.config = dtConfig;

        return this.render(UserAdminModule.settings.rolesListTemplate, req, c);
    }

    @Name("usra-roles-edit")
    @GET("/roles/edit/:id")
    async getEditRole(id: number, req: Request): Promise<Response> {
        let role;
        if (id != 0) {
            role = await Role.getRepository().findOne(id);
        } else {
            role = new Role();
        }
        if (!role) {
            throw new Error("404");
        }
        let c = this.context;
        c.role = role;
        return this.render(UserAdminModule.settings.rolesEditTemplate, req, c);
    }

    @Name("usra-roles-edit-do")
    @Body("r", roleSchema)
    @POST("/roles/edit/:id")
    async saveEditRole(
        id: number,
        r: ValidateObject<Role>,
        req: Request
    ): Promise<Response> {
        let c = this.context;
        let role;
        if (id != 0) {
            role = await Role.getRepository().findOne(id);
        } else {
            role = new Role();
        }
        if (!role) {
            throw new Error("404");
        }
        if (!r.isValid) {
            c.role = role;
            c.errors = this.errorsToObject(r.errors, req);
            return this.render(
                UserAdminModule.settings.rolesEditTemplate,
                req,
                c
            );
        }

        role.name = r.obj.name;
        role.readableName = r.obj.readableName;
        role.description = r.obj.description;
        role.level = r.obj.level;
        await role.save();
        this.addSuccessMessage("usra-successful-edit", req);
        return this.redirect("usra-roles-list");
    }

    @Name("usra-roles-delete-do")
    @GET("/roles/delete/")
    async deleteRole(req: Request): Promise<Response> {
        let id = Number(req.query.id as string);
        let users = await User.getRepository()
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.roles", "role")
            .where("role.id = :roleId", { roleId: id })
            .getMany();
        for (let user of users) {
            let index = user.roles.findIndex(r => r.id == id);
            if (index != -1) {
                user.roles.splice(index, 1);
                await user.save();
            }
        }
        await Role.getRepository().delete(id);
        this.addSuccessMessage("usra-successful-edit", req);
        return this.redirect("usra-roles-list");
    }
}
