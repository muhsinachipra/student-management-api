import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UserModel } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";
import { loginSchema } from "../utils/validators";
import type { JwtUserPayload } from "../types/auth";
import { HttpError } from "../utils/httpError";

export const login = asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const user = await UserModel.findOne({ email }).select("+password").lean();
    if (!user?.password) throw new HttpError(401, "Invalid email or password");

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new HttpError(401, "Invalid email or password");

    const payload: JwtUserPayload = {
        sub: String(user._id),
        role: user.role,
        email: user.email,
        name: user.name,
    };

    const signOptions: any = { expiresIn: env.JWT_EXPIRES_IN };
    const token = jwt.sign(payload as any, env.JWT_SECRET as jwt.Secret, signOptions);

    // password is present because of select("+password") + lean()
    const { password: _pw, ...safeUser } = user;

    return res.json({ token, user: safeUser });
});
