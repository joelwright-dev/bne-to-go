import { Title, Grid } from "@mantine/core";
import { useSession } from "next-auth/react"
import { getServerSession } from "next-auth/next"
import prisma from "../../lib/prisma";
import Event from "../../components/Event";
import { authOptions } from "../api/auth/[...nextauth]";

export async function getServerSideProps(context) {
    const session = await getServerSession(context.req, context.res, authOptions)

    if(session) {
        if(session.user.organiser) {
            const events = await prisma.event.findMany({
                where: {
                    organiserId: session.user.id
                }
            })

            return {
                props: {
                    privateEvents: JSON.parse(JSON.stringify(events)),
                    editable: true
                }
            }
        } else {
            const privateEvents = await prisma.event.findMany({
                where: {
                    Attendees: {
                        some: {
                            email: session.user.email
                        }
                    }
                }
            })

            const publicEvents = await prisma.event.findMany({
                where: {
                    Attendees: {
                        none: {}
                    }
                }
            })

            return {
                props: {
                    publicEvents: JSON.parse(JSON.stringify(publicEvents)),
                    privateEvents: JSON.parse(JSON.stringify(privateEvents)),
                    editable: false
                }
            }
        }
    } else {
        const events = await prisma.event.findMany({
            where: {
                Attendees: {
                    none: {}
                }
            }
        })

        return {
            props: {
                publicEvents: JSON.parse(JSON.stringify(events)),
                editable: false
            }
        }
    }
}

export default function Home({publicEvents, privateEvents, editable}) {
    const session = useSession()

    return (
        <>
            <Title>{session.status == "authenticated" ? "Your Events" : "Public Events"}</Title>
            {privateEvents ? (
                <Grid mt={5}>
                    {privateEvents.map(event => {
                        return (
                            <Grid.Col md={6} sm={12} key={event.id}>
                                <Event id={event.id} image={`/upload/${event.image}`} title={event.title} description={event.description} editable={editable}/>
                            </Grid.Col>
                        )
                    })}
                </Grid>
            ) : (
                <></>
            )}
            
            {publicEvents ? (
                <>
                    {session.status == "authenticated" ? <Title mt={10}>Public Events</Title> : <></>}
                    <Grid mt={5}>
                        {publicEvents.map(event => {
                            return (
                                <Grid.Col md={6} sm={12} key={event.id}>
                                    <Event id={event.id} image={`/upload/${event.image}`} title={event.title} description={event.description}/>
                                </Grid.Col>
                            )
                        })}
                    </Grid>
                </>
            ) : (
                <></>
            )}
        </>
    )
}