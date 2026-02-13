import { env } from 'process'
import { sign, verify } from 'jsonwebtoken'
import * as dotenv from 'dotenv'

dotenv.config()

const signJWT = (payload: any) => {
    return sign(payload, process.env.JWT_KEY as string, {
        expiresIn: '24h',
    })
}

const verifyJWT = (token: string) => {
    return verify(token, process.env.JWT_KEY as string)
}

const signRefreshJWT = (payload: any) => {
    return sign(payload, process.env.JWT_KEY as string, { expiresIn: '7d' })
}

const verifyRefreshJWT = (token: string) => {
    return verify(token, process.env.JWT_KEY as string)
}

export { verifyJWT, signJWT, signRefreshJWT, verifyRefreshJWT }
