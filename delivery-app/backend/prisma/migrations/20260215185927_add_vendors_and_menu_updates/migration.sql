-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "menu_category" AS ENUM ('food', 'drinks', 'snacks', 'desserts', 'stationery', 'electronics');

-- CreateEnum
CREATE TYPE "trip_status" AS ENUM ('ongoing', 'completed', 'created', 'cancelled');

-- CreateEnum
CREATE TYPE "user_type" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "drone_status" AS ENUM ('available', 'pending');

-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('started', 'completed', 'failed');

-- CreateTable
CREATE TABLE "drones" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "serial_number" VARCHAR,
    "battery_level" DECIMAL,
    "status" "drone_status",
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "drones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR,
    "latitude" DECIMAL,
    "longitude" DECIMAL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "pickup_location" UUID NOT NULL,
    "dropoff_location" UUID NOT NULL,
    "assigned_drone" UUID,
    "customer_id" UUID NOT NULL,
    "status" "order_status",
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "order_id" UUID NOT NULL,
    "status" "trip_status" NOT NULL,
    "start_time" TIMESTAMPTZ(6),
    "end_time" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "email" VARCHAR NOT NULL,
    "password_hash" VARCHAR NOT NULL,
    "first_name" VARCHAR,
    "last_name" VARCHAR,
    "type" "user_type",
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_item" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "item_id" UUID,
    "quanity" INTEGER,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "cart_id" UUID,

    CONSTRAINT "cart_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "vendor_id" UUID,
    "name" VARCHAR,
    "category" "menu_category",
    "unit_cost" DECIMAL,
    "description" VARCHAR,
    "thumbnail_url" VARCHAR,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "order_id" UUID,
    "item_id" UUID,
    "order_quantity" INTEGER,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "order_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "location_id" UUID,
    "name" VARCHAR NOT NULL,
    "hours" VARCHAR,
    "description" VARCHAR,
    "emoji" VARCHAR,
    "momo_number" VARCHAR,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "drones_serial_number_key" ON "drones"("serial_number");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_dropoff_location_fkey" FOREIGN KEY ("dropoff_location") REFERENCES "locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_pickup_location_fkey" FOREIGN KEY ("pickup_location") REFERENCES "locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cart" ADD CONSTRAINT "cart_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "cart"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "menu"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "menu" ADD CONSTRAINT "menu_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "menu"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
