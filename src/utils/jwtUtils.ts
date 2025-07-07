import jwt from 'jsonwebtoken';
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

function pemToJWK(pem: any, isPrivate: boolean) {
  const key = isPrivate ? crypto.createPrivateKey(pem) : crypto.createPublicKey(pem);

  const jwk = Object.assign(
    {
      use: 'sig',
      kid: crypto.randomBytes(16).toString('hex'),
    },
    key.export({ format: 'jwk' }),
  );

  return jwk;
}

export function generateJWKS() {
  const publicPem = getPem('PUBLIC_KEY', 'certs/public.pem');

  const publicKeyJWK = pemToJWK(publicPem, false);

  const jwks = {
    keys: [publicKeyJWK],
  };

  return jwks;
}

export function signJWT(payload: object) {
  try {
    const privateKey = getPem('PRIVATE_KEY', 'certs/private.pem');
    let token = jwt.sign(payload, privateKey, {
      expiresIn: '1d',
      algorithm: 'RS256',
    });
    return token;
  } catch (error: any) {
    console.log(error);
    return error;
  }
}

export function verifyJWT(token: string) {
  try {
    const publicKey = getPem('PRIVATE_KEY', 'certs/private.pem');

    let decodedToken = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
    });

    return decodedToken;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

function getPem(keyEnvVarName: string, defaultFilePath: string): string {
  const envKey = process.env[keyEnvVarName];
  if (envKey) {
    // Env var found — replace escaped newlines with actual newlines
    return envKey.replace(/\\n/g, '\n');
  }

  // Fallback: read from file path (relative to project root)
  const absolutePath = path.isAbsolute(defaultFilePath)
    ? defaultFilePath
    : path.join(process.cwd(), defaultFilePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`PEM file not found at path: ${absolutePath}`);
  }

  return fs.readFileSync(absolutePath, 'utf8');
}
