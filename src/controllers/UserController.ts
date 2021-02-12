import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";

import { User } from "../entity/User";

/**
 * @swagger
 *  components:
 *    schemas:
 *      User:
 *        type: object
 *        required:
 *          - name
 *          - email
 *          - password
 *        properties:
 *          id:
 *            type: integer
 *            description: The auto-generated id of the user.
 *          name:
 *            type: string
 *            description: Name to identify and distinguish users.
 *          email:
 *            type: string
 *            description: E-mail to log in to the system.
 *          password:
 *            type: string
 *            description: Password for system authentication.
 *          role:
 *            type: string
 *            description: Identifier to allow access there are some contents that require different credentials.
 *          createdAt:
 *            type: string
 *            format: date
 *            description: The date of the record creation.
 *          updatedAt:
 *            type: string
 *            format: date
 *            description: The registration date when a property is changed.
 *          deletedAt:
 *            type: string
 *            format: date
 *            description: Date when a record was deleted
 *        example:
 *           id: 1
 *           name: User Admin
 *           email: admin@admin.com
 *           password: admin@123
 *           role: 'ADMIN'
 */
class UserController {
  /**
   * @swagger
   *
   *  paths:
   *    /api/user:
   *      get:
   *        description: Get all users
   *        security:
   *          - Bearer: []
   *        tags:
   *          - User
   *        content:
   *          - application/json
   *        responses:
   *          200:
   *            description: Array with all users not deleted
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/User'
   *          401:
   *            description: Unauthorised
   *
   */
  static listAll = async (req: Request, res: Response): Promise<Response> => {
    // Get users from database
    const userRepository = getRepository(User);
    // Never send the passwords on response
    const users = await userRepository.find({
      select: ["id", "name", "email"],
    });

    // Send the users object
    res.send(users);
  };

  /**
   * @swagger
   *
   *  paths:
   *      /api/user/{id}:
   *        get:
   *          description: Find one user using ID to return object User from database
   *          summary: Gets a user by id
   *          security:
   *           - Bearer: []
   *          tags:
   *           - User
   *          parameters:
   *            - in: path
   *              name: id
   *              schema:
   *                type: integer
   *              required: true
   *              description: The user id
   *          responses:
   *            200:
   *              description: Object User.
   *              content:
   *                application/json:
   *                   schema:
   *                      type: object
   *                      properties:
   *                        id:
   *                          type: integer
   *                        name:
   *                          type: string
   *                        email:
   *                          type: string
   *                   example:
   *                     id: 1
   *                     name: Admin
   *                     email: admin@admin.com
   *            401:
   *              description: Unauthorised
   *            404:
   *              description: User not found.
   *
   */
  static getOneById = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    // Get the ID from the url
    const id: number = req.params.id;

    // Get the user from database
    const userRepository = getRepository(User);
    try {
      // Never send the password on response
      const user = await userRepository.findOneOrFail(id, {
        select: ["id", "name", "email"],
      });
      res.send(user);
    } catch (error) {
      res.status(404).send("User not found");
    }
  };

  /**
   * @swagger
   *
   *  paths:
   *    /api/user:
   *      post:
   *        description: Create a new user
   *        security:
   *          - Bearer: []
   *        tags:
   *          - User
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  name:
   *                    type: string
   *                  email:
   *                    type: string
   *                  password:
   *                    type: string
   *                  role:
   *                    type: string
   *                    required: false
   *                example:
   *                  name: User
   *                  email: user@gmail.com
   *                  password: admin@123
   *        responses:
   *          200:
   *            description: login successful
   *            content:
   *              application/json:
   *                  schema:
   *                    $ref: '#/components/schemas/User'
   *          401:
   *            description: Unauthorised
   *          422:
   *            description: validation error
   */
  static newUser = async (req: Request, res: Response): Promise<Response> => {
    // Get parameters from the body
    const { name, email, password, role } = req.body;
    const user = new User();
    user.name = name;
    user.email = email;
    user.password = password;
    user.role = role || "USER";

    // Validade if the parameters are ok
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    // Hash the password, to securely store on DB
    user.hashPassword();

    // Try to save. If fails, the email is already in use
    const userRepository = getRepository(User);
    try {
      await userRepository.save(user);
    } catch (e) {
      res.status(409).send("email already in use");
      return;
    }
    delete user.password;
    delete user.role;
    // If all ok, send 201 response
    res.status(201).send(user);
  };

  /**
   * @swagger
   *
   *  paths:
   *    /api/user/{id}:
   *      put:
   *        description: Update user data
   *        summary: Update user
   *        security:
   *          - Bearer: []
   *        tags:
   *          - User
   *        parameters:
   *          - in: path
   *            name: id
   *            schema:
   *              type: integer
   *            required: true
   *            description: The user id
   *        requestBody:
   *          required: false
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  name:
   *                    type: string
   *                  email:
   *                    type: string
   *                example:
   *                  name: User
   *                  email: user@gmail.com
   *        responses:
   *          200:
   *            description: Updated
   *            content:
   *              application/json:
   *                  schema:
   *                    $ref: '#/components/schemas/User'
   *          401:
   *            description: Unauthorised
   *          422:
   *            description: validation error
   */
  static editUser = async (req: Request, res: Response): Promise<Response> => {
    // Get the ID from the url
    const id = req.params.id;

    // Get values from the body
    const { name, email, role } = req.body;

    // Try to find user on database
    const userRepository = getRepository(User);
    let user;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (error) {
      // If not found, send a 404 response
      res.status(404).send("User not found");
      return;
    }

    // Validate the new values on model
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    // Try to safe, if fails, that means email already in use
    try {
      await userRepository.save(user);
    } catch (e) {
      res.status(409).send("email already in use");
      return;
    }
    // After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };

  static deleteUser = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    // Get the ID from the url
    const id = req.params.id;

    const userRepository = getRepository(User);
    try {
      await userRepository.findOneOrFail(id);
    } catch (error) {
      res.status(404).send("User not found");
      return;
    }
    userRepository.softDelete(id);

    // After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };

  static deleteUserForever = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    // Get the ID from the url
    const id = req.params.id;

    const userRepository = getRepository(User);
    try {
      await userRepository
        .createQueryBuilder()
        .delete()
        .from(User)
        .where("id = :id", { id })
        .execute();
    } catch (error) {
      res.status(404).send("User not found");
      return;
    }
    try {
      await userRepository.delete(id);
    } catch (error) {
      console.log(error);
      res.status(500).send("Not possible remove this user! ");
      return;
    }
    // After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };
}

export default UserController;
