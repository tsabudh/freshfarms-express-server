import jwt from "jsonwebtoken";
import fs from "fs";
import crypto from "crypto";

function pemToJWK(pem: any, isPrivate: boolean) {
    const key = isPrivate
        ? crypto.createPrivateKey(pem)
        : crypto.createPublicKey(pem);

    const jwk = Object.assign(
        {
            use: "sig",
            kid: crypto.randomBytes(16).toString("hex"),
        },
        key.export({ format: "jwk" })
    );

    return jwk;
}

export function generateJWKS(publicPemFile: any) {
    const publicPem = fs.readFileSync(publicPemFile, "utf8");

    const publicKeyJWK = pemToJWK(publicPem, false);

    const jwks = {
        keys: [publicKeyJWK],
    };

    return jwks;
}


export function signJWT(payload: Object) {

    try {
        const secret = fs.readFileSync("certs/private.pem", "utf-8");
        let token = jwt.sign(payload, secret, {
            expiresIn: "1d",
            algorithm: "RS256",
        });
        return token;
    } catch (error: any) {
        console.log(error);
        return error;
    }

}

export function verifyJWT(token: string) {
    try {
        const clientPub = fs.readFileSync("certs/public.pem", "utf-8");
        let decodedToken = jwt.verify(token, clientPub, {
            algorithms: ["RS256"],
        });

        return decodedToken;
    } catch (error) {
        console.log(error);
        return error;
    }
}
