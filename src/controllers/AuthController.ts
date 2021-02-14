import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { v4 as uuid } from "uuid";
import { validate } from "class-validator";
import { User } from "../models/User";
import config from "../config/config";
import { RefreshToken } from "../models/RefreshToken";
import moment = require("moment");
import UserController from "./UserController";
import {
  isRefreshTokenExpired,
  isRefreshTokenLinkedToToken,
  isRefreshTokenValid,
  tokenDecode,
} from "../middlewares/checkJwt";

/**
 * @swagger
 *  components:
 *    headers:
 *      Authorization:
 *        type: string
 *        description: Token JWT to access and validation requests
 *        example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *    refreshToken:
 *      accessToken:
 *        type: string
 *        description: Token JWT to access endpoints during one hour.
 *      typeToken:
 *        type: string
 *        description: Constant with prefix used in all requests
 *      expiresIn:
 *        type: integer
 *        description: Eposh or UnixTimestamp to represent date and time limit to expire this token
 *      refreshToken:
 *        type: string
 *        description: When accessToken is expired this token can be used to renew the access regenerating a new accessToken and new refreshToken
 *
 */

class AuthController {
  /**
   * @swagger
   *
   *  paths:
   *    /api/auth/login:
   *      post:
   *        description: Login to access the application
   *        summary: Login to authentication
   *        tags:
   *          - Auth
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                required:
   *                  - email
   *                  - password
   *                properties:
   *                  email:
   *                    type: string
   *                  password:
   *                    type: string
   *                example:
   *                  email: admin@admin.com
   *                  password: admin@123
   *        responses:
   *          201:
   *            headers:
   *              Authorization:
   *                schema:
   *                  $ref: '#/components/headers/Authorization'
   *            content:
   *              application/json:
   *                schema:
   *                  type: object
   *                  properties:
   *                    $ref: '#/components/refreshToken'
   *                  example:
   *                    accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *                    typeToken: Bearer
   *                    expiresIn: 1234568790123
   *                    refreshToken: eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...
   *          401:
   *            description: Unauthenticated
   *          422:
   *            description: Validation error
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
    const jwtId = uuid();
    const token = await AuthController.generateRefreshTokenAndRefreshToken(
      user,
      jwtId
    );

    // Send the jwt in the response
    res.status(201).send({
      accessToken: token.accessToken,
      typeToken: "Bearer",
      expiresIn: expiresIn.toString(),
      refreshToken: token.refreshToken,
    });
  };

  private static generateRefreshTokenAndRefreshToken = async (
    user: User,
    jwtId: string
  ): Promise<any> => {
    // create new token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      {
        expiresIn: "1h",
        jwtid: jwtId,
        subject: user.id.toString(),
        algorithm: "HS512",
      }
    );
    // create new refreshToken
    const refreshToken = new RefreshToken();
    refreshToken.user = user;
    refreshToken.jwtId = jwtId;
    refreshToken.expireAt = moment().add(30, "days").toDate();
    const refreshTokenRepository = getRepository(RefreshToken);
    await refreshTokenRepository.save(refreshToken);
    const refreshTokenSecure = jwt.sign(
      { id: refreshToken.id, userId: user.id, email: user.email },
      config.jwtSecret,
      {
        expiresIn: "30d",
        jwtid: jwtId,
        subject: user.id.toString(),
        algorithm: "HS512",
      }
    );
    return { accessToken, refreshToken: refreshTokenSecure };
  };

  /**
   * @swagger
   *
   *  paths:
   *    /api/auth/refresh-token:
   *      post:
   *        description: Refresh Tokens not expired or invalid generating a new response with tokens valid
   *        summary: Refresh Tokens
   *        tags:
   *          - Auth
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                required:
   *                  - refreshToken
   *                properties:
   *                  refreshToken:
   *                    type: string
   *                example:
   *                  refreshToken: eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...
   *        responses:
   *          201:
   *            content:
   *              application/json:
   *                schema:
   *                  type: object
   *                  properties:
   *                    $ref: '#/components/refreshToken'
   *                  example:
   *                    accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *                    typeToken: Bearer
   *                    expiresIn: 1234568790123
   *                    refreshToken: eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...
   *          401:
   *            description: Unauthenticated
   *          403:
   *            description: Not authorized | Refresh Token expired or invalid | Bearer Token does not match with Refresh Token | Refresh Token has expired
   *          404:
   *            description: User not found
   *          500:
   *            description: Internal error! Sorry, try again later :(
   */
  static refreshToken = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const { refreshToken: refreshTokenId } = req.body;

    const refreshTokenRepository = getRepository(RefreshToken);
    const userRepository = getRepository(User);
    let user: User;
    try {
      // Confirm if token is valid
      if (!isRefreshTokenValid(refreshTokenId)) {
        res.status(403).send("Refresh Token expired or invalid");
        return;
      }
      const jwtPayload = tokenDecode(refreshTokenId);
      const refreshToken = await refreshTokenRepository.findOne(jwtPayload.id);
      // check token stored equals token encrypted in jwt
      if (
        !refreshToken ||
        !isRefreshTokenLinkedToToken(refreshToken, jwtPayload.jti)
      ) {
        res.status(403).send("Bearer Token does not match with Refresh Token");
        return;
      }
      // check token not expired
      if (isRefreshTokenExpired(refreshToken)) {
        refreshToken.invalidated = true;
        refreshTokenRepository.save(refreshToken);
        res.status(403).send("Refresh Token has expired");
        return;
      }
      // check token not used or invalidated
      if (refreshToken.used || refreshToken.invalidated) {
        res.status(403).send("Refresh Token has been used or invalidated");
        return;
      }
      user = await userRepository.findOne(jwtPayload.userId.toString());
      if (!user) {
        res.status(404).send("User not found");
        return;
      }
      refreshToken.used = true;
      refreshTokenRepository.save(refreshToken);
      const now = new Date();
      const expiresIn = now.setHours(now.getHours() + 1);
      const newRefreshToken = await AuthController.generateRefreshTokenAndRefreshToken(
        user,
        uuid()
      );
      res.status(201).send({
        accessToken: newRefreshToken.accessToken,
        typeToken: "Bearer",
        expiresIn: expiresIn.toString(),
        refreshToken: newRefreshToken.refreshToken,
      });
      return;
    } catch (error) {
      res.status(500).send("Internal error! Sorry, try again later :(");
      return;
    }
  };

  /**
   * @swagger
   *
   *  paths:
   *    /api/auth/register:
   *      post:
   *        description: Register new users to using the basic about films in this Api
   *        summary: Register new user
   *        tags:
   *          - Auth
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
   *          409:
   *            description: Email already in use
   *          422:
   *            description: Validation error
   *          500:
   *            description: Internal error!
   */
  static register = async (req: Request, res: Response): Promise<Response> => {
    req.body.role = "USER";
    return UserController.newUser(req, res);
  };

  /**
   * @swagger
   *
   *  paths:
   *    /api/auth/change-password:
   *      post:
   *        description: Change password for user authenticated in Bearer Token.
   *        summary: Change password
   *        security:
   *          - Bearer: []
   *        tags:
   *          - Auth
   *        requestBody:
   *          required:
   *            - oldPassword
   *            - newPassword
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  oldPassword:
   *                    type: string
   *                    description: Current password for change and validation
   *                  newPassword:
   *                    type: string
   *                    description: New password to changed
   *                example:
   *                  oldPassword: admin@123
   *                  newPassword: newUser@123
   *        responses:
   *          204:
   *            description: Password is changed with success!
   *            headers:
   *              Authorization:
   *                schema:
   *                  $ref: '#/components/headers/Authorization'
   *          401:
   *            description: Unauthenticated
   *          403:
   *            description: Not authorized
   *          422:
   *            description: Validation error
   */
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
      res.status(403).send();
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
