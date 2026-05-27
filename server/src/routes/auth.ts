import express from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
import supabase from '../api/supabaseClient'
import { randomUUID } from "node:crypto";
import ms from 'ms';

const router = express.Router();

console.log("Auth routes loaded");

dotenv.config();

router.post('/register', async (req, res) => {
    console.log("Try to register")
    const { email, username, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please Provide All Required Fields' });
    }
    const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

    if (user) {
        return res.status(400).json({ message: 'Email already exists' });
    }
    console.log("Try to insert")

    const user_id = randomUUID()
    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSaltSync(12));
    const { data, error } = await supabase
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
    const refreshToken = await getRefreshToken(user_id)
    console.log(refreshToken)
    return res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: Number(ms((process.env.REFRESH_TOKEN_EXPIRES) as any))
    }).status(201)
        .json({ user: data });;

})

router.post('/login', async (req, res) => {
    console.log("Try to login");

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please Provide All Required Fields' });
    }

    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();


    // ❗ login ต้องเป็น "ไม่มี user = error"
    if (!user) {
        return res.status(400).json({ errorCode: "EMAIL_NOT_FOUND", message: 'email not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        console.log("Invalid Password")
        return res.status(401).json({ errorCode: "INVALID_PASSWORD", message: 'Invalid password' });
    }

    console.log(Number(ms((process.env.REFRESH_TOKEN_EXPIRES) as any)))


    const refreshToken = await getRefreshToken(user.user_id)
    console.log(refreshToken)
    return res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: Number(ms((process.env.REFRESH_TOKEN_EXPIRES) as any))
    }).status(201)
        .json({ data: user });;

})

router.post('/refresh', async (req, res) => {

    const token = req.cookies.refreshToken;
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        if (typeof decoded === "string") {
            return res.sendStatus(401);
        }
        return res.json({accessToken: generateAcessToken(decoded.user_id)})

    } catch (err) {
        return res.sendStatus(401);
    }
})

router.get('/me', async (req, res) => {

    const token = req.cookies.refreshToken;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        if (typeof decoded === "string") {
            return res.sendStatus(401);
        }
        return res.json({accessToken: generateAcessToken(decoded.user_id)})

    } catch (err) {
        return res.sendStatus(401);
    }

    // if (!email || !password) {
    //     return res.status(400).json({ message: 'Please Provide All Required Fields' });
    // }

    // const { data: user, error } = await supabase
    //     .from('users')
    //     .select('*')
    //     .eq('email', email)
    //     .maybeSingle();


    // // ❗ login ต้องเป็น "ไม่มี user = error"
    // if (!user) {
    //     return res.status(400).json({ message: 'Invalid email or password' });
    // }
    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) {
    //     return res.status(401).json({ message: 'Invalid password' });
    // }

    // console.log(user)


    // const refreshToken = await getRefreshToken(user.user_id)
    // console.log(refreshToken)
    // return res.cookie("refreshToken", refreshToken, {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === "production",
    //     sameSite: "strict",
    //     maxAge: 2 * 24 * 60 * 60 * 1000 // 7 วัน
    // }).status(201)
    //     .json({ data: user });;

})



type TokenRow = {
    id: string;
    user_id: string;
    refresh_token: string;
    expires_at: string;
};

const getRefreshToken = async (user_id: any) => {
    const { data: tokens, error } = await supabase
        .from("tokens")
        .select("id, refresh_token, expires_at")
        .eq("user_id", user_id);

    if (error) throw new Error("DB error");

    const now = new Date();

    // 🧹 2. ลบ token ที่หมดอายุ
    const expiredIds =
        tokens
            ?.filter(t => new Date(t.expires_at) < now)
            .map(t => t.id) || [];

    if (expiredIds.length > 0) {
        await supabase.from("tokens").delete().in("id", expiredIds);
    }

    // 🔄 3. ลบ token เก่าทั้งหมด (rotation)
    if (tokens && tokens.length > 0) {
        await supabase
            .from("tokens")
            .delete()
            .eq("user_id", user_id);
    }

    // 🆕 4. สร้าง refresh token ใหม่ (JWT)
    const newRefreshToken = generateRefreshToken(user_id);

    // decode เพื่อเอา exp
    const decoded = jwt.decode(newRefreshToken) as { exp: number };

    const expiresAt = new Date(decoded.exp * 1000).toISOString();

    // 💾 5. save ลง DB
    const { error: insertError } = await supabase
        .from("tokens")
        .insert({
            user_id: user_id,
            refresh_token: newRefreshToken, // (ดู note ด้านล่าง)
            expires_at: expiresAt,
        });

    if (insertError) throw new Error("Insert failed");

    return newRefreshToken;
}

const generateAcessToken = (user_id: any) => {
    return jwt.sign({ user_id }, process.env.JWT_SECRET!, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES as any || '5m'
    })
}

const generateRefreshToken = (user_id: any) => {
    return jwt.sign({ user_id }, process.env.JWT_SECRET! as string, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES as any || '15d'
    })
}

export default router