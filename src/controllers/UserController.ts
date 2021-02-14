import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";

import { User } from "../models/User";

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
 */
class UserController {
  /**
   * @swagger
   *
   *  paths:
   *    /api/user:
   *      get:
   *        description: Get array with all users.
   *        summary: Get all users
   *        security:
   *          - Bearer: []
   *        tags:
   *          - User
   *        content:
   *          - application/json
   *        responses:
   *          200:
   *            description: Array with all users not deleted. Role ADMIN is needed to get this content.
   *            content:
   *              application/json:
   *                schema:
   *                  type: array
   *                  items:
   *                    $ref: '#/components/schemas/User'
   *          401:
   *            description: unauthenticated
   *
   */
  static listAll = async (req: Request, res: Response): Promise<Response|any> => {
    // Get users from database
    const userRepository = getRepository(User);
    // Never send the passwords on response
    const users = await userRepository.find({
      select: ["id", "name", "email"],
    });

    // Send the users object
    res.status(200).send(users);
  };

  /**
   * @swagger
   *
   *  paths:
   *      /api/user/{id}:
   *        get:
   *          description: Find one user using ID to return object User from database
   *          summary: Get a user by id
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
   *              description: unauthenticated
   *            403:
   *              description: Not authorized
   *            404:
   *              description: User not found
   *            500:
   *              description: Internal error!
   *
   */
  static getOneById = async (
    req: Request,
    res: Response
  ): Promise<Response|User|any> => {
    // Get the ID from the url
    const id = Number(req.params.id);

    // Get the user from database
    const userRepository = getRepository(User);
    try {
      // Never send the password on response
      const user = await userRepository.findOneOrFail(id, {
        select: ["id", "name", "email"],
      });
      res.status(200).send(user);
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
   *        description: Create a new user if you have role ADMIN.
   *        summary: Create user
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
   *                required:
   *                  - name
   *                  - email
   *                  - password
   *                properties:
   *                  name:
   *                    type: string
   *                  email:
   *                    type: string
   *                  password:
   *                    type: string
   *                  role:
   *                    type: string
   *                example:
   *                  name: User
   *                  email: user@gmail.com
   *                  password: admin@123
   *        responses:
   *          201:
   *            description: User created
   *            content:
   *              application/json:
   *                  schema:
   *                    $ref: '#/components/schemas/User'
   *          401:
   *            description: unauthenticated
   *          403:
   *            description: Not authorized
   *          409:
   *            description: Email already in use
   *          422:
   *            description: Validation error
   *          500:
   *            description: Internal error!
   */
  static newUser = async (req: Request, res: Response): Promise<Response> => {
    // Get parameters from the body
    const { name, email, password, role } = req.body;
    const user = new User();
    user.name = name;
    user.email = email;
    user.password = password;
    user.role =
      (role && role.toUpperCase().includes("ADMIN") ? "ADMIN" : "USER") ||
      "USER";

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
    delete user.deletedAt;
    // If all ok, send 201 response
    res.status(201).send({ id: user.id, ...user });
  };

  /**
   * @swagger
   *
   *  paths:
   *    /api/user/{id}:
   *      put:
   *        description: Updates a user by id. Not all user properties are required.
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
   *          204:
   *            description: Updated user
   *          401:
   *            description: unauthenticated
   *          403:
   *            description: Not authorized
   *          404:
   *            description: User not found
   *          422:
   *            description: Validation error
   *          500:
   *            description: Internal error! Sorry, try again later :(
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

  /**
   * @swagger
   *
   *  paths:
   *    /api/user/{id}:
   *      delete:
   *        description: Logically deletes a user by id
   *        summary: Delete user by id
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
   *        responses:
   *          204:
   *            description: Deleted user with success
   *          401:
   *            description: unauthenticated
   *          403:
   *            description: Not authorized
   *          404:
   *            description: User not found
   *          500:
   *            description: Internal error!
   */
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

  /**
   * @swagger
   *
   *  paths:
   *    /api/user/{id}/forever:
   *      delete:
   *        description: Delete physical for user by id. This action is irreversible.
   *        summary: Delete user by id forever
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
   *        responses:
   *          204:
   *            description: User successfully deleted forever
   *          401:
   *            description: unauthenticated
   *          403:
   *            description: Not authorized
   *          404:
   *            description: User not found
   *          500:
   *            description: Internal error! Sorry, try again later :(
   */
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
      res.status(500).send("Internal error! Sorry, try again later :(");
      return;
    }
    // After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };

  /**
   * @swagger
   *
   *  paths:
   *    /api/user/{id}/recover:
   *      post:
   *        description: Recover a logically deleted user
   *        summary: Recover user
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
   *        responses:
   *          204:
   *            description: User recovered with success
   *          401:
   *            description: Unauthenticated
   *          403:
   *            description: Not authorized
   *          404:
   *            description: User not found
   *          500:
   *            description: Internal error! Sorry, try again later :(
   */
  static recover = async (req: Request, res: Response): Promise<Response> => {
    // Get the ID from the url
    const id = req.params.id;

    const userRepository = getRepository(User);
    try {
      await userRepository.restore(id);
    } catch (error) {
      res.status(500).send("Internal error! Sorry, try again later :(");
      return;
    }
    try {
      await userRepository.findOneOrFail(id);
    } catch (error) {
      res.status(404).send("User not found");
      return;
    }
    // After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };
}

export default UserController;
