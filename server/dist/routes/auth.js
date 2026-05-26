"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const supabaseClient_1 = __importDefault(require("../api/supabaseClient"));
const node_crypto_1 = require("node:crypto");
const router = express_1.default.Router();
console.log("Auth routes loaded");
dotenv_1.default.config();
router.post('/register', async (req, res) => {
    console.log("Try to register");
    const { email, username, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please Provide All Required Fields' });
    }
    const { data: user } = await supabaseClient_1.default
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();
    if (user) {
        return res.status(400).json({ message: 'Email already exists' });
    }
    console.log("Try to insert");
    const user_id = (0, node_crypto_1.randomUUID)();
    const hashedPassword = await bcryptjs_1.default.hash(password, await bcryptjs_1.default.genSaltSync(12));
    const { data, error } = await supabaseClient_1.default
        .from('users')
        .insert({
        email,
        user_id: user_id,
        username,
        password: hashedPassword
    })
        .select()
        .single();
    if (error) {
        console.log(error);
        return res.status(500).json({ message: 'Insert failed' });
    }
    const refreshToken = await getRefreshToken(user_id);
    console.log(refreshToken);
    return res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 2 * 24 * 60 * 60 * 1000 // 7 วัน
    }).status(201)
        .json({ user: data });
    ;
});
router.post('/login', async (req, res) => {
    console.log("Try to login");
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please Provide All Required Fields' });
    }
    const { data: user, error } = await supabaseClient_1.default
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
    // ❗ login ต้องเป็น "ไม่มี user = error"
    if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid password' });
    }
    console.log(user);
    const refreshToken = await getRefreshToken(user.user_id);
    console.log(refreshToken);
    return res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 2 * 24 * 60 * 60 * 1000 // 7 วัน
    }).status(201)
        .json({ data: user });
    ;
});
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 30 Days
};
const getRefreshToken = async (user_id) => {
    const { data: tokens, error } = await supabaseClient_1.default
        .from("tokens")
        .select("id, refresh_token, expires_at")
        .eq("user_id", user_id);
    if (error)
        throw new Error("DB error");
    const now = new Date();
    // 🧹 2. ลบ token ที่หมดอายุ
    const expiredIds = tokens
        ?.filter(t => new Date(t.expires_at) < now)
        .map(t => t.id) || [];
    if (expiredIds.length > 0) {
        await supabaseClient_1.default.from("tokens").delete().in("id", expiredIds);
    }
    // 🔄 3. ลบ token เก่าทั้งหมด (rotation)
    if (tokens && tokens.length > 0) {
        await supabaseClient_1.default
            .from("tokens")
            .delete()
            .eq("user_id", user_id);
    }
    // 🆕 4. สร้าง refresh token ใหม่ (JWT)
    const newRefreshToken = generateRefreshToken(user_id);
    // decode เพื่อเอา exp
    const decoded = jsonwebtoken_1.default.decode(newRefreshToken);
    const expiresAt = new Date(decoded.exp * 1000).toISOString();
    // 💾 5. save ลง DB
    const { error: insertError } = await supabaseClient_1.default
        .from("tokens")
        .insert({
        user_id: user_id,
        refresh_token: newRefreshToken, // (ดู note ด้านล่าง)
        expires_at: expiresAt,
    });
    if (insertError)
        throw new Error("Insert failed");
    return newRefreshToken;
};
const generateAcessToken = (user_id) => {
    return jsonwebtoken_1.default.sign({ user_id }, process.env.JWT_SECRET, {
        expiresIn: '3d'
    });
};
const generateRefreshToken = (user_id) => {
    return jsonwebtoken_1.default.sign({ user_id }, process.env.JWT_SECRET, {
        expiresIn: '15d'
    });
};
exports.default = router;
//# sourceMappingURL=auth.js.map