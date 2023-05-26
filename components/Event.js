import { Card, Image, ActionIcon, Grid, Text, Badge, Button, Group } from '@mantine/core'
import { useRouter } from 'next/router'
import { Edit } from 'tabler-icons-react'

export default function Event({image, title, id, description, editable}) {
    const router = useRouter()
    
    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section>
                <Image
                    src={image}
                    height={160}
                    alt="Norway"
                />
            </Card.Section>
            <Group position="apart" mt="md" mb="xs">
                <Text weight={500}>{title}</Text>
            </Group>

            <Text size="sm" color="dimmed" lineClamp={2}>
                {description}
            </Text>

            {editable ? (
                <Group mt="md" grow>
                    <Button variant="light" color="blue" radius="md" onClick={() => router.push(`/events/${id}`)}>
                        View Details
                    </Button>
                    <ActionIcon variant="light" color="blue" radius="md" h={35} w={35} onClick={() => router.push(`/events/edit/${id}`)}>
                        <Edit size="1.125rem"/>
                    </ActionIcon>
                </Group>
            ) : (
                <Button variant="light" color="blue" radius="md" fullWidth mt="md" onClick={() => router.push(`/events/${id}`)}>
                    View Details
                </Button>
            )}
        </Card>
    )
}