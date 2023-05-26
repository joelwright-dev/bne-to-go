import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export default async function handle(req, res) {
    const event = await prisma.user.findUnique({
        where: {
            id: req.body.id
        }
    })
    res.json(event)
}