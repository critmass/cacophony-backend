"use strict";

/** Routes for roles. */

const jsonschema = require("jsonschema");

const Role = require("../database_models/Role");
const newRoleSchema = require("../json_schema/roleNew.json");
const updateRoleSchema = require("../json_schema/roleUpdate.json")
const { BadRequestError } = require("../expressError");

/** POST / {title, color:{r,g,b}, isAdmin} =>
 *                                  {
 *                                      role:{
 *                                          id,
 *                                          title,
 *                                          server_id,
 *                                          color:{r,g,b},
 *                                          is_admin
 *                                      }
 *                                  }
 * */

const createRole =  async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, newRoleSchema)
        if(!validator.valid) throw new BadRequestError(validator.errors)

        const role = await Role.create(
                        {...req.body,serverId:req.params.serverId})
        return res.status(201).json({role})
    } catch (err) {
        next(err)
    }
}

/** GET / => {
 *              server_id, roles:[{
 *                          id,
 *                          title,
 *                          color:{r,b,g},
 *                          is_admin
 *                      }, ...]
 *          }
 * */

const getRoles = async (req, res, next) => {
    try {
        const roles = await Role.find(req.params.serverId)
        return res.status(200).json({
            server_id:roles[0].server_id,
            roles:roles.map( role => ({
                id:role.id,
                title:role.title,
                color:role.color,
                is_admin:role.is_admin
            }))
        })
    } catch (err) {
        next(err)
    }
}

/** GET /[roleId] => {role:{
 *                          role_id,
 *                          server_id,
 *                          title,
 *                          color:{r,g,b},
 *                          is_admin,
 *                          members:[{nickname, member_id}, ...],
 *                          access:[{room_id, room_name}, ...]
 *                      }}
 * */

const getRole = async (req, res, next) => {
    try {
        const role = await Role.get(req.params.roleId)
        return res.status(200).json({role})
    } catch (err) {
        next(err)
    }
}

/** PATCH /[roleId] {title, color:{r,b,g}, is_admin} => {
 *                              role:{
 *                                      role_id,
 *                                      server_id,
 *                                      title,
 *                                      color:{r,b,g},
 *                                      is_admin
 *                                  }
 *                          }
 * */

const patchRole = async (req, res, next) => {

    try {

        const validator = jsonschema.validate(req.body, updateRoleSchema)
        if(!validator.valid) throw new BadRequestError()

        const role = await Role.update(req.params.roleId, req.body)

        return res.status(201).json({role})
    } catch (err) {
        next(err)
    }

}

/** DELETE /[roleId] => {
 *                          room:{
 *                              role_id,
 *                              server_id,
 *                              title,
 *                              color:{r,b,g},
 *                              is_admin
 *                          }
 *                      }
 * */

const deleteRole =  async (req, res, next) => {
    try {
        const role = await Role.remove(req.params.roleId)
        return res.status(201).json({role})
    } catch (err) {
        next(err)
    }
}

module.exports = { getRole, getRoles, deleteRole, patchRole, createRole }