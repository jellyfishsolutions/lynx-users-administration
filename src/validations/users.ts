import * as Joi from "@hapi/joi";

export const editSchema = Joi.object().keys({
    email: Joi.string()
        .email()
        .required()
        .label("{{usra_input_email}}"),
    firstName: Joi.string()
        .min(2)
        .required()
        .label("{{usra_input_firstName}}"),
    lastName: Joi.string()
        .min(2)
        .required()
        .label("{{usra_input_lastName}}"),
    nickName: Joi.string().label("{{usra_input_nickName}}"),
    password: Joi.any(),
    roleMap: Joi.any()
});

export const passwordSchema = Joi.object().keys({
    password: Joi.string()
        .required()
        .min(4)
        .regex(/^[a-zA-Z0-9]{3,30}$/)
        .label("{{usra_input_password}}")
});

export const roleSchema = Joi.object().keys({
    name: Joi.string()
        .min(3)
        .required()
        .label("{{usra_input_role_name}}"),
    readableName: Joi.string()
        .min(3)
        .required()
        .label("{{usra_input_role_readablename}}"),
    description: Joi.string()
        .optional()
        .allow("")
        .label("{{usra_input_role_description}}"),
    level: Joi.number()
        .integer()
        .min(0)
        .required()
        .label("{{usra_input_role_level}}")
});
