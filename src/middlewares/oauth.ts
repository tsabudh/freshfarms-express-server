import { Request, Response } from "express";
import { verifyJWT } from "../utils/jwtUtils";

export const oAuthCallback = async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid authorization code' });
  }

  const tokenRequestBody = {
    grant_type: 'authorization_code',
    code,
    redirect_uri: 'http://localhost:5173/callback', // must match exactly with authorize request
    client_id: 'skd-app',
    client_secret: 'skd-secret'
  };

  try {
    const tokenResponse = await fetch('http://localhost:4000/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokenRequestBody)
    });

    const data = await tokenResponse.json();

    if (tokenResponse.ok && data.access_token) {
      res.cookie('access_token', data.access_token, {
        httpOnly: true,
        secure: false, // Set true in production with HTTPS
        sameSite: 'lax',
        maxAge: 15 * 3600 * 1000
      });
      return res.redirect('http://localhost:5173/dashboard');
    } else {
      console.error('Token exchange failed:', data);
      return res.status(tokenResponse.status).json({
        error: 'Invalid token exchange',
        details: data
      });
    }
  } catch (error:any) {
    console.error('Error during token exchange:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};


export const oAuthCheck = (req:Request, res:Response) => {
  const token = req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = verifyJWT(token);
    console.log("User from token:", user);
    // const user = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ user });
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}