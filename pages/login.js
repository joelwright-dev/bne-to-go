import { TextInput, PasswordInput, Progress, Text, Popover, Box, Button, Stack, Checkbox } from "@mantine/core"
import { useForm } from "@mantine/form"
import { notifications } from "@mantine/notifications"
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from "next/router"

export default function Login({ csrfToken }) {
    const { data: session } = useSession()
    const router = useRouter()

    if(session) {
        router.push('/')
    }

    return (
        <Box maw={300} mx="auto">
            <form onSubmit={(e) => {
                e.preventDefault()
                signIn("credentials", {
                    redirect: false,
                    username: e.currentTarget.username.value,
                    password: e.currentTarget.password.value
                }).then(({ error }) => {
                    if(error) {
                        if(error == "Invalid username or password") {
                            notifications.show({
                                title: "Something went wrong!",
                                color: 'red',
                                message: error
                            })
                        } else {
                            notifications.show({
                                title: "Something went wrong!",
                                color: 'red',
                                message: "Please try again later"
                            })
                        }
                    } else {
                        router.push("/events")
                    }
                })
            }} autoComplete="off">
                <Stack>
                    <TextInput
                        withAsterisk
                        label="Username"
                        name="username"
                        description="The username you signed up with."
                        placeholder="Username123"
                        autoComplete="off"
                        type="search"
                    />
                    <PasswordInput
                        withAsterisk
                        label="Password"
                        description="Your secure password."
                        placeholder="Password123!"
                        name="password"
                        autoComplete="off"
                    />
                    <Button type="submit">
                        Log In
                    </Button>
                </Stack>
            </form>
        </Box>
    )
}