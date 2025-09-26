import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { PrismaClient } from "@prisma/client";
import { randomUUID, UUID } from "crypto";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = ({ id, email, validAt }: { id: string, email: string, validAt: Date | null }) => {
  return jwt.sign(
    { id, email, validAt },
    process.env.JWT_SECRET as string,
    { expiresIn: "30d" }
  );
};

export const google = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token as string,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) return res.status(400).json({ message: "Internal Server Error", error: "Payload not found" });

    let user = await prisma.users.findUnique({ where: { email: payload.email } });
    if (!user) {
      const id = randomUUID() as UUID;
      const jwtToken = generateToken({ id, email: payload.email!, validAt: null });
      user = await prisma.users.create({
        data: {
          id: id,
          email: payload.email!,
          name: payload.name!,
          photo: payload.picture!,
          token: jwtToken,
        },
      });
    } else {
      const jwtToken = generateToken({ id: user.id, email: user.email, validAt: user.validAt });
      user = await prisma.users.update({
        where: { email: user.email },
        data: { token: jwtToken },
      });
    }

    res.status(200).json({ message: "Login Successful", data: user });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: `${error}` });
  }
}