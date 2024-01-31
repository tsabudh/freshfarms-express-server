import jwt from 'jsonwebtoken';
import fs from 'fs';
import crypto from 'crypto';


function pemToJWK(pem: any, isPrivate: boolean) {
   
    const key = isPrivate
        ? crypto.createPrivateKey(pem)
        : crypto.createPublicKey(pem);

    const jwk = Object.assign({
        use: 'sig',
        kid: crypto.randomBytes(16).toString('hex'),
    }, key.export({ format: 'jwk' }));


   return jwk;
}

export function generateJWKS(publicPemFile: any) {
    const publicPem = fs.readFileSync(publicPemFile, 'utf8');

    const publicKeyJWK = pemToJWK(publicPem, false);

    const jwks = {
        keys: [publicKeyJWK],
    };

    return jwks;
}


//- SERVER SIDE
// Generating secret
// const secret = fs.readFileSync('certs/private.pem');

// Generating JWK from public key
// const jwks = generateJWKS('certs/public.pem');

// console.log(JSON.stringify(jwks))

// Signing token with payload
// let token = jwt.sign({ payloadKey: 'payload value' }, secret, { expiresIn: '60min', algorithm: 'RS256' });
// console.log(token);

//- CLIENT SIDE
// const clientPub = fs.readFileSync('certs/public.pem');

// let decoded = jwt.verify(token, clientPub, { algorithms: ['RS256'] });
// console.log(decoded);