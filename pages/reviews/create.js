import { TextInput, Image, SimpleGrid, Select, PasswordInput, Progress, Popover, Rating, Box, Button, Stack, Checkbox, MultiSelect, Group, Avatar, Text, ActionIcon, Textarea, useMantineTheme } from "@mantine/core"
import { useForm } from "@mantine/form"
import { notifications } from "@mantine/notifications"
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from "next/router"
import { forwardRef, useState } from "react"
import { Star, Upload, Photo, X, Router } from "tabler-icons-react"
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE } from "@mantine/dropzone"
import ErrorPage from "next/error"

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

export async function getServerSideProps(context) {
    const res = await fetch("https://www.bnefoodtrucks.com.au/api/1/trucks")
    const foodTrucks = await res.json()

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
    const [rating, setRating] = useState()
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
            review: ''
        },

        validate: {
            review: (value) => (value.length > 0 ? null : 'Event description is required.'),
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
                <div>
                    <Text size="sm" truncate>{label}</Text>
                    <Text size="xs" truncate>{category}</Text>
                </div>
            </Group>
        </div>
    ))

    if(session.status == "authenticated") {
        if(!session.data.user.organiser) {
            return (
                <Box maw={300} mx="auto">
                    <form onSubmit={form.onSubmit((values) => {
                        const body = new FormData()
                        const file = files[files.length - 1]
                        body.append("file", file)
                        console.log(body)
                        fetch(`/api/upload`, {
                            method: "POST",
                            body
                        })
                        .then(response => response.json())
                        .then(data => {
                            const form = {
                                ...values,
                                rating,
                                trucks,
                                image: data.files.file.newFilename,
                                attendeeId: session.data.user.id,
                            }
                            const response = fetch("/api/newReview", {
                                method: 'POST',
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify(form)
                            }).then(res => res.json())
                            .then(data => {
                                router.push(`/foodtrucks/${data.message}`)
                            })
                        })
                        .catch(error => {
                            console.error(error);
                        });
                    })} autoComplete="off">
                        <Stack>
                            <Textarea
                                placeholder="Review"
                                label="Review"
                                {...form.getInputProps('review')}
                                description="A brief description of the experience you had with the food truck."
                                withAsterisk
                            />
                            <Stack spacing={5}>
                                <Stack spacing={0}>
                                    <Text size="sm" weight={500}>Image <span style={{color:"red"}}>*</span></Text>
                                    <Text size="xs" color="dimmed">Attach an image to show people what your experience was like.</Text>
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
                            <Select
                                label="Food Truck"
                                data={foodTruckData}
                                itemComponent={SelectItem}
                                value={trucks}
                                onChange={setTrucks}
                                placeholder="Add a food truck"
                                searchable
                                withAsterisk
                                description="The food truck you are reviewing."
                            />
                            <Stack spacing={5}>
                                <Stack spacing={0}>
                                    <Text size="sm" weight={500}>Rating <span style={{color:"red"}}>*</span></Text>
                                    <Text size="xs" color="dimmed">Rate your experience with your selected food truck.</Text>
                                </Stack>
                                <Rating value={rating} onChange={setRating} fractions={2}/>
                            </Stack>
                            <Button type="submit">
                                Create Review
                            </Button>
                        </Stack>
                    </form>
                </Box>
            )
        } else {
            return <ErrorPage statusCode={404}/>
        }
    } else {
        return <ErrorPage statusCode={404}/>
    }
}