import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { v4 as uuid } from "uuid";
import { validate } from "class-validator";
import { User } from "../entity/User";
import config from "../config/config";
import { RefreshToken } from "../entity/RefreshToken";
import moment = require("moment");
import UserController from "./UserController";
import {
  isRefreshTokenExpired,
  isRefreshTokenLinkedToToken,
  isRefreshTokenValid,
  tokenDecode,
} from "../middlewares/checkJwt";

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
   *                    accessToken:
   *                      type: string
   *                      description: Token JWT to access endpoints during one hour.
   *                    typeToken:
   *                      type: string
   *                      description: Constant with prefix used in all requests
   *                    expiresIn:
   *                      type: integer
   *                      description: Eposh or UnixTimestamp to represent date and time limit to expire this token
   *                    refreshToken:
   *                      type: string
   *                      description: When accessToken is expired this token can be used to renew the access regenerating a new accessToken and new refreshToken
   *                  example:
   *                    accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *                    typeToken: Constant with prefix used in all requests
   *                    expiresIn: UnixTimestamp with date and timer to expire this token
   *                    refreshToken: 123abc78-9d1e-34f6-7g90-abcdefghijkl
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
    const jwtId = uuid();
    const token = await AuthController.generateRefreshTokenAndRefreshToken(
      user,
      jwtId
    );

    // Send the jwt in the response
    res.send({
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
      res.status(500).send("Internal error! Refresh Token not work.");
      return;
    }
  };

  static register = async (req: Request, res: Response): Promise<Response> => {
    req.body.role = "USER";
    return UserController.newUser(req, res);
  };
}
export default AuthController;
