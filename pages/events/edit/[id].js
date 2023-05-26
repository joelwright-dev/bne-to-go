import { TextInput, Image, SimpleGrid, PasswordInput, Progress, Popover, Rating, Box, Button, Stack, Checkbox, MultiSelect, Group, Avatar, Text, ActionIcon, Textarea, useMantineTheme } from "@mantine/core"
import { useForm } from "@mantine/form"
import { notifications } from "@mantine/notifications"
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from "next/router"
import { forwardRef, useState } from "react"
import { Star, Upload, Photo, X, Router } from "tabler-icons-react"
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE } from "@mantine/dropzone"
import prisma from "../../../lib/prisma"
import ErrorPage from 'next/error'

export async function getStaticPaths() {
    return {
        paths: [],
        fallback: 'blocking'
    }
}

export async function getStaticProps({ params }) {
    const id = params.id

    try {
        const eventData = await prisma.event.findUnique({
            where: {
                id: parseInt(id)
            }
        })
    
        const res = await fetch("https://www.bnefoodtrucks.com.au/api/1/trucks")
        const foodTrucks = await res.json()
    
        const bookedTrucks = await prisma.booking.findMany({
            where: {
                eventId: parseInt(id)
            }
        })
    
        const selectedTrucks = bookedTrucks.map(truck => {
            return truck.foodTruckId.toString()
        })
    
        const attendees = await prisma.attendee.findMany({
            where: {
                eventId: parseInt(id)
            }
        })
    
        const selectedAttendees = attendees.map(attendee => {
            return attendee.email
        })
    
        const allAttendees = attendees.map(attendee => {
            return { label: attendee.email, value: attendee.email }
        })
    
        return {
            props: {
                event: JSON.parse(JSON.stringify(eventData)),
                foodTrucks,
                selectedTrucks,
                selectedAttendees,
                allAttendees
            }
        }
    } catch {
        return {
            notFound: true
        }
    }
}

export default function EditEvent({event, foodTrucks, selectedTrucks, selectedAttendees, allAttendees}) {
    const [attendees, setAttendees] = useState(selectedAttendees)
    const [trucks, setTrucks] = useState(selectedTrucks)
    const [files, setFiles] = useState([])

    const session = useSession()
    const router = useRouter()

    console.log(event)

    const form = useForm({
        initialValues: {
            eventName: event.title,
            description: event.description
        },

        validate: {
            eventName: (value) => (value.length > 0 ? null : 'Event name is required.'),
            description: (value) => (value.length > 0 ? null : 'Event description is required.'),
        }
    })

    const foodTruckData = foodTrucks.map(foodTruck => {
        return { 
            value: foodTruck.truck_id,
            label: foodTruck.name,
            image: foodTruck.avatar.src, 
            category: foodTruck.category,
            rating: 5
        }
    })
    
    const SelectItem = forwardRef(({image, label, category, rating, ...others}, ref)  => (
        <div ref={ref} {...others}>
            <Group noWrap>
                <Avatar src={image} style={{maxWidth: "20px"}}/>
                <div style={{width: "95px"}}>
                    <Text size="sm" truncate>{label}</Text>
                    <Text size="xs" truncate>{category}</Text>
                </div>
                <Rating value={rating} readOnly/>
            </Group>
        </div>
    ))

    if(session.status == "authenticated") {
        if(session.data.user.id == event.organiserId) {
            return (
                <Box maw={300} mx="auto">
                    <form onSubmit={form.onSubmit((values) => {
                        console.log(values)
                        const form = {
                            ...values,
                            organiserId: session.data.user.id,
                            foodTrucks: trucks,
                            attendees: attendees,
                            id: event.id
                        }
                        console.log(form)
                        const response = fetch("/api/updateEvent", {
                            method: 'POST',
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(form)
                        })
                        .then(res => res.json())
                        .then(data => {
                            router.push(`/events/${data.message}`)
                        })
                    })} autoComplete="off">
                        <Stack>
                            <TextInput
                                withAsterisk
                                label="Event name"
                                defaultValue={event.title}
                                description="The display name of your event."
                                placeholder="My awesome event"
                                {...form.getInputProps('eventName')}
                                autoComplete="off"
                                type="search"
                            />
                            <Textarea
                                placeholder="Event description"
                                label="Event description"
                                defaultValue={event.description}
                                {...form.getInputProps('description')}
                                description="The description attendees of your event will see."
                                withAsterisk
                            />
                            <MultiSelect
                                label="Food Trucks"
                                data={foodTruckData}
                                value={trucks}
                                onChange={setTrucks}
                                defaultValue={selectedTrucks}
                                itemComponent={SelectItem}
                                placeholder="Book food trucks for your event"
                                searchable
                                withAsterisk
                                description="Add food trucks to your event."
                            />
                            <MultiSelect
                                label="Attendees"
                                data={allAttendees}
                                defaultValue={selectedAttendees}
                                placeholder="Add attendees by email"
                                searchable
                                creatable
                                description="Add attendees to your event by email (leave blank to make your event public)."
                                getCreateLabel={(query) => `+ Add ${query}`}
                                onCreate={(query) => {
                                    const item = query
                                    setAttendees([...attendees, item])
                                    return item
                                }}
                            />
                            <Button type="submit">
                                Update Event
                            </Button>
                        </Stack>
                    </form>
                </Box>
            )
        }
    }

    return <ErrorPage statusCode={404}/>
}