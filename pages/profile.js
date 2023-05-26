import { TextInput, Image, Title, SimpleGrid, PasswordInput, Progress, Popover, Rating, Box, Button, Stack, Checkbox, MultiSelect, Group, Avatar, Text, ActionIcon, Textarea, useMantineTheme } from "@mantine/core"
import { useForm } from "@mantine/form"
import { notifications } from "@mantine/notifications"
import { forwardRef, useEffect, useState } from "react"
import { Star, Upload, Photo, X, Router } from "tabler-icons-react"
import { Check } from 'tabler-icons-react'
import { signIn, useSession } from 'next-auth/react'
import ErrorPage from 'next/error'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

function PasswordRequirement({ meets, label, prisma }) {
    return (
        <Text
        color={meets ? 'teal' : 'red'}
        sx={{ display: 'flex', alignItems: 'center' }}
        mt={7}
        size="sm"
        >
        {meets ? <Check size="0.9rem" /> : <X size="0.9rem" />} <Box ml={10}>{label}</Box>
        </Text>
    );
}

const requirements = [
    { re: /[0-9]/, label: 'Includes number' },
    { re: /[a-z]/, label: 'Includes lowercase letter' },
    { re: /[A-Z]/, label: 'Includes uppercase letter' },
    { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
];

function getStrength(password) {
    let multiplier = password.length > 5 ? 0 : 1;

    requirements.forEach((requirement) => {
        if (!requirement.re.test(password)) {
        multiplier += 1;
        }
    });

    return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
}

export default function Profile() {
    const session = useSession()
    const [value, setValue] = useState('')
    const [username, setUsername] = useState('')
    const [popoverOpened, setPopoverOpened] = useState(false)

    const form = useForm({
        initialValues: {
            username: username,
            password: value,
            confirmPassword: '',
            currentPassword: ''
        },

        validate: {
            password: (value) => (value.length > 0 ? getStrength(value) === 100 ? null : 'Invalid password' : null),
            confirmPassword: (value) => (form.values['password'] == value ? null : 'Passwords do not match')
        }
    })

    const checks = requirements.map((requirement, index) => (
        <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(form.values['password'])} />
    ));

    const strength = getStrength(form.values['password']);
    const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';

    useEffect(() => {
        if(session.status == "authenticated") {
            setUsername(session.data.user.username)
        }
    }, [username])

    if(session.status == "authenticated") {       
        return (
            <Box maw={300} mx="auto">
                <form onSubmit={form.onSubmit((values) => {
                    const newValues = {
                        ...values,
                        id: session.data.user.id
                    }

                    fetch("/api/checkPassword", {
                        method: "POST",
                        body: JSON.stringify(newValues)
                    }).then(response => response.json())
                    .then(data => {
                        if(data.status == 200) {
                            notifications.show({
                                title: "Success!",
                                message: "Your details have been updated!"
                            })
                        } else if(data.message == "Incorrect password") {
                            notifications.show({
                                title: "Something went wrong!",
                                message: "Incorrect password.",
                                color: 'red'
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
                        <TextInput
                            label="Username"
                            description="Your display username for when you review food trucks."
                            placeholder="Username123"
                            {...form.getInputProps('username')}
                            autoComplete="off"
                            onFocus={(event) => {
                                event.target.setAttribute('autocomplete', 'off')
                            }}
                            type="search"
                        />
                        <Popover opened={popoverOpened} position="bottom" width="target" transitionProps={{ transition: 'pop' }}>
                            <Popover.Target>
                                <div
                                    onFocusCapture={() => setPopoverOpened(true)}
                                    onBlurCapture={() => setPopoverOpened(false)}
                                >
                                    <PasswordInput
                                        label="New Password"
                                        description="A secure password."
                                        placeholder="Password123!"
                                        {...form.getInputProps('password')}
                                        autoComplete="off"
                                    />
                                </div>
                            </Popover.Target>
                            <Popover.Dropdown>
                                <Progress color={color} value={strength} size={5} mb="xs" />
                                <PasswordRequirement label="Includes at least 6 characters" meets={form.values['password'].length > 5} />
                                {checks}
                            </Popover.Dropdown>
                        </Popover>
                        <PasswordInput
                            label="Confirm New Password"
                            description="Confirm your new password."
                            placeholder="Password123!"
                            {...form.getInputProps('confirmPassword')}
                            autoComplete="off"
                        />
                        <PasswordInput
                            label="Current Password"
                            description="Enter your password."
                            placeholder="Password123!"
                            {...form.getInputProps('currentPassword')}
                            autoComplete="off"
                        />
                        <Button type="submit">
                            Update Details
                        </Button>
                    </Stack>
                </form>
            </Box>
        )
    }

    return <ErrorPage statusCode={404}/>
}