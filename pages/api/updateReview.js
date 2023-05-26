const bcrypt = require("bcrypt")
import { getServerSession } from "next-auth/next"
import prisma from "../../lib/prisma";
import { authOptions } from "./auth/[...nextauth]";

export default async function handle(req, res) {
    const session = await getServerSession(req, res, authOptions)

    if(!session) {
        res.send({status: 404, message: "Not found"})
    } else {    
        const body = JSON.parse(req.body)
        const review = await prisma.review.update({
            where: {
                id: body.id
            },
            data: {
                review: body.review,
                rating: body.rating
            }
        }).then(() => {
            res.send({status: 200, message: "Success"})
        }).catch(() => {
            res.send({status: 500, message: "Something went wrong"})
        })
    }
}