import { TypeOf } from 'zod'
import {
    EditUserSchema,
    DeleteUserSchema,
    SignInSchema,
    SignUpSchema,
    ResetPasswordSchema,
} from '../schemas/auth.schemas'
import {
    CreateDroneSchema,
    UpdateDroneSchema,
    DeleteDroneSchema,
    GetDroneSchema,
    GetDronesSchema,
    AssignDroneSchema,
} from '../schemas/drones.schemas'
import {
    CreateLocationSchema,
    UpdateLocationSchema,
    DeleteLocationSchema,
    GetLocationSchema,
    GetLocationsSchema,
} from '../schemas/locations.schemas'
import {
    CreateOrderSchema,
    UpdateOrderSchema,
    DeleteOrderSchema,
    GetOrderSchema,
    GetOrdersSchema,
} from '../schemas/orders.schemas'
import {
    CreateTripSchema,
    UpdateTripSchema,
    DeleteTripSchema,
    GetTripSchema,
    GetTripsSchema,
    StartTripSchema,
    EndTripSchema,
} from '../schemas/trips.schemas'
import {
    CreateMenuSchema,
    UpdateMenuSchema,
    DeleteMenuSchema,
    GetMenuSchema,
    GetMenusSchema,
} from '../schemas/menu.schemas'
import {
    CreateCartSchema,
    DeleteCartSchema,
    GetCartSchema,
    GetCartByUserSchema,
} from '../schemas/cart.schemas'
import {
    AddCartItemSchema,
    UpdateCartItemSchema,
    DeleteCartItemSchema,
    GetCartItemsSchema,
} from '../schemas/cartItem.schemas'
import {
    CreateOrderItemSchema,
    UpdateOrderItemSchema,
    DeleteOrderItemSchema,
    GetOrderItemsSchema,
} from '../schemas/orderItem.schemas'
import {
    CreateVendorSchema,
    UpdateVendorSchema,
    DeleteVendorSchema,
    GetVendorSchema,
    GetVendorsSchema,
    GetVendorMenuSchema,
} from '../schemas/vendors.schemas'
import {
    CreateAdminUserSchema,
    UpdateAdminUserSchema,
    GetAdminUserSchema,
    ListAdminUsersSchema,
    DeleteAdminUserSchema,
} from '../schemas/admin.schemas'

export type CreateuserInput = TypeOf<typeof SignUpSchema>
export type CreateDroneInput = TypeOf<typeof CreateDroneSchema>
export type UpdateDroneInput = TypeOf<typeof UpdateDroneSchema>
export type DeleteDroneInput = TypeOf<typeof DeleteDroneSchema>
export type GetDroneInput = TypeOf<typeof GetDroneSchema>
export type GetDronesInput = TypeOf<typeof GetDronesSchema>
export type AssignDroneInput = TypeOf<typeof AssignDroneSchema>
export type CreateLocationInput = TypeOf<typeof CreateLocationSchema>
export type UpdateLocationInput = TypeOf<typeof UpdateLocationSchema>
export type DeleteLocationInput = TypeOf<typeof DeleteLocationSchema>
export type GetLocationInput = TypeOf<typeof GetLocationSchema>
export type GetLocationsInput = TypeOf<typeof GetLocationsSchema>
export type CreateOrderInput = TypeOf<typeof CreateOrderSchema>
export type UpdateOrderInput = TypeOf<typeof UpdateOrderSchema>
export type DeleteOrderInput = TypeOf<typeof DeleteOrderSchema>
export type GetOrderInput = TypeOf<typeof GetOrderSchema>
export type GetOrdersInput = TypeOf<typeof GetOrdersSchema>
export type CreateTripInput = TypeOf<typeof CreateTripSchema>
export type UpdateTripInput = TypeOf<typeof UpdateTripSchema>
export type DeleteTripInput = TypeOf<typeof DeleteTripSchema>
export type GetTripInput = TypeOf<typeof GetTripSchema>
export type GetTripsInput = TypeOf<typeof GetTripsSchema>
export type StartTripInput = TypeOf<typeof StartTripSchema>
export type EndTripInput = TypeOf<typeof EndTripSchema>
export type EditUserInput = TypeOf<typeof EditUserSchema>
export type DeleteUserInput = TypeOf<typeof DeleteUserSchema>
export type SignInInput = TypeOf<typeof SignInSchema>
export type SignUpInput = TypeOf<typeof SignUpSchema>
export type ResetPasswordInput = TypeOf<typeof ResetPasswordSchema>
export type CreateMenuInput = TypeOf<typeof CreateMenuSchema>
export type UpdateMenuInput = TypeOf<typeof UpdateMenuSchema>
export type DeleteMenuInput = TypeOf<typeof DeleteMenuSchema>
export type GetMenuInput = TypeOf<typeof GetMenuSchema>
export type GetMenusInput = TypeOf<typeof GetMenusSchema>
export type CreateCartInput = TypeOf<typeof CreateCartSchema>
export type DeleteCartInput = TypeOf<typeof DeleteCartSchema>
export type GetCartInput = TypeOf<typeof GetCartSchema>
export type GetCartByUserInput = TypeOf<typeof GetCartByUserSchema>
export type AddCartItemInput = TypeOf<typeof AddCartItemSchema>
export type UpdateCartItemInput = TypeOf<typeof UpdateCartItemSchema>
export type DeleteCartItemInput = TypeOf<typeof DeleteCartItemSchema>
export type GetCartItemsInput = TypeOf<typeof GetCartItemsSchema>
export type CreateOrderItemInput = TypeOf<typeof CreateOrderItemSchema>
export type UpdateOrderItemInput = TypeOf<typeof UpdateOrderItemSchema>
export type DeleteOrderItemInput = TypeOf<typeof DeleteOrderItemSchema>
export type GetOrderItemsInput = TypeOf<typeof GetOrderItemsSchema>
export type CreateVendorInput = TypeOf<typeof CreateVendorSchema>
export type UpdateVendorInput = TypeOf<typeof UpdateVendorSchema>
export type DeleteVendorInput = TypeOf<typeof DeleteVendorSchema>
export type GetVendorInput = TypeOf<typeof GetVendorSchema>
export type GetVendorsInput = TypeOf<typeof GetVendorsSchema>
export type GetVendorMenuInput = TypeOf<typeof GetVendorMenuSchema>
export type CreateAdminUserInput = TypeOf<typeof CreateAdminUserSchema>
export type UpdateAdminUserInput = TypeOf<typeof UpdateAdminUserSchema>
export type GetAdminUserInput = TypeOf<typeof GetAdminUserSchema>
export type ListAdminUsersInput = TypeOf<typeof ListAdminUsersSchema>
export type DeleteAdminUserInput = TypeOf<typeof DeleteAdminUserSchema>

export type VendorOrderItemDto = {
    id: string
    order_id: string | null
    item_id: string | null
    order_quantity: number | null
    vendor_fulfilled_at: Date | null
    menu: {
        id: string
        name: string | null
        unit_cost: any
        thumbnail_url: string | null
    } | null
}

export type VendorOrderDto = {
    id: string
    status: string | null
    pickup_location: { id: string; name: string | null }
    dropoff_location: { id: string; name: string | null }
    customer:
        | {
              id: string
              email: string
              first_name: string | null
              last_name: string | null
          }
        | null
    created_at: Date
    updated_at: Date
    order_item: VendorOrderItemDto[]
}

export type VendorOrdersListResponse = {
    data: VendorOrderDto[]
    total: number
    page: number
    limit: number
}
