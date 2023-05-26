import { TextInput, PasswordInput, Progress, Text, Popover, Box, Button, Stack, Checkbox } from "@mantine/core"
import { useForm } from "@mantine/form"
import { notifications } from "@mantine/notifications"
import { X, Check } from 'tabler-icons-react'
import { useState } from "react";
import { useRouter } from "next/router";

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

export default function Signup({}) {
    const [popoverOpened, setPopoverOpened] = useState(false);
    const [value, setValue] = useState('')
    const router = useRouter()

    const form = useForm({
        initialValues: {
            username: '',
            email: '',
            password: value,
            confirmPassword: '',
            isEventOrganiser: false
        },
        validate: {
            username: (value) => (value.length > 0 ? null : 'Username must be at least 1 character long'),
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
            password: (value) => (getStrength(value) === 100 ? null : 'Invalid password'),
            confirmPassword: (value) => (form.values['password'] == value ? null : 'Passwords do not match')
        }
    })

    const checks = requirements.map((requirement, index) => (
        <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(form.values['password'])} />
    ));

    const strength = getStrength(form.values['password']);
    const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';

    return (
        <Box maw={300} mx="auto">
            <form onSubmit={form.onSubmit(async (values) => {
                const response = await fetch("/api/signup", {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(values)
                })

                const user = await response.json()
                if(!user.hasOwnProperty('message')) {
                    router.push("login")
                } else {
                    notifications.show({
                        title: "Something went wrong!",
                        color: 'red',
                        message: user.message
                    })
                }
            })} autoComplete="off">
                <Stack>
                    <TextInput
                        withAsterisk
                        label="Username"
                        description="Your display username for when you review food trucks."
                        placeholder="Username123"
                        {...form.getInputProps('username')}
                        autoComplete="off"
                        type="search"
                    />
                    <TextInput
                        withAsterisk
                        label="Email"
                        description="Your email address so that event organisers can add you to their events."
                        placeholder="your@email.com"
                        {...form.getInputProps('email')}
                        autoComplete="off"
                        type="search"
                    />
                    <Popover opened={popoverOpened} position="bottom" width="target" transitionProps={{ transition: 'pop' }}>
                        <Popover.Target>
                            <div
                                onFocusCapture={() => setPopoverOpened(true)}
                                onBlurCapture={() => setPopoverOpened(false)}
                            >
                                <PasswordInput
                                    withAsterisk
                                    label="Password"
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
                        withAsterisk
                        label="Confirm Password"
                        description="Confirm your password."
                        placeholder="Password123!"
                        {...form.getInputProps('confirmPassword')}
                        autoComplete="off"
                    />
                    <Checkbox
                        label="I am an event organiser"
                        {...form.getInputProps('isEventOrganiser')}
                    />
                    <Button type="submit">
                        Sign Up
                    </Button>
                </Stack>
            </form>
        </Box>
    )
}