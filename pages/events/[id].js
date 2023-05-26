import { BackgroundImage, Grid, Text, Title, Box, Overlay, Space, Stack } from '@mantine/core'
import Review from '../../components/Review'
import Foodtruck from '../../components/Foodtruck'
import prisma from '../../lib/prisma'
import { useSession } from "next-auth/react"
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
        const event = await prisma.event.findUnique({
            where: {
                id: parseInt(id)
            }
        })
    
        const trucks = await prisma.booking.findMany({
            where: {
                eventId: event.id
            }
        })
        
        const res = await fetch("https://www.bnefoodtrucks.com.au/api/1/trucks")
        const foodTrucks = await res.json()
    
        const reviews = await prisma.review.groupBy({
            by: ['truckId'],
            _avg: {
                rating: true
            }
        })
    
        const attendees = await prisma.attendee.findMany({
            where: {
                eventId: event.id
            }
        })
    
        const truckData = trucks.map((truck) => {
            const foodTruck = foodTrucks.find(foodTruck => foodTruck.truck_id == truck.foodTruckId)
    
            return ({ 
                id: foodTruck.truck_id,
                name: foodTruck.name,
                image: foodTruck.cover_photo.src,
                description: foodTruck.bio,
                rating: reviews.find((review) => review.truckId == foodTruck.truck_id)
            })
        })
    
        return {
            props: {
                event: JSON.parse(JSON.stringify(event)),
                attendees: JSON.parse(JSON.stringify(attendees)),
                trucks: JSON.parse(JSON.stringify(truckData))
            }
        }
    } catch {
        return {
            notFound: true
        }
    }
}

export default function Event({ event, trucks, attendees }) {
    const session = useSession()

    if(attendees.length > 0) {
        if(session.status == "authenticated") {
            if(attendees.map(attendee => {return attendee.email}).includes(session.data.user.email) || session.data.user.id == event.organiserId) {
                return (
                    <>
                        <BackgroundImage src={`/upload/${event.image}`} radius="md">
                            <Stack style={{ background: 'rgba(0,0,0,0.65)' }} p={16} h={200} justify="space-between">
                                <Title color="white" order={1}>
                                    {event.title}
                                </Title>
                                <Text>
                                    {event.description}
                                </Text>
                            </Stack>
                        </BackgroundImage>
                        <Title order={2} mt="xs">Food Trucks</Title>
                        <Grid mt={5}>
                            {trucks.map(truck => {
                                return (
                                    <Grid.Col span={6}>
                                        <Foodtruck key={truck.id} rating={truck.rating ? truck.rating._avg.rating : 0} id={truck.id} title={truck.name} description={truck.description} image={truck.image}/>
                                    </Grid.Col>
                                )
                            })}
                        </Grid>
                    </>
                )
            }
        }
    } else {
        return (
            <>
                <BackgroundImage src={`/upload/${event.image}`} radius="md">
                    <Stack style={{ background: 'rgba(0,0,0,0.65)' }} p={16} h={200} justify="space-between">
                        <Title color="white" order={1}>
                            {event.title}
                        </Title>
                        <Text>
                            {event.description}
                        </Text>
                    </Stack>
                </BackgroundImage>
                <Title order={2} mt="xs">Food Trucks</Title>
                <Grid mt={5}>
                    {trucks.map(truck => {
                        return (
                            <Grid.Col span={6}>
                                <Foodtruck key={truck.id} rating={truck.rating ? truck.rating._avg.rating : 0} id={truck.id} title={truck.name} description={truck.description} image={truck.image}/>
                            </Grid.Col>
                        )
                    })}
                </Grid>
            </>
        )
    }

    return <ErrorPage statusCode={404}/>
}