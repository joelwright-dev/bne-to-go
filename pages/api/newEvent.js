import { JsonInput } from "@mantine/core";
import prisma from "../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function handle(req, res) {
    const session = await getServerSession(req, res, authOptions)

    if(!session) {
        res.send({status: 404, message: "Not found"})
    } else {   
        const event = await prisma.event.create({
            data: {
                title: req.body.eventName,
                organiserId: req.body.organiserId,
                image: req.body.image,
                description: req.body.description
            }
        })

        const truckData = req.body.foodTrucks.map(truck => {
            return ({
                eventId: event.id, foodTruckId: parseInt(truck)
            })
        })

        const attendeeData = req.body.attendees.map(attendee => {
            return ({
                eventId: event.id, email: attendee
            })
        })

        const trucks = await prisma.booking.createMany({
            data: truckData
        })

        if(attendeeData.length > 0) {
            const attendees = await prisma.attendee.createMany({
                data: attendeeData
            })
        }

        res.send({status: 200, message: event.id})
    }
}
