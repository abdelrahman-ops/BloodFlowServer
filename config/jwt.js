import jwt from "jsonwebtoken";

export const createJWT = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        // expiresIn: "1d",
    });

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
        maxAge: 1 * 24 * 60 * 60 * 1000, 
    });

    return token;
};

export const clearJWT = (res) => {
    res.cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        expires: new Date(0)  // Expire the cookie immediately
    });
};
