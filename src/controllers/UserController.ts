
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";

import { User } from "../entity/User";

class UserController {

    static listAll = async (req: Request, res: Response) => {
        // Get users from database
        const userRepository = getRepository(User);
        // Never send the passwords on response
        const users = await userRepository.find({
            select: ["id", "name", "email"]
        });

        // Send the users object
        res.send(users);
    };

    static getOneById = async (req: Request, res: Response) => {
        // Get the ID from the url
        const id: number = req.params.id;

        // Get the user from database
        const userRepository = getRepository(User);
        try {
            // Never send the password on response
            const user = await userRepository.findOneOrFail(id, {
                select: ["id", "name", "email"]
            });
            res.send(user);
        } catch (error) {
            res.status(404).send("User not found");
        }
    };

    static newUser = async (req: Request, res: Response) => {
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

        // If all ok, send 201 response
        res.status(201).send("User created");
    };

    static editUser = async (req: Request, res: Response) => {
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
        user.name = name;
        user.email = email;
        user.role = role || "USER";
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

    static deleteUser = async (req: Request, res: Response) => {
        // Get the ID from the url
        const id = req.params.id;

        const userRepository = getRepository(User);
        let user: User;
        try {
            user = await userRepository.findOneOrFail(id);
        } catch (error) {
            res.status(404).send("User not found");
            return;
        }
        userRepository.delete(id);

        // After all send a 204 (no content, but accepted) response
        res.status(204).send();
    };
};

export default UserController;
