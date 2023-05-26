const bcrypt = require("bcrypt")
import { getSession } from "next-auth/react"
import prisma from "../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function handle(req, res) {
    const session = await getServerSession(req, res, authOptions)

    if(!session) {
        res.send({status: 404, message: "Not found"})
    } else {   
        console.log('hello')
        const body = req.body

        console.log(body)

        const event = await prisma.event.update({
            where: {
                id: body.id
            },
            data: {
                title: body.eventName,
                description: body.description,
            }
        })

        const deletedTrucks = await prisma.booking.deleteMany({
            where: {
                eventId: body.id
            }
        })

        const deletedAttendees = await prisma.attendee.deleteMany({
            where: {
                eventId: body.id
            }
        })

        const truckData = body.foodTrucks.map(truck => {
            return ({
                eventId: body.id, foodTruckId: parseInt(truck)
            })
        })

        const attendeeData = req.body.attendees.map(attendee => {
            return ({
                eventId: body.id, email: attendee
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