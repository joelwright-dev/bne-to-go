import { JsonInput } from "@mantine/core";
import prisma from "../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function handle(req, res) {
    const session = await getServerSession(req, res, authOptions)

    if(!session) {
        res.send({status: 404, message: "Not found"})
    } else {   
        const review = await prisma.review.create({
            data: {
                truckId: parseInt(req.body.trucks),
                attendeeId: req.body.attendeeId,
                review: req.body.review,
                rating: req.body.rating,
                image: req.body.image
            }
        })

        console.log(review.id)

        res.send({status: 200, message: req.body.trucks})
    }
}
