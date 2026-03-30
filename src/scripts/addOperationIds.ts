import * as fs from 'fs'
import * as path from 'path'

// Mapping of endpoints to their operationIds based on controller function names
const operationIdMap: Record<string, Record<string, string>> = {
    '/auth/signUp': { post: 'handleSignUpRequest' },
    '/auth/signIn': { post: 'handleSignInRequest' },
    '/auth/editUser': { post: 'handleEditUserRequest' },
    '/auth/deleteUser': { delete: 'handleDeleteUserRequest' },

    '/cart/createCart': { post: 'handleCreateCartRequest' },
    '/cart/deleteCart': { delete: 'handleDeleteCartRequest' },
    '/cart/getCart': { get: 'handleGetCartRequest' },
    '/cart/getCartByUser': { get: 'handleGetCartByUserRequest' },

    '/cartItem/addCartItem': { post: 'handleAddCartItemRequest' },
    '/cartItem/updateCartItem': { post: 'handleUpdateCartItemRequest' },
    '/cartItem/deleteCartItem': { delete: 'handleDeleteCartItemRequest' },
    '/cartItem/getCartItems': { get: 'handleGetCartItemsRequest' },

    '/drones/createDrone': { post: 'handleCreateDroneRequest' },
    '/drones/updateDrone': { post: 'handleUpdateDroneRequest' },
    '/drones/deleteDrone': { delete: 'handleDeleteDroneRequest' },
    '/drones/assignDrone': { post: 'handleAssignDroneRequest' },
    '/drones/getDrone': { get: 'handleGetDroneRequest' },
    '/drones/getDrones': { get: 'handleGetDronesRequest' },

    '/locations/createLocation': { post: 'handleCreateLocationRequest' },
    '/locations/updateLocation': { post: 'handleUpdateLocationRequest' },
    '/locations/deleteLocation': { delete: 'handleDeleteLocationRequest' },
    '/locations/getLocation': { get: 'handleGetLocationRequest' },
    '/locations/getLocations': { get: 'handleGetLocationsRequest' },

    '/menu/createMenu': { post: 'handleCreateMenuRequest' },
    '/menu/updateMenu': { post: 'handleUpdateMenuRequest' },
    '/menu/deleteMenu': { delete: 'handleDeleteMenuRequest' },
    '/menu/getMenu': { get: 'handleGetMenuRequest' },
    '/menu/getMenus': { get: 'handleGetMenusRequest' },

    '/orderItem/createOrderItem': { post: 'handleCreateOrderItemRequest' },
    '/orderItem/updateOrderItem': { post: 'handleUpdateOrderItemRequest' },
    '/orderItem/deleteOrderItem': { delete: 'handleDeleteOrderItemRequest' },
    '/orderItem/getOrderItems': { get: 'handleGetOrderItemsRequest' },

    '/orders/createOrder': { post: 'handleCreateOrderRequest' },
    '/orders/updateOrder': { post: 'handleUpdateOrderRequest' },
    '/orders/deleteOrder': { delete: 'handleDeleteOrderRequest' },
    '/orders/getOrder': { get: 'handleGetOrderRequest' },
    '/orders/getOrders': { get: 'handleGetOrdersRequest' },

    '/trips/createTrip': { post: 'handleCreateTripRequest' },
    '/trips/updateTrip': { post: 'handleUpdateTripRequest' },
    '/trips/deleteTrip': { delete: 'handleDeleteTripRequest' },
    '/trips/getTrip': { get: 'handleGetTripRequest' },
    '/trips/getTrips': { get: 'handleGetTripsRequest' },
    '/trips/startTrip': { post: 'handleStartTripRequest' },
    '/trips/endTrip': { post: 'handleEndTripRequest' },
}

const swaggerPath = path.join(__dirname, '../../swagger/swagger.json')

// Read the swagger file
const swaggerContent = fs.readFileSync(swaggerPath, 'utf-8')
const swagger = JSON.parse(swaggerContent)

// Add operationId to each endpoint
for (const [endpoint, methods] of Object.entries(operationIdMap)) {
    if (swagger.paths[endpoint]) {
        for (const [method, operationId] of Object.entries(methods)) {
            if (swagger.paths[endpoint][method]) {
                swagger.paths[endpoint][method].operationId = operationId
                console.log(
                    `Added operationId "${operationId}" to ${method.toUpperCase()} ${endpoint}`
                )
            }
        }
    }
}

// Write back to the file
fs.writeFileSync(swaggerPath, JSON.stringify(swagger, null, 2), 'utf-8')
console.log('\n✅ Successfully added operationIds to all endpoints!')
