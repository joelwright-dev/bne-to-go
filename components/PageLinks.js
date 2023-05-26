import React from 'react';
import { Wallet, Exchange, Apps, Download, Home, AlertCircle, Messages, TruckDelivery, Star, UserCheck, UserPlus, UserX, User, BuildingCarousel } from 'tabler-icons-react';
import { ThemeIcon, UnstyledButton, Group, Text } from '@mantine/core';
import Link from 'next/link'
import { useSession, signOut, signIn } from 'next-auth/react';

function MainLink({ icon, color, label, href }) {
    const css = `
    a {
        color: inherit; /* blue colors for links too */
        text-decoration: inherit; /* no underline */
        }`

    return (
        <>
            <style>
                {css}
            </style>
            <Link href={`/${href}`} passHref>
                <UnstyledButton
                sx={(theme) => ({
                    display: 'block',
                    width: '100%',
                    padding: theme.spacing.xs,
                    borderRadius: theme.radius.sm,
                    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

                    '&:hover': {
                    backgroundColor:
                        theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
                    },
                })}
                >
                <Group>
                    <ThemeIcon color={color} variant="light">
                    {icon}
                    </ThemeIcon>

                    <Text size="sm">{label}</Text>
                </Group>
                </UnstyledButton>
            </Link>
        </>
    );
}

const AttendeePagedata = [
    { icon: <Home size={16} />, color: 'blue', label: 'Home', href: '/' },
    { icon: <Star size={16} />, color: 'green', label: 'Reviews', href: 'reviews' },
    { icon: <TruckDelivery size={16} />, color: 'teal', label: 'Food Trucks', href: 'foodtrucks' },
    { icon: <User size={16} />, color: 'violet', label: 'Your Profile', href: 'profile' },
];

const UnauthenticatedPagedata = [
    { icon: <Home size={16} />, color: 'blue', label: 'Home', href: '/' },
    { icon: <TruckDelivery size={16} />, color: 'teal', label: 'Food Trucks', href: 'foodtrucks' },
];

const OrganiserPagedata = [
    { icon: <Home size={16} />, color: 'blue', label: 'Home', href: '/' },
    { icon: <BuildingCarousel size={16} />, color: 'green', label: 'Create Event', href: 'events/create' },
    { icon: <TruckDelivery size={16} />, color: 'teal', label: 'Food Trucks', href: 'foodtrucks' },
    { icon: <User size={16} />, color: 'violet', label: 'Your Profile', href: 'profile' },
];

const Authdata = [
    { icon: <UserCheck size={16} />, color: 'blue', label: 'Login', href: 'login' },
    { icon: <UserPlus size={16} />, color: 'teal', label: 'Sign up', href: 'signup' },
];

const Deauthdata = [
    { icon: <UserX size={16} />, color: 'blue', label: 'Logout', href: '' },
];

export function PageLinks() {
    const session = useSession()

    if(session.status == "authenticated") {
        if(session.data.user.organiser) {
            const links = OrganiserPagedata.map((link) => <MainLink {...link} key={link.label} />);
            return <div>{links}</div>;
        } else {   
            const links = AttendeePagedata.map((link) => <MainLink {...link} key={link.label} />);
            return <div>{links}</div>;
        }
    } else {
        const links = UnauthenticatedPagedata.map((link) => <MainLink {...link} key={link.label} />);
        return <div>{links}</div>;
    }
}

export function AuthLinks() {
    const session = useSession()
    
    if (session.status == "authenticated") {
        const css = `
        a {
            color: inherit; /* blue colors for links too */
            text-decoration: inherit; /* no underline */
            }`
        return <div>
            <style>
                {css}
            </style>
                <UnstyledButton
                sx={(theme) => ({
                    display: 'block',
                    width: '100%',
                    padding: theme.spacing.xs,
                    borderRadius: theme.radius.sm,
                    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

                    '&:hover': {
                    backgroundColor:
                        theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
                    },
                })}
                onClick={() => signOut()}
                >
                <Group>
                    <ThemeIcon color="red" variant="light">
                        <UserX size={16}/>
                    </ThemeIcon>

                    <Text size="sm">Logout</Text>
                </Group>
                </UnstyledButton>
        </div>;
    } else {
        const links = Authdata.map((link) => <MainLink {...link} key={link.label} />);
        return <div>{links}</div>;
    }
}