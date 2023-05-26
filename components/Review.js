import { Card, Group, Image, Text, Title, Badge, Stack, Rating, ActionIcon } from '@mantine/core'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { Edit } from 'tabler-icons-react'

export default function Review({ name, review, rating, image, editable, id }) {
    const router = useRouter()
    
    return (
        <>
            <Card shadow="sm" padding={0} radius="md" withBorder>
                <Group noWrap mr={editable ? 20 : 0}>
                    <Image
                        src={image}
                        height={100}
                        width={100}
                        alt="Norway"
                    />
                    <Stack spacing={6} pr="xs">
                        <Text weight={500}>{name}</Text>
                        <Text size="sm" color="dimmed" lineClamp={1}>
                            {review}
                        </Text>
                        <Rating
                            value={rating}
                            fractions={4}
                            readOnly
                        />
                    </Stack>
                    {editable ? (
                        <ActionIcon variant="light" color="orange" onClick={() => {router.push(`reviews/edit/${id}`)}}>
                            <Edit size="1.125rem"/>
                        </ActionIcon>
                    ) : (
                        <></>
                    )}
                </Group>
            </Card>
        </>
    )
}