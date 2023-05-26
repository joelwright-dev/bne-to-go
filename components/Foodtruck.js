import { Card, Image, Rating, Text, Badge, Button, Group } from '@mantine/core'
import { useRouter } from 'next/router'

export default function Foodtruck({image, title, id, description, rating, category}) {
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
            <Group position="apart" mt="md">
                <Text weight={500} truncate>{title}</Text>
                <Rating value={rating} fractions={4} readOnly/>
            </Group>

            <Text size="xs" mb="xs" color="dimmed" lineClamp={2}>
                {category}
            </Text>

            <Text size="sm" color="dimmed" lineClamp={2}>
                {description}
            </Text>

            <Button variant="light" color="blue" fullWidth mt="md" radius="md" onClick={() => router.push(`/foodtrucks/${id}`)}>
                View Details
            </Button>
        </Card>
    )
}