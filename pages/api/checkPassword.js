import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
const bcrypt = require("bcrypt")

const prisma = new PrismaClient()

export default async function handle(req, res) {
    const body = JSON.parse(req.body)
    const session = await getServerSession(req, res, authOptions)

    if(session) {
        if(session.user.id == body.id) {
            const user = await prisma.user.findUnique({
                where: {
                    id: body.id
                }
            })
        
            console.log(user)
            
            if(await bcrypt.compare(body.currentPassword, user.password)) {
                if(body.username.length > 0 && body.password.length > 0) {
                    await prisma.user.update({
                        where: {
                            id: body.id
                        },
                        data: {
                            password: await bcrypt.hash(body.password, 10),
                            username: body.username
                        }
                    })
        
                    res.send({ status: 200, message: "Success" })
                } else if(body.password.length > 0) {
                    await prisma.user.update({
                        where: {
                            id: body.id
                        },
                        data: {
                            password: await bcrypt.hash(body.password, 10),
                        }
                    })
        
                    res.send({ status: 200, message: "Success" })
                } else if(body.username.length > 0) {
                    await prisma.user.update({
                        where: {
                            id: body.id
                        },
                        data: {
                            username: body.username
                        }
                    })
        
                    res.send({ status: 200, message: "Success" })
                } else {
                    res.send({ status: 500, message: "" })
                }
            } else {
                res.send({ status: 500, message: "Incorrect password" })
            }
        }  else {
            res.send({ status: 404, message: "Not found" })
        }
    } else {
        res.send({ status: 404, message: "Not found" })
    }
}