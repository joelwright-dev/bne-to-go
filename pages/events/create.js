import { TextInput, Image, SimpleGrid, PasswordInput, Progress, Popover, Rating, Box, Button, Stack, Checkbox, MultiSelect, Group, Avatar, Text, ActionIcon, Textarea, useMantineTheme } from "@mantine/core"
import { useForm } from "@mantine/form"
import { notifications } from "@mantine/notifications"
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from "next/router"
import { forwardRef, useState } from "react"
import { Star, Upload, Photo, X, Router } from "tabler-icons-react"
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE } from "@mantine/dropzone"
import ErrorPage from 'next/error'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

export async function getServerSideProps(context) {
    const res = await fetch("https://www.bnefoodtrucks.com.au/api/1/trucks")
    const foodTruckData = await res.json()

    const reviews = await prisma.review.groupBy({
        by: ['truckId'],
        _avg: {
            rating: true
        }
    })

    const foodTrucks = foodTruckData.map(foodTruck => {
        const review = reviews.find(review => review.truckId == foodTruck.truck_id)
        
        if(review) {
            return {
                ...foodTruck,
                rating: review._avg.rating
            }
        } else {
            return {
                ...foodTruck,
                rating: 0
            }
        }
    })

    return {
        props: {
            foodTrucks
        }
    }
}

export default function Create({foodTrucks}) {
    const [attendees, setAttendees] = useState([])
    const [trucks, setTrucks] = useState([])
    const [files, setFiles] = useState([])
    const [image, setImage] = useState('')
    const [imageUploaded, setImageUploaded] = useState(false)

    const session = useSession()
    const router = useRouter()

    const previews = files.map((file, index) => {
        const imageUrl = URL.createObjectURL(file);
        
        return (
            <Image
                key={index}
                src={imageUrl}
                imageProps={{ onLoad: () => URL.revokeObjectURL(imageUrl) }}
                radius={5}
            />
        );
    });
    const theme = useMantineTheme()

    const form = useForm({
        initialValues: {
            eventName: '',
            attendees: attendees,
            description: ''
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
            rating: foodTruck.rating
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
                <Rating value={rating} fractions={4} readOnly/>
            </Group>
        </div>
    ))

    if(session.status == "authenticated") {
        if(session.data.user.organiser) {
            return (
                <Box maw={300} mx="auto">
                    <form onSubmit={form.onSubmit((values) => {
                        const body = new FormData()
                        const file = files[files.length - 1]
                        body.append("file", file)
                        fetch(`/api/upload`, {
                            method: "POST",
                            body
                        })
                        .then(response => response.json())
                        .then(data => {
                            const form = {
                                ...values,
                                image: data.files.file.newFilename,
                                organiserId: session.data.user.id,
                                foodTrucks: trucks
                            }
                            const response = fetch("/api/newEvent", {
                                method: 'POST',
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify(form)
                            }).then(res => res.json())
                            .then(data => {
                                router.push(`/events/${data.message}`)
                            })
                        })
                        .catch(error => {
                            console.error(error);
                        });
                    })} autoComplete="off">
                        <Stack>
                            <TextInput
                                withAsterisk
                                label="Event name"
                                description="The display name of your event."
                                placeholder="My awesome event"
                                {...form.getInputProps('eventName')}
                                autoComplete="off"
                                type="search"
                            />
                            <Textarea
                                placeholder="Event description"
                                label="Event description"
                                {...form.getInputProps('description')}
                                description="The description attendees of your event will see."
                                withAsterisk
                            />
                            <Stack spacing={5}>
                                <Stack spacing={0}>
                                    <Text size="sm" weight={500}>Event image <span style={{color:"red"}}>*</span></Text>
                                    <Text size="xs" color="dimmed">Attach an image for your event to show attendees what your event is all about.</Text>
                                </Stack>
                                <Dropzone accept={IMAGE_MIME_TYPE} onDrop={(e) => {
                                    setFiles(e)
                                    setImageUploaded(true)
                                }}>
                                    <Text align="center">Drop image here</Text>
                                </Dropzone>
                                { imageUploaded ? 
                                    <SimpleGrid
                                        cols={4}
                                        breakpoints={[{ maxWidth: 'sm', cols: 1 }]}
                                        mt={previews.length > 0 ? 'xs' : 0}
                                    >
                                        {previews}
                                    </SimpleGrid> : <></>}
                            </Stack>
                            <MultiSelect
                                label="Food Trucks"
                                data={foodTruckData}
                                itemComponent={SelectItem}
                                value={trucks}
                                onChange={setTrucks}
                                placeholder="Book food trucks for your event"
                                searchable
                                withAsterisk
                                description="Add food trucks to your event."
                            />
                            <MultiSelect
                                label="Attendees"
                                data={attendees}
                                placeholder="Add attendees by email"
                                searchable
                                creatable
                                {...form.getInputProps('attendees')}
                                description="Add attendees to your event by email (leave blank to make your event public)."
                                getCreateLabel={(query) => `+ Add ${query}`}
                                onCreate={(query) => {
                                    const item = { value: query, label: query }
                                    setAttendees((current) => [...current, item])
                                    return item
                                }}
                            />
                            <Button type="submit">
                                Create Event
                            </Button>
                        </Stack>
                    </form>
                </Box>
            )
        }
    }

    return <ErrorPage statusCode={404}/>
}