"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var typeorm_1 = require("typeorm");
var class_validator_1 = require("class-validator");
var User_1 = require("../entity/User");
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
var UserController = /** @class */ (function () {
    function UserController() {
    }
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
    UserController.listAll = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var userRepository, users;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userRepository = typeorm_1.getRepository(User_1.User);
                    return [4 /*yield*/, userRepository.find({
                            select: ["id", "name", "email"],
                        })];
                case 1:
                    users = _a.sent();
                    // Send the users object
                    res.send(users);
                    return [2 /*return*/];
            }
        });
    }); };
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
    UserController.getOneById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var id, userRepository, user, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = req.params.id;
                    userRepository = typeorm_1.getRepository(User_1.User);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, userRepository.findOneOrFail(id, {
                            select: ["id", "name", "email"],
                        })];
                case 2:
                    user = _a.sent();
                    res.send(user);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    res.status(404).send("User not found");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
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
    UserController.newUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, name, email, password, role, user, errors, userRepository, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = req.body, name = _a.name, email = _a.email, password = _a.password, role = _a.role;
                    user = new User_1.User();
                    user.name = name;
                    user.email = email;
                    user.password = password;
                    user.role = role || "USER";
                    return [4 /*yield*/, class_validator_1.validate(user)];
                case 1:
                    errors = _b.sent();
                    if (errors.length > 0) {
                        res.status(400).send(errors);
                        return [2 /*return*/];
                    }
                    // Hash the password, to securely store on DB
                    user.hashPassword();
                    userRepository = typeorm_1.getRepository(User_1.User);
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, userRepository.save(user)];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _b.sent();
                    res.status(409).send("email already in use");
                    return [2 /*return*/];
                case 5:
                    delete user.password;
                    delete user.role;
                    // If all ok, send 201 response
                    res.status(201).send(user);
                    return [2 /*return*/];
            }
        });
    }); };
    UserController.editUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var id, _a, name, email, role, userRepository, user, error_2, errors, e_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    id = req.params.id;
                    _a = req.body, name = _a.name, email = _a.email, role = _a.role;
                    userRepository = typeorm_1.getRepository(User_1.User);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, userRepository.findOneOrFail(id)];
                case 2:
                    user = _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _b.sent();
                    // If not found, send a 404 response
                    res.status(404).send("User not found");
                    return [2 /*return*/];
                case 4:
                    // Validate the new values on model
                    user.name = name || user.name;
                    user.email = email || user.email;
                    user.role = role || user.role;
                    return [4 /*yield*/, class_validator_1.validate(user)];
                case 5:
                    errors = _b.sent();
                    if (errors.length > 0) {
                        res.status(400).send(errors);
                        return [2 /*return*/];
                    }
                    _b.label = 6;
                case 6:
                    _b.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, userRepository.save(user)];
                case 7:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 8:
                    e_2 = _b.sent();
                    res.status(409).send("email already in use");
                    return [2 /*return*/];
                case 9:
                    // After all send a 204 (no content, but accepted) response
                    res.status(204).send();
                    return [2 /*return*/];
            }
        });
    }); };
    UserController.deleteUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var id, userRepository, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = req.params.id;
                    userRepository = typeorm_1.getRepository(User_1.User);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, userRepository.findOneOrFail(id)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    res.status(404).send("User not found");
                    return [2 /*return*/];
                case 4:
                    userRepository.softDelete(id);
                    // After all send a 204 (no content, but accepted) response
                    res.status(204).send();
                    return [2 /*return*/];
            }
        });
    }); };
    UserController.deleteUserForever = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var id, userRepository, error_4, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = req.params.id;
                    userRepository = typeorm_1.getRepository(User_1.User);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, userRepository
                            .createQueryBuilder()
                            .delete()
                            .from(User_1.User)
                            .where("id = :id", { id: id })
                            .execute()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    res.status(404).send("User not found");
                    return [2 /*return*/];
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, userRepository.delete(id)];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    error_5 = _a.sent();
                    console.log(error_5);
                    res.status(500).send("Not possible remove this user! ");
                    return [2 /*return*/];
                case 7:
                    // After all send a 204 (no content, but accepted) response
                    res.status(204).send();
                    return [2 /*return*/];
            }
        });
    }); };
    return UserController;
}());
exports.default = UserController;
//# sourceMappingURL=UserController.js.map