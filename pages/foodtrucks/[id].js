import { BackgroundImage, Text, Title, Box, Button, Overlay, Space, Stack, Card, Group } from '@mantine/core'
import Review from '../../components/Review'
import prisma from '../../lib/prisma'
import { Plus } from 'tabler-icons-react'
import { useRouter } from 'next/router'

export async function getStaticPaths() {
    return {
        paths: [],
        fallback: 'blocking'
    }
}

export async function getStaticProps({ params }) {
    const id = params.id

    const res = await fetch("https://www.bnefoodtrucks.com.au/api/1/trucks")
    const foodTrucks = await res.json()

    const foodTruck = foodTrucks.find(foodTruck => foodTruck.truck_id === id)

    const reviewData = await prisma.review.findMany({
        where: {
            truckId: parseInt(id)
        }
    })

    const reviews = await Promise.all(
        reviewData.map(async (review) => {
            const user = await prisma.user.findUnique({
                where: {
                    id: review.attendeeId
                }
            })

            return {
                ...review,
                username: user.username
            }
        })
    )
    
    return {
        props: {
            foodTruck,
            reviews: JSON.parse(JSON.stringify(reviews))
        }
    }
}

export default function FoodTruck({ foodTruck, reviews }) {
    const router = useRouter()
    
    return (
        <>
            <Box mx="auto">
                <BackgroundImage src={foodTruck.cover_photo.src} radius="sm">
                    <Box style={{ background: 'rgba(0,0,0,0.65)' }} p={16}>
                        <Title color="white" order={1}>
                            {foodTruck.name}
                        </Title>
                        <Space h="xl"/>
                        <Text>
                            {foodTruck.bio}
                        </Text>
                    </Box>
                </BackgroundImage>
            </Box>
            <Title order={2} mt="xs">Reviews</Title>
            <Stack mt="xs">
                {reviews.length > 0 ? (
                    reviews.map((review) => {
                        return (
                            <Review name={review.username} review={review.review} rating={review.rating} image={`/upload/${review.image}`}/>
                        )
                    })
                ) : (
                    <Card>
                        <Stack align="center">
                            <Text>No reviews yet!</Text>
                            <Button leftIcon={<Plus size="1rem"/>} onClick={() => router.push("/reviews/create")}>Be the first to review {foodTruck.name}</Button>
                        </Stack>
                    </Card>
                )}
            </Stack>
        </>
    )
}