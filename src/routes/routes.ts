import { Express } from 'express'
import { authRoutes } from './auth'
import { droneRoutes } from './drones'
import { locationRoutes } from './locations'
import { orderRoutes } from './orders'
import { tripRoutes } from './trips'
import { menuRoutes } from './menu'
import { cartRoutes } from './cart'
import { cartItemRoutes } from './cartItem'
import { orderItemRoutes } from './orderItem'
//main routes file

export const router = (app: Express) => {
    app.use('/auth', authRoutes())
    app.use('/drones', droneRoutes())
    app.use('/locations', locationRoutes())
    app.use('/orders', orderRoutes())
    app.use('/trips', tripRoutes())
    app.use('/menu', menuRoutes())
    app.use('/cart', cartRoutes())
    app.use('/cartItem', cartItemRoutes())
    app.use('/orderItem', orderItemRoutes())
}
