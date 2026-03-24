import express from 'express'
import { env } from 'process'
import * as dotenv from 'dotenv'
import { router } from './routes/routes'
import cors from 'cors'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Eco-Drone API',
            version: '1.0.0',
            description:
                'API for managing eco-friendly drone delivery operations including drones, orders, trips, and locations',
            contact: {
                name: 'Kwame Adaboh',
            },
        },
        servers: [
            {
                url: `http://localhost:${env.PORT || 3000}`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'error',
                        },
                        message: {
                            type: 'string',
                        },
                    },
                },
                Success: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'success',
                        },
                        message: {
                            type: 'string',
                        },
                        data: {
                            type: 'object',
                        },
                    },
                },
            },
        },
        security: [],
    },
    // Support both TypeScript (dev) and JavaScript (production) files
    apis: ['./src/routes/*.ts', './dist/routes/*.js'],
}

export const swaggerSpec = swaggerJsdoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.listen(env.PORT || 5400, () => {
    console.log(`server started at ${env.PORT}`)
    console.log(
        `Swagger docs available at http://localhost:${env.PORT}/api-docs`
    )
    router(app)
})
