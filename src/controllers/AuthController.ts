import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { validate } from "class-validator";

import { User } from "../entity/User";
import config from "../config/config";

class AuthController {
  /**
   * @swagger
   *
   *  paths:
   *    /api/auth/login:
   *      post:
   *        description: Login to the application
   *        tags:
   *          - Auth
   *        requestBody:
   *          required:
   *            - email
   *            - password
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  email:
   *                    type: string
   *                  password:
   *                    type: string
   *                example:
   *                  email: admin@admin.com
   *                  password: admin@123
   *        responses:
   *          200:
   *            description: login successful
   *            headers:
   *              Authorization:
   *                schema:
   *                  $ref: '#/components/headers/Authorization'
   *            content:
   *              application/json:
   *                schema:
   *                  type: object
   *                  properties:
   *                    access_token:
   *                      type: string
   *                      description: Token JWT to access endpoints during one hour.
   *                    type_token:
   *                      type: string
   *                      description: Constant with prefix used in all requests
   *                    expires_in:
   *                      type: integer
   *                      description: Eposh or UnixTimestamp to represent date and time limit to expire this token
   *                  example:
   *                    access_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *                    type_token: Constant with prefix used in all requests
   *                    expires_in: UnixTimestamp with date and timer to expire this token
   *          401:
   *            description: Unauthorised
   *          422:
   *            description: validation error
   */
  static login = async (req: Request, res: Response): Promise<Response> => {
    // Check if email and password are set
    const { email, password } = req.body;
    if (!(email && password)) {
      res.status(422).send();
    }

    // Get user from database
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail({ where: { email } });
    } catch (error) {
      res.status(401).send();
    }

    // Check if encrypted password match
    if (!user.checkIfUnencryptedPasswordIsValid(password)) {
      res.status(401).send();
      return;
    }

    // Sing JWT, valid for 1 hour
    const now = new Date();
    const expiresIn = now.setHours(now.getHours() + 1);
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: "1h" }
    );

    // Send the jwt in the response
    res.send({
      access_token: token,
      type_token: "Bearer",
      expires_in: expiresIn.toString(),
    });
  };

  static changePassword = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    // Get ID from JWT
    const id = res.locals.jwtPayload.userId;

    // Get parameters from the body
    const { oldPassword, newPassword } = req.body;
    if (!(oldPassword && newPassword)) {
      res.status(400).send();
    }

    // Get user from the database
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (id) {
      res.status(401).send();
    }

    // Check if old password matchs
    if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
      res.status(401).send();
      return;
    }

    // Validate de model (password lenght)
    user.password = newPassword;
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }
    // Hash the new password and save
    user.hashPassword();
    userRepository.save(user);

    res.status(204).send();
  };
}
export default AuthController;
