import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import moment = require("moment");
import config from "../config/config";
import { RefreshToken } from "../entity/RefreshToken";

export const checkJwt = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Get the jwt token from the head
  const token = <string>req.headers.authorization;
  let jwtPayload: {
    userId: any;
    email: any;
    iat: number;
    exp: number;
    sub: any;
    jti: string;
  };

  // Try to validate the token and get data
  try {
    if (!isTokenValid(token)) throw new Error("Token is invalid!");
    jwtPayload = <any>jwt.verify(
      token.replace("Bearer ", ""),
      config.jwtSecret,
      {
        ignoreExpiration: false,
      }
    );
    res.locals.jwtPayload = jwtPayload;
  } catch (error) {
    console.log(error);
    // If token is not valid, respond with 401 (unauthorized)
    res.status(401).send();
    return;
  }

  // The token is valid for 1 hour
  // We want to send a new token on every request
  // const { userId, email, sub, jti } = jwtPayload;
  // const newToken = jwt.sign({ userId, email }, config.jwtSecret, {
  //   expiresIn: "1h",
  //   jwtid: jti,
  //   subject: sub,
  //   algorithm: "HS512",
  // });
  // res.setHeader("token", newToken);

  // Call the next middleware or controller
  next();
};

export const isTokenValid = (accessToken: string): boolean => {
  try {
    let token = accessToken;
    if (token && !token.includes("Bearer ")) return false;
    else token = token.replace("Bearer ", "");
    if (
      jwt.verify(token, config.jwtSecret, {
        ignoreExpiration: false,
      })
    )
      return true;
  } catch (error) {
    console.log(error);
    return false;
  }
  return false;
};

export const isRefreshTokenValid = (refreshToken: string): boolean => {
  try {
    let token = refreshToken;
    if (token && token.includes("Bearer "))
      token = token.replace("Bearer ", "");
    if (
      jwt.verify(token, config.jwtSecret, {
        ignoreExpiration: false,
      })
    )
      return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const tokenDecode = (token: string): any => {
  let decode: {
    id: any;
    userId: any;
    email: any;
    iat: number;
    exp: number;
    sub: any;
    jti: string;
  };
  try {
    decode = <any>jwt.verify(token.replace("Bearer ", ""), config.jwtSecret, {
      ignoreExpiration: false,
    });
  } catch (error) {
    console.log(error);
    decode = undefined;
  }
  return decode;
};

export const isRefreshTokenLinkedToToken = (
  refreshToken: RefreshToken,
  jwtId: string
): boolean => {
  if (refreshToken.jwtId == jwtId) return true;
  return false;
};

export const isRefreshTokenExpired = (refreshToken: RefreshToken): boolean => {
  if (moment().isAfter(refreshToken.expireAt)) {
    return true;
  }
  return false;
};
