import { PrismaClient } from "@prisma/client";
const bcrypt = require("bcrypt")

const prisma = new PrismaClient()

export default async function handle(req, res) {
    const users = await prisma.user.findMany()

    const username = users.find(user => user.username === req.body.username)
    const email = users.find(user => user.email === req.body.email)

    if(username == undefined && email == undefined) { 
        bcrypt
        .hash(req.body.password, 10)
        .then(async (hash) => {
            const user = await prisma.user.create({
                data: {
                    username: req.body.username,
                    email: req.body.email,
                    password: hash,
                    organiser: req.body.isEventOrganiser
                }
            })
            
            res.json({
                username: user.username,
                email: user.email,
                organiser: user.organiser
            })
        })
        .catch(err => {
            console.error(err.message)
            res.json({message: "SQL query failed"})
        })
    } else {
        res.json({message: "User already exists in database"})
    }
}