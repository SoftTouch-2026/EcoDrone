# Vendor Dashboard Integration Guide

This guide is for frontend developers building a **vendor dashboard**: the end-user is a **vendor** (cafeteria or shop) who logs in, updates **their** menu, and manages **their** orders—including marking orders as fulfilled.

---

## 1. Overview

- **Purpose**: Integrate a vendor-facing dashboard with the Eco-drone API so vendors can manage their outlet, menu, and orders.
- **Base URL**: Configurable. For local development, use `http://localhost:5400` (or the port in your env). All paths below are relative to this base.
- **Auth**: The API uses JWT Bearer tokens. Send the access token on every protected request with the header:  
  `Authorization: Bearer <accessToken>`.

---

## 2. Vendor API Support (Implemented)

The API supports a vendor-only dashboard. All vendor routes live under `/vendor` and require a user with `vendor_id` set. Use `Authorization: Bearer <accessToken>`.

| Capability | Implementation |
|------------|----------------|
| **Vendor identity** | Sign-in response includes `user.vendor_id`. `GET /vendor/me` returns the vendor profile (and location) for the current user. |
| **My menu (vendor-scoped)** | **Create**: `POST /menu/createMenu` (or a vendor-scoped path) must accept `vendor_id` so new items are tied to the logged-in vendor’s outlet. Currently the menu create payload does not include `vendor_id`. **Read/Update/Delete**: Either restrict existing menu endpoints to items where `menu.vendor_id` equals the current user’s vendor, or add vendor-scoped routes (e.g. `GET /vendor/me/menu`, `PATCH /vendor/me/menu/:id`) that enforce this. |
| **My orders** | An endpoint to **list orders for the current vendor**: orders that have at least one `order_item` whose `menu.vendor_id` equals the vendor’s id. Example: `GET /vendor/me/orders` or `GET /orders?vendor_id=:id` with authorization ensuring the authenticated user is that vendor. The response should include order id, status, and order items (at least those belonging to this vendor). |
| **Fulfillment** | A way for the vendor to mark that **they** have fulfilled their part of an order. For example: add a `vendor_fulfilled_at` (or similar) on `order_item`, and an endpoint such as `PATCH /vendor/me/orders/:orderId/items/:orderItemId/fulfill` or `POST /vendor/me/orders/:orderId/fulfill` for all of this vendor’s items in that order. |

Until these are implemented, the frontend can still use the existing endpoints documented below where applicable (e.g. sign-in, get vendor by id, get vendor menu) and prepare the UI for “my orders” and “mark fulfilled” once the API supports them.

---

## 3. Authentication

### Sign in

- **Endpoint**: `POST /auth/signIn`
- **Request body**:
  ```json
  {
    "email": "vendor@example.com",
    "password": "yourPassword"
  }
  ```
- **Success response** (200):
  ```json
  {
    "status": "success",
    "message": "User signed in successfully",
    "data": {
      "user": {
        "id": "uuid",
        "email": "vendor@example.com",
        "first_name": "Vendor",
        "last_name": "User",
        "type": "user",
        "should_reset_password": false,
        "vendor_id": "vendor-uuid-or-null"
      },
      "accessToken": "eyJ...",
      "refreshToken": "eyJ..."
    }
  }
  ```
  When **vendor identity** is implemented, the `user` object may include `vendor_id` (or the backend may expose it via `GET /vendor/me`). Use that as “my vendor id” for all vendor-scoped calls.
- **Error**: 400 with `{ "status": "error", "message": "..." }` for invalid credentials.

### Refresh token

- **Endpoint**: `POST /auth/refresh`
- **Request body**: `{ "refreshToken": "<refreshToken>" }`
- **Success response** (200): `data` contains new `accessToken` and `refreshToken`. Use when the access token expires (e.g. after a 401).

### Sending the token

For every request to a protected endpoint, set:

```
Authorization: Bearer <accessToken>
```

---

## 4. Vendor: “My outlet” and “My menu”

### Get my vendor

- **Current option**: Once you have a vendor id (e.g. from `user.vendor_id` or `GET /vendor/me` when available), fetch the vendor profile with:
  - **Endpoint**: `GET /vendors/getVendor/:id`
  - **Response**: Single vendor object, e.g. `{ id, name, location_id, hours, description, momo_number, created_at, updated_at }`, optionally with nested `locations`.
- **Future option**: If the API adds `GET /vendor/me`, use that to get the current user’s vendor in one call.

### Get my menu

- **Endpoint**: `GET /vendors/getVendorMenu/:vendorId`
- **Response**: A **plain array** of menu items (not wrapped in `{ data }`). Each item includes fields such as `id`, `vendor_id`, `name`, `category`, `unit_cost`, `description`, `thumbnail_url`, `available`, `created_at`, `updated_at`.
- **Important**: Defensively treat the response as an array to avoid “map is not a function” errors (e.g. when the client or a proxy wraps the response):
  ```js
  const menuItems = Array.isArray(response) ? response : (response?.data ?? []);
  ```

### Create menu item

- **Endpoint**: `POST /menu/createMenu`
- **Request body** (current):
  ```json
  {
    "name": "Jollof Rice",
    "unit_cost": 15.0,
    "description": "Optional description",
    "thumbnail": "https://example.com/image.jpg"
  }
  ```
  When **vendor-scoped menu** is implemented, the body should include `vendor_id` (or the backend may infer it from the token). Ensure new items are created with the logged-in vendor’s `vendor_id`.

### Update menu item

- **Endpoint**: `POST /menu/updateMenu`
- **Request body**:
  ```json
  {
    "id": "menu-item-uuid",
    "name": "Jollof Rice",
    "unit_cost": 16.0,
    "description": "Optional",
    "thumbnail": "https://example.com/image.jpg"
  }
  ```
  When vendor-scoping exists, the backend should ensure the item belongs to the current vendor.

### Delete menu item

- **Endpoint**: `DELETE /menu/deleteMenu/:id`
- **Response**: 200 with the deleted menu item. Again, when vendor-scoping exists, the backend should restrict this to the current vendor’s items.

---

## 5. Vendor: “My orders” and fulfillment

These flows are **implemented** and ready for integration.

### List my orders

- **Endpoint**: `GET /vendor/me/orders`
- **Query params**:
  - `page` (string, optional) – page number (default `"1"`).
  - `limit` (string, optional) – page size (default `"20"`, max `100`).
- **Behavior**:
  - Returns only orders that have at least one `order_item` whose `menu.vendor_id` equals the current vendor’s id.
  - Within each order, the `order_item` array is filtered to include **only** this vendor’s items.
- **Response** (200):
  ```json
  {
    "data": [
      {
        "id": "order-uuid",
        "status": "Confirmed",
        "pickup_location": { "id": "pickup-location-uuid", "name": "Cafeteria A" },
        "dropoff_location": { "id": "dropoff-location-uuid", "name": "Dorm Block 1" },
        "customer": {
          "id": "user-uuid",
          "email": "student@example.com",
          "first_name": "Student",
          "last_name": "User"
        },
        "created_at": "2025-03-15T12:00:00.000Z",
        "updated_at": "2025-03-15T12:05:00.000Z",
        "order_item": [
          {
            "id": "order-item-uuid",
            "order_id": "order-uuid",
            "item_id": "menu-item-uuid",
            "order_quantity": 2,
            "vendor_fulfilled_at": "2025-03-15T12:10:00.000Z",
            "menu": {
              "id": "menu-item-uuid",
              "name": "Jollof Rice",
              "unit_cost": 15.0,
              "thumbnail_url": "https://example.com/image.jpg"
            }
          }
        ]
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
  ```

### Mark as fulfilled

You can mark **all of this vendor’s items in an order** as fulfilled, or mark items **one by one**.

- **Order-level fulfill (all of this vendor’s items in the order)**  
  - **Endpoint**: `POST /vendor/me/orders/:orderId/fulfill`  
    (there is also a `PATCH` alias with the same path and behavior).
  - **Request body**: _none_.
  - **Response** (200): Updated order object (including all order items in the order) with `vendor_fulfilled_at` set on this vendor’s items.

- **Per-item fulfill**  
  - **Endpoint**: `PATCH /vendor/me/orders/:orderId/items/:orderItemId/fulfill`
  - **Request body**: _none_.
  - **Behavior**:
    - Marks the single `order_item` as fulfilled for this vendor by setting `vendor_fulfilled_at` to the current timestamp.
    - Validates that the item belongs to the given order and that its `menu.vendor_id` matches the current vendor.
  - **Response** (200): Updated order item:
    ```json
    {
      "id": "order-item-uuid",
      "order_id": "order-uuid",
      "item_id": "menu-item-uuid",
      "order_quantity": 2,
      "vendor_fulfilled_at": "2025-03-15T12:10:00.000Z",
      "menu": {
        "id": "menu-item-uuid",
        "name": "Jollof Rice",
        "unit_cost": 15.0,
        "thumbnail_url": "https://example.com/image.jpg"
      }
    }
    ```

---

## 6. Error handling

- **Response format**: Errors return JSON in the shape:
  ```json
  { "status": "error", "message": "Human-readable message" }
  ```
- **Status codes**:
  - **400**: Validation or bad request (e.g. missing or invalid body).
  - **401**: Unauthorized (missing or invalid token). Trigger token refresh or redirect to login.
  - **403**: Forbidden (e.g. user is not the vendor that owns this order or menu item).

---

## 7. Example flows (vendor persona)

1. **Vendor logs in and sees their outlet**  
   Call `POST /auth/signIn` → store `accessToken` (and `refreshToken`) → read `user.vendor_id` if present (or call `GET /vendor/me` when available) → load vendor profile with `GET /vendors/getVendor/:id` and menu with `GET /vendors/getVendorMenu/:vendorId`. Normalize the menu response to an array before mapping.

2. **Vendor updates their menu**  
   Add item: `POST /menu/createMenu` with `name`, `unit_cost`, and optionally `description`, `thumbnail` (and `vendor_id` when supported). Edit: `POST /menu/updateMenu` with `id`, `name`, `unit_cost`, etc. Remove: `DELETE /menu/deleteMenu/:id`. All scoped to their vendor once the backend enforces it.

3. **Vendor views and fulfills orders**  
   Call the “my orders” endpoint (when available) → display the list → when the vendor confirms preparation, call the “mark fulfilled” endpoint for that order (or per item, depending on API design).

---

## 8. Quick reference

| Purpose | Method | Path | Auth | Available today? |
|--------|--------|------|------|-------------------|
| Vendor sign in | POST | `/auth/signIn` | No | Yes |
| Refresh token | POST | `/auth/refresh` | No | Yes |
| Get my vendor | GET | `/vendors/getVendor/:id` | Bearer | Yes (need vendor id) |
| Get my menu | GET | `/vendors/getVendorMenu/:vendorId` | Bearer | Yes |
| Create menu item | POST | `/menu/createMenu` | Bearer | Yes (no `vendor_id` in payload yet) |
| Update menu item | POST | `/menu/updateMenu` | Bearer | Yes |
| Delete menu item | DELETE | `/menu/deleteMenu/:id` | Bearer | Yes |
| Get my vendor id | GET | `/vendor/me` (or from user) | Bearer | Yes |
| List my orders | GET | `/vendor/me/orders` | Bearer | Yes |
| Mark order fulfilled | POST/PATCH | `/vendor/me/orders/:orderId/fulfill` | Bearer | Yes |

Use the “Available today?” column to decide what you can implement immediately and what to stub or hide until the backend adds the required support.
