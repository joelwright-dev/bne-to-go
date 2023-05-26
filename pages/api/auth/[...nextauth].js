import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
const bcrypt = require("bcrypt")

const prisma = new PrismaClient()

export const authOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: "Username", type: "text", placeholder: "Username123"},
                password: { label: "Password", type: "password"}
            },
            async authorize(credentials) {
                const {username, password} = credentials ?? {}

                if (!username || !password) {
                    throw new Error("Missing username or password")
                }

                const user = await prisma.user.findUnique({
                    where: {
                        username: username.toString()
                    }
                })

                if(!username || !(await bcrypt.compare(password, user.password))) { 
                    throw new Error("Invalid username or password")
                } else {
                    return user
                }
            }
        })
    ],
    callbacks: {
        async jwt({token, user, account, profile, isNewUser}) {
            if(user) {
                token.username = user.username
                token.email = user.email
                token.organiser = user.organiser
                token.id = user.id
            }

            return token
        },

        async session({session,token,user}) {
            session.user.username = token.username
            session.user.email = token.email
            session.user.organiser = token.organiser
            session.user.id = token.id

            return session
        }
    },
    pages: {
        signIn: "/login"
    }
}

export default NextAuth(authOptions)