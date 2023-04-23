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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signInHandler = exports.signUpHandler = void 0;
const datastore_1 = require("../datastore");
const crypto_1 = __importDefault(require("crypto"));
const auth_1 = require("../auth");
const signUpHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, userName, password } = req.body;
    if (!email || !userName || !password) {
        return res.sendStatus(400).send({ error: 'All fields are required' });
    }
    const existing = (yield datastore_1.db.getUserByEmail(email)) || (yield datastore_1.db.getUserByUsername(userName));
    if (existing) {
        return res.status(403).send({ error: 'User already exists' });
    }
    const passwordHash = crypto_1.default.pbkdf2Sync(password, process.env.PASSWORD_SALT, 42, 64, 'sha512').toString('hex');
    const user = {
        id: crypto_1.default.randomUUID(),
        userName: userName,
        email: email,
        password: passwordHash,
    };
    yield datastore_1.db.createUser(user);
    const jwt = (0, auth_1.signJwt)({ userId: user.id });
    return res.sendStatus(200).send({
        jwt
    });
});
exports.signUpHandler = signUpHandler;
const signInHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { login, password } = req.body;
    if (!login || !password) {
        return res.sendStatus(400);
    }
    const existing = (yield datastore_1.db.getUserByEmail(login)) || (yield datastore_1.db.getUserByUsername(login));
    if (!existing || existing.password != password) {
        return res.sendStatus(403);
    }
    const jwt = (0, auth_1.signJwt)({ userId: existing.id });
    return res.send({
        user: {
            email: existing.email,
            userName: existing.userName,
            id: existing.id
        },
        jwt
    });
});
exports.signInHandler = signInHandler;