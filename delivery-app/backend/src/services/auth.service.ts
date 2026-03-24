import { prisma } from '../utils/connect'
import { hash, compare } from 'bcrypt'
import {
    DeleteUserInput,
    EditUserInput,
    SignInInput,
    SignUpInput,
} from '../utils/types'
import { signJWT } from '../utils/jwtUtils'

export const signUpService = async (data: SignUpInput['body']) => {
    try {
        const { email, first_name, last_name, password } = data
        const candidateHash = await hash(password, 10)

        const user = await prisma.users.create({
            data: {
                email,
                first_name,
                last_name,
                password_hash: candidateHash,
                type: 'user',
            },
        })

        const token = signJWT({ ...user })
        return { user, token }
    } catch (e) {
        throw e
    }
}

export const signInService = async (data: SignInInput['body']) => {
    try {
        const { email, password } = data

        const user = await prisma.users.findMany({
            where: {
                email: email,
            },
        })
        if (!user || user?.length == 0) {
            throw new Error('User not found')
        }
        const isPasswordValid = compare(
            password,
            user?.[0]?.password_hash || ''
        )
        if (!isPasswordValid) {
            throw new Error('Invalid password')
        }
        return user
    } catch (error) {
        throw error
    }
}

export const editUserService = async (data: EditUserInput['body']) => {
    try {
        const { id, email, first_name, last_name, password } = data
        const candidateHash = await hash(password, 10)

        const user = await prisma.users.update({
            where: {
                id: id,
            },
            data: {
                email,
                first_name,
                last_name,
                password_hash: candidateHash,
            },
        })
        return user
    } catch (e) {
        throw e
    }
}

export const deleteUserService = async (data: DeleteUserInput['params']) => {
    try {
        const { id } = data
        const user = await prisma.users.delete({
            where: {
                id: id,
            },
        })
        return user
    } catch (e) {
        throw e
    }
}
