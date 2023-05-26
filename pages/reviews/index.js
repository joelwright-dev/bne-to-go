import Foodtruck from "../../components/Foodtruck"
import { Grid, Stack, Card, Text, Title, Button, Group } from "@mantine/core"
import Review from "../../components/Review"
import { Plus } from 'tabler-icons-react'
import { useRouter } from "next/router"
import prisma from "../../lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]"
import { useSession } from "next-auth/react"
import ErrorPage from "next/error"

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

export async function getServerSideProps(context) {
    const session = await getServerSession(context.req, context.res, authOptions)

    if(session) {
        const reviews = await prisma.review.findMany({
            where: {
                attendeeId: session.user.id
            }
        })
    
        const user = await prisma.user.findUnique({
            where: {
                id: session.user.id
            }
        })
    
        const reviewData = reviews.map((review) => {
            return({
                ...review,
                username: user.username
            })
        })

        return {
            props: {
                reviews: reviewData
            }
        }
    } else {
        return {
            notFound: true
        }
    }
}

export default function Home({ reviews }) {
    const router = useRouter()
    const session = useSession()

    if(session.status == "authenticated") {
        if(!session.data.user.organiser) {
            return (
                <>
                    <Group nowrap position="apart">
                        <Title>Your Reviews</Title>
                        <Button leftIcon={<Plus size="1rem"/>} onClick={() => router.push('reviews/create')}>Create Review</Button>
                    </Group>
                    <Stack mt="xs">
                        {reviews.map(review => {
                            return (
                                <Review name={review.username} review={review.review} rating={review.rating} image={`/upload/${review.image}`} editable id={review.id}/>
                            )
                        })}
                    </Stack>
                </>
            )
        } else {
            return <ErrorPage statusCode={404}/>
        }
    } else {
        return <ErrorPage statusCode={404}/>
    }
}