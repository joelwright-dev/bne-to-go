import { BackgroundImage, Select, Rating, Textarea, Text, Title, Box, Button, Overlay, Space, Stack, Card, Group } from '@mantine/core'
import { Plus } from 'tabler-icons-react'
import { useRouter } from 'next/router'
import { useForm } from '@mantine/form'
import { useState } from 'react'
import { notifications } from '@mantine/notifications'
import { useSession } from 'next-auth/react'
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
        const reviewData = await prisma.review.findUnique({
            where: {
                id: parseInt(id)
            }
        })
    
        const res = await fetch("https://www.bnefoodtrucks.com.au/api/1/trucks")
        const foodTrucks = await res.json()
    
        const foodTruck = foodTrucks.find(foodTruck => foodTruck.truck_id == reviewData.truckId)
    
        return {
            props: {
                review: reviewData,
                truckData: JSON.parse(JSON.stringify(foodTruck))
            }
        }
    } catch {
        return {
            notFound: true
        }
    }
}

export default function EditReview({ review, truckData }) {
    const [rating, setRating] = useState(review.rating)
    const router = useRouter()
    const session = useSession()
    
    const form = useForm({
        initialValues: {
            review: review.review
        },

        validate: {
            review: (value) => (value.length > 0 ? null : 'Event description is required.'),
        }
    })

    if(session.status == "authenticated") {
        if(session.data.user.id == review.attendeeId) {
            return (
                <Box maw={300} mx="auto">
                    <form onSubmit={form.onSubmit((values) => {
                        const newData = {
                            ...values,
                            rating: rating,
                            id: review.id
                        }
        
                        fetch("/api/updateReview", {
                            method: "POST",
                            body: JSON.stringify(newData)
                        }).then(response => response.json())
                        .then(data => {
                            if(data.status == 200) {
                                notifications.show({
                                    title: "Success!",
                                    message: "Your review has been updated!"
                                })
                            } else {
                                notifications.show({
                                    title: "Something went wrong!",
                                    message: "Please try again later.",
                                    color: 'red'
                                })
                            }
                        })
                    })} autoComplete="off">
                        <Stack>
                            <Textarea
                                placeholder="Review"
                                label="Review"
                                defaultValue={review.review}
                                {...form.getInputProps('review')}
                                description="A brief description of the experience you had with the food truck."
                            />
                            <Stack spacing={5}>
                                <Stack spacing={0}>
                                    <Text size="sm" weight={500}>Food Truck</Text>
                                </Stack>
                                <Card>
                                    <Text size="sm">{truckData.name}</Text>
                                </Card>
                            </Stack>
                            <Stack spacing={5}>
                                <Stack spacing={0}>
                                    <Text size="sm" weight={500}>Rating</Text>
                                    <Text size="xs" color="dimmed">Rate your experience with your selected food truck.</Text>
                                </Stack>
                                <Rating value={rating} onChange={setRating} fractions={2}/>
                            </Stack>
                            <Button type="submit">
                                Update Review
                            </Button>
                        </Stack>
                    </form>
                </Box>
            )
        }
    }

    return <ErrorPage statusCode={404}/>
}