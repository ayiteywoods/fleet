-- CreateTable
CREATE TABLE "api_data" (
    "id" BIGSERIAL NOT NULL,
    "external_id" INTEGER NOT NULL,
    "data" JSON,
    "title" TEXT,
    "body" TEXT,
    "user_id" INTEGER,
    "fetched_at" TIMESTAMP(0),
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "api_data_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_sessions" (
    "id" BIGSERIAL NOT NULL,
    "user_id_guid" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "authenticated_at" TIMESTAMP(0),
    "expires_at" TIMESTAMP(0),
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "api_sessions_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "created_by" BIGINT,
    "updated_by" BIGINT,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clusters" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255),
    "description" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "created_by" BIGINT,
    "updated_by" BIGINT,

    CONSTRAINT "cluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255),
    "location" VARCHAR(255),
    "loc_code" VARCHAR(255),
    "phone" VARCHAR(255),
    "description" VARCHAR(255),
    "group_id" INTEGER,
    "email" VARCHAR(255),
    "address" VARCHAR(255),
    "contact_person" VARCHAR(255),
    "contact_phone" VARCHAR(255),
    "status" VARCHAR(255),
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "created_by" BIGINT,
    "updated_by" BIGINT,
    "external_id" VARCHAR(15),
    "data" JSON,
    "fetched_at" TIMESTAMP(6),
    "contact_email" VARCHAR,
    "notes" VARCHAR,
    "contact_position" VARCHAR,
    "deleted_by" VARCHAR,
    "deleted_at" TIMESTAMP(6),
    "service_type" VARCHAR,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_operators" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255) NOT NULL,
    "license_number" VARCHAR(255) NOT NULL,
    "license_category" VARCHAR(255) NOT NULL,
    "license_expire" VARCHAR(255) NOT NULL,
    "region" VARCHAR(255) NOT NULL,
    "district" VARCHAR(255) NOT NULL,
    "status" VARCHAR(255) NOT NULL,
    "vehicle_id" BIGINT,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "created_by" BIGINT,
    "updated_by" BIGINT,
    "spcode" INTEGER,
    "date_issued" DATE,
    "dob" DATE,

    CONSTRAINT "driver_operators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "failed_jobs" (
    "id" BIGSERIAL NOT NULL,
    "uuid" VARCHAR(255) NOT NULL,
    "connection" TEXT NOT NULL,
    "queue" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "exception" TEXT NOT NULL,
    "failed_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "failed_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_expense_log" (
    "id" BIGSERIAL NOT NULL,
    "vendor" VARCHAR(255) NOT NULL,
    "payment_method" VARCHAR(255) NOT NULL,
    "fuel_request_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "fuel_expense_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_logs" (
    "id" BIGSERIAL NOT NULL,
    "refuel_date" DATE NOT NULL,
    "quantity" DECIMAL(8,2) NOT NULL,
    "unit_cost" DECIMAL(8,2) NOT NULL,
    "total_cost" DECIMAL(10,2) NOT NULL,
    "mileage_before" INTEGER NOT NULL,
    "mileage_after" INTEGER NOT NULL,
    "fuel_type" VARCHAR(255) NOT NULL,
    "vendor" VARCHAR(255) NOT NULL,
    "receipt_number" VARCHAR(255),
    "notes" TEXT,
    "vehicle_id" BIGINT NOT NULL,
    "driver_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "fuel_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_request" (
    "id" BIGSERIAL NOT NULL,
    "justification" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit_cost" DOUBLE PRECISION NOT NULL,
    "total_cost" DOUBLE PRECISION NOT NULL,
    "status" VARCHAR(255) NOT NULL,
    "vehicle_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "fuel_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "desc" TEXT,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "created_by" BIGINT,
    "updated_by" BIGINT,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_reports" (
    "id" BIGSERIAL NOT NULL,
    "incident_date" DATE NOT NULL,
    "incident_time" TIME(0) NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "severity" VARCHAR(255) NOT NULL,
    "actions_taken" TEXT,
    "estimated_damage_cost" DECIMAL(10,2),
    "reported_by" VARCHAR(255) NOT NULL,
    "witnesses" JSON,
    "photos" JSON,
    "vehicle_id" BIGINT NOT NULL,
    "driver_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "incident_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance" (
    "id" BIGSERIAL NOT NULL,
    "policy_number" VARCHAR(255) NOT NULL,
    "insurance_company" VARCHAR(255) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "premium_amount" DECIMAL(10,2) NOT NULL,
    "coverage_type" VARCHAR(255) NOT NULL,
    "notes" TEXT,
    "vehicle_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "insurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_history" (
    "id" BIGSERIAL NOT NULL,
    "service_date" DATE NOT NULL,
    "cost" DECIMAL(10,2) NOT NULL,
    "status" VARCHAR(255) NOT NULL DEFAULT 'completed',
    "service_details" TEXT,
    "service_type" VARCHAR(255) NOT NULL,
    "mileage_at_service" INTEGER NOT NULL DEFAULT 0,
    "parts_replaced" TEXT,
    "vehicle_id" BIGINT NOT NULL,
    "mechanic_id" BIGINT NOT NULL,
    "workshop_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "maintenance_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_schedule" (
    "id" BIGSERIAL NOT NULL,
    "due_date" DATE NOT NULL,
    "vehicle_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "maintenance_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mechanics" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "specialization" VARCHAR(255) NOT NULL,
    "region" VARCHAR(255) NOT NULL,
    "district" VARCHAR(255) NOT NULL,
    "status" VARCHAR(255) NOT NULL,
    "workshop_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "mechanics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "migrations" (
    "id" SERIAL NOT NULL,
    "migration" VARCHAR(255) NOT NULL,
    "batch" INTEGER NOT NULL,

    CONSTRAINT "migrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "model" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "vehicle_make_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "model_has_permissions" (
    "permission_id" BIGINT NOT NULL,
    "model_type" VARCHAR(255) NOT NULL,
    "model_id" BIGINT NOT NULL,

    CONSTRAINT "model_has_permissions_pkey" PRIMARY KEY ("permission_id","model_id","model_type")
);

-- CreateTable
CREATE TABLE "model_has_roles" (
    "role_id" BIGINT NOT NULL,
    "model_type" VARCHAR(255) NOT NULL,
    "model_id" BIGINT NOT NULL,

    CONSTRAINT "model_has_roles_pkey" PRIMARY KEY ("role_id","model_id","model_type")
);

-- CreateTable
CREATE TABLE "oauth_access_tokens" (
    "id" CHAR(80) NOT NULL,
    "user_id" BIGINT,
    "client_id" UUID NOT NULL,
    "name" VARCHAR(255),
    "scopes" TEXT,
    "revoked" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "expires_at" TIMESTAMP(0),

    CONSTRAINT "oauth_access_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_auth_codes" (
    "id" CHAR(80) NOT NULL,
    "user_id" BIGINT NOT NULL,
    "client_id" UUID NOT NULL,
    "scopes" TEXT,
    "revoked" BOOLEAN NOT NULL,
    "expires_at" TIMESTAMP(0),

    CONSTRAINT "oauth_auth_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_clients" (
    "id" UUID NOT NULL,
    "owner_type" VARCHAR(255),
    "owner_id" BIGINT,
    "name" VARCHAR(255) NOT NULL,
    "secret" VARCHAR(255),
    "provider" VARCHAR(255),
    "redirect_uris" TEXT NOT NULL,
    "grant_types" TEXT NOT NULL,
    "revoked" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "oauth_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_device_codes" (
    "id" CHAR(80) NOT NULL,
    "user_id" BIGINT,
    "client_id" UUID NOT NULL,
    "user_code" CHAR(8) NOT NULL,
    "scopes" TEXT NOT NULL,
    "revoked" BOOLEAN NOT NULL,
    "user_approved_at" TIMESTAMP(0),
    "last_polled_at" TIMESTAMP(0),
    "expires_at" TIMESTAMP(0),

    CONSTRAINT "oauth_device_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_refresh_tokens" (
    "id" CHAR(80) NOT NULL,
    "access_token_id" CHAR(80) NOT NULL,
    "revoked" BOOLEAN NOT NULL,
    "expires_at" TIMESTAMP(0),

    CONSTRAINT "oauth_refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "email" VARCHAR(255) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(0)
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "guard_name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_access_tokens" (
    "id" BIGSERIAL NOT NULL,
    "tokenable_type" VARCHAR(255) NOT NULL,
    "tokenable_id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "token" VARCHAR(64) NOT NULL,
    "abilities" TEXT,
    "last_used_at" TIMESTAMP(0),
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "expires_at" TIMESTAMP(6),

    CONSTRAINT "personal_access_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positions_data" (
    "id" BIGSERIAL NOT NULL,
    "unit_uid" VARCHAR(255),
    "unit_name" VARCHAR(255),
    "gps_time_utc" TIMESTAMP(0),
    "address" TEXT,
    "speed" DECIMAL(8,2),
    "odometer" DECIMAL(12,2),
    "engine_status" VARCHAR(255),
    "data" JSON,
    "fetched_at" TIMESTAMP(0),
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "positions_data_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts_data" (
    "id" BIGSERIAL NOT NULL,
    "unit_uid" VARCHAR(255) NOT NULL,
    "unit_name" VARCHAR(255),
    "gps_time_utc" TIMESTAMP(0) NOT NULL,
    "address" TEXT,
    "speed" DECIMAL(8,2),
    "odometer" DECIMAL(12,2),
    "latitude" DECIMAL(10,6),
    "longitude" DECIMAL(10,6),
    "measure" VARCHAR(255),
    "heading" DECIMAL(5,2),
    "ignition" BOOLEAN,
    "engine_time" DECIMAL(12,2),
    "engine_status" VARCHAR(255),
    "alert_type" VARCHAR(255) NOT NULL,
    "alert_description" TEXT,
    "status" VARCHAR(255),
    "data" JSON,
    "fetched_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "last_reported_time_utc" TIMESTAMP(6),
    "imei" VARCHAR,
    "company_uid" VARCHAR,

    CONSTRAINT "alerts_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repair_history" (
    "id" BIGSERIAL NOT NULL,
    "service_date" DATE NOT NULL,
    "cost" DECIMAL(10,2) NOT NULL,
    "status" VARCHAR(255) NOT NULL,
    "vehicle_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "details" TEXT,
    "part_replaced" TEXT,

    CONSTRAINT "repair_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repair_request" (
    "id" BIGSERIAL NOT NULL,
    "issue_desc" VARCHAR(255) NOT NULL,
    "urgency_level" VARCHAR(255) NOT NULL,
    "region" VARCHAR(255) NOT NULL,
    "district" VARCHAR(255) NOT NULL,
    "status" VARCHAR(255) NOT NULL,
    "workshop_id" BIGINT NOT NULL,
    "vehicle_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "repair_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repair_schedule" (
    "id" BIGSERIAL NOT NULL,
    "schedule_date" DATE NOT NULL,
    "assigned_technician" BIGINT NOT NULL,
    "repair_request_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "repair_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadworthy" (
    "id" BIGINT NOT NULL,
    "company" VARCHAR NOT NULL,
    "vehicle_number" VARCHAR NOT NULL,
    "vehicle_type" VARCHAR,
    "date_issued" DATE NOT NULL,
    "date_expired" DATE NOT NULL,
    "roadworth_status" VARCHAR NOT NULL,
    "updated_by" VARCHAR NOT NULL,
    "created_at" TIME(6),
    "updated_at" TIME(6),
    "created_by" INTEGER,

    CONSTRAINT "roadworthy_pkey" PRIMARY KEY ("id","vehicle_number")
);

-- CreateTable
CREATE TABLE "role_has_permissions" (
    "permission_id" BIGINT NOT NULL,
    "role_id" BIGINT NOT NULL,

    CONSTRAINT "role_has_permissions_pkey" PRIMARY KEY ("permission_id","role_id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "guard_name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensor_data" (
    "id" BIGSERIAL NOT NULL,
    "unit_uid" VARCHAR(255),
    "gps_time_utc" TIMESTAMP(0),
    "sensor_type" VARCHAR(255),
    "value" DECIMAL(12,2),
    "data" JSON,
    "fetched_at" TIMESTAMP(0),
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "name" VARCHAR(255),
    "measurement_sign" VARCHAR(255),
    "reading_time_local" TIMESTAMP(0),
    "server_time_utc" TIMESTAMP(0),

    CONSTRAINT "sensor_data_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spare_part_dispatch" (
    "id" BIGSERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" VARCHAR(255) NOT NULL,
    "spare_part_request_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "spare_part_dispatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spare_part_inventory" (
    "id" BIGSERIAL NOT NULL,
    "part_name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reorder_threshold" INTEGER NOT NULL,
    "supplier_name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "spare_part_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spare_part_inventory_log" (
    "id" BIGSERIAL NOT NULL,
    "quantity_added" INTEGER NOT NULL,
    "spare_part_inventory_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "spare_part_inventory_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spare_part_receipt" (
    "id" BIGSERIAL NOT NULL,
    "spare_part_dispatch_id" BIGINT NOT NULL,
    "vehicle_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "district" VARCHAR(255) NOT NULL DEFAULT '',
    "justification" TEXT NOT NULL DEFAULT '',
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "received_at" TIMESTAMP(0),
    "received_by" INTEGER,
    "region" VARCHAR(255) NOT NULL DEFAULT '',
    "status" VARCHAR(255) NOT NULL DEFAULT 'Pending',

    CONSTRAINT "spare_part_receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spare_part_request" (
    "id" BIGSERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "justification" TEXT NOT NULL,
    "region" VARCHAR(255) NOT NULL,
    "district" VARCHAR(255) NOT NULL,
    "status" VARCHAR(255) NOT NULL,
    "spare_part_inventory_id" BIGINT NOT NULL,
    "vehicle_id" BIGINT NOT NULL,
    "approved_at" TIMESTAMP(0),
    "approved_by" INTEGER,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "spare_part_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subsidiary" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR(255),
    "contact_no" VARCHAR(255),
    "address" VARCHAR(255),
    "location" TEXT,
    "contact_person" VARCHAR(255),
    "contact_person_no" VARCHAR(255),
    "cluster_id" BIGINT,
    "description" TEXT,
    "notes" TEXT,

    CONSTRAINT "subsidiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supervisors" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "region" VARCHAR(255) NOT NULL,
    "district" VARCHAR(255) NOT NULL,
    "status" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "supervisors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255),
    "color" VARCHAR(255),
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(255),
    "role" VARCHAR(255) NOT NULL DEFAULT 'user',
    "region" VARCHAR(255),
    "district" VARCHAR(255),
    "spcode" INTEGER,
    "group" INTEGER,
    "email_verified_at" TIMESTAMP(0),
    "password" VARCHAR(255) NOT NULL,
    "license_number" VARCHAR(255),
    "license_category" VARCHAR(255),
    "license_expiry" DATE,
    "specialization" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "remember_token" VARCHAR(100),
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "created_by" VARCHAR(15),
    "updated_by" VARCHAR(15),
    "profile_image" VARCHAR(255),
    "user_code" VARCHAR(50),
    "status" CHAR(1),
    "user_type" VARCHAR(50),
    "role_id" BIGINT,
    "api_token" VARCHAR(255),
    "password_reset" CHAR(1),
    "deleted_at" TIMESTAMPTZ(6),
    "providers" TEXT,
    "branch_id" BIGINT,
    "user_level" VARCHAR(50),
    "type" VARCHAR(100),
    "full_name" VARCHAR(100),
    "picture" VARCHAR(255),
    "wc_id" BIGINT,
    "district_id" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_dispatch" (
    "id" BIGSERIAL NOT NULL,
    "region" VARCHAR(255) NOT NULL,
    "district" VARCHAR(255) NOT NULL,
    "first_maintenance" DATE,
    "assigned_to" VARCHAR(255) NOT NULL,
    "received_by" VARCHAR(255) NOT NULL,
    "purpose" TEXT,
    "dispatch_date" DATE NOT NULL,
    "expected_return_date" DATE,
    "vehicle_id" BIGINT NOT NULL,
    "driver_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "vehicle_dispatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_makes" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "vehicle_makes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_reservation" (
    "id" BIGSERIAL NOT NULL,
    "justification" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" VARCHAR(255) NOT NULL,
    "vehicle_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "vehicle_reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_types" (
    "id" BIGSERIAL NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "vehicle_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" BIGSERIAL NOT NULL,
    "vin_number" VARCHAR(255),
    "reg_number" VARCHAR(255),
    "trim" VARCHAR(255),
    "year" INTEGER,
    "status" VARCHAR(255),
    "color" VARCHAR(255),
    "engine_number" VARCHAR(255),
    "chassis_number" VARCHAR(255),
    "current_region" VARCHAR(255),
    "current_district" VARCHAR(255),
    "current_mileage" DECIMAL(10,2) DEFAULT 0,
    "last_service_date" DATE,
    "next_service_km" INTEGER,
    "type_id" BIGINT,
    "make_id" BIGINT,
    "notes" TEXT,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(6),
    "deleted_by" VARCHAR(15),
    "spcode" BIGINT,
    "company_uid" VARCHAR(15),
    "uid" VARCHAR(15),
    "company_name" VARCHAR,
    "name" VARCHAR,
    "data" JSON,
    "fetched_at" TIMESTAMP(6),
    "unit_type" VARCHAR,
    "linked_number" VARCHAR,
    "imei" VARCHAR,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workshops" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "region" VARCHAR(255) NOT NULL,
    "district" VARCHAR(255) NOT NULL,
    "supervisor_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "workshops_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "failed_jobs_uuid_unique" ON "failed_jobs"("uuid");

-- CreateIndex
CREATE INDEX "model_has_permissions_model_id_model_type_index" ON "model_has_permissions"("model_id", "model_type");

-- CreateIndex
CREATE INDEX "model_has_roles_model_id_model_type_index" ON "model_has_roles"("model_id", "model_type");

-- CreateIndex
CREATE INDEX "oauth_access_tokens_user_id_index" ON "oauth_access_tokens"("user_id");

-- CreateIndex
CREATE INDEX "oauth_auth_codes_user_id_index" ON "oauth_auth_codes"("user_id");

-- CreateIndex
CREATE INDEX "oauth_clients_owner_type_owner_id_index" ON "oauth_clients"("owner_type", "owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_device_codes_user_code_unique" ON "oauth_device_codes"("user_code");

-- CreateIndex
CREATE INDEX "oauth_device_codes_client_id_index" ON "oauth_device_codes"("client_id");

-- CreateIndex
CREATE INDEX "oauth_device_codes_user_id_index" ON "oauth_device_codes"("user_id");

-- CreateIndex
CREATE INDEX "oauth_refresh_tokens_access_token_id_index" ON "oauth_refresh_tokens"("access_token_id");

-- CreateIndex
CREATE INDEX "password_resets_email_index" ON "password_resets"("email");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_guard_name_unique" ON "permissions"("name", "guard_name");

-- CreateIndex
CREATE UNIQUE INDEX "personal_access_tokens_token_unique" ON "personal_access_tokens"("token");

-- CreateIndex
CREATE INDEX "personal_access_tokens_tokenable_type_tokenable_id_index" ON "personal_access_tokens"("tokenable_type", "tokenable_id");

-- CreateIndex
CREATE INDEX "alerts_data_alert_type_index" ON "alerts_data"("alert_type");

-- CreateIndex
CREATE INDEX "alerts_data_alert_type_status_index" ON "alerts_data"("alert_type", "status");

-- CreateIndex
CREATE INDEX "alerts_data_fetched_at_index" ON "alerts_data"("fetched_at");

-- CreateIndex
CREATE INDEX "alerts_data_gps_time_utc_index" ON "alerts_data"("gps_time_utc");

-- CreateIndex
CREATE INDEX "alerts_data_status_index" ON "alerts_data"("status");

-- CreateIndex
CREATE INDEX "alerts_data_unit_name_index" ON "alerts_data"("unit_name");

-- CreateIndex
CREATE INDEX "alerts_data_unit_uid_gps_time_utc_index" ON "alerts_data"("unit_uid", "gps_time_utc");

-- CreateIndex
CREATE INDEX "alerts_data_unit_uid_index" ON "alerts_data"("unit_uid");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_guard_name_unique" ON "roles"("name", "guard_name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_unique" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vin_number_unique" ON "vehicles"("vin_number");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_unique" ON "vehicles"("uid");

-- AddForeignKey
ALTER TABLE "driver_operators" ADD CONSTRAINT "driver_operators_vehicle_id_foreign" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "fuel_expense_log" ADD CONSTRAINT "fuel_expense_log_fuel_request_id_foreign" FOREIGN KEY ("fuel_request_id") REFERENCES "fuel_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_driver_id_foreign" FOREIGN KEY ("driver_id") REFERENCES "driver_operators"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_vehicle_id_foreign" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "fuel_request" ADD CONSTRAINT "fuel_request_vehicle_id_foreign" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "incident_reports" ADD CONSTRAINT "incident_reports_driver_id_foreign" FOREIGN KEY ("driver_id") REFERENCES "driver_operators"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "incident_reports" ADD CONSTRAINT "incident_reports_vehicle_id_foreign" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "insurance" ADD CONSTRAINT "insurance_vehicle_id_foreign" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "maintenance_history" ADD CONSTRAINT "maintenance_history_mechanic_id_fkey" FOREIGN KEY ("mechanic_id") REFERENCES "mechanics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "maintenance_history" ADD CONSTRAINT "maintenance_history_vehicle_id_foreign" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "maintenance_history" ADD CONSTRAINT "maintenance_history_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "maintenance_schedule" ADD CONSTRAINT "maintenance_schedule_vehicle_id_foreign" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mechanics" ADD CONSTRAINT "mechanics_workshop_id_foreign" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "model" ADD CONSTRAINT "model_vehicle_make_id_fkey" FOREIGN KEY ("vehicle_make_id") REFERENCES "vehicle_makes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "model_has_permissions" ADD CONSTRAINT "model_has_permissions_permission_id_foreign" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "model_has_roles" ADD CONSTRAINT "model_has_roles_role_id_foreign" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "repair_history" ADD CONSTRAINT "repair_history_vehicle_id_foreign" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "repair_request" ADD CONSTRAINT "repair_request_vehicle_id_foreign" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "repair_request" ADD CONSTRAINT "repair_request_workshop_id_foreign" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "repair_schedule" ADD CONSTRAINT "repair_schedule_assigned_technician_foreign" FOREIGN KEY ("assigned_technician") REFERENCES "mechanics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "repair_schedule" ADD CONSTRAINT "repair_schedule_repair_request_id_foreign" FOREIGN KEY ("repair_request_id") REFERENCES "repair_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "role_has_permissions" ADD CONSTRAINT "role_has_permissions_permission_id_foreign" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "role_has_permissions" ADD CONSTRAINT "role_has_permissions_role_id_foreign" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "spare_part_dispatch" ADD CONSTRAINT "spare_part_dispatch_spare_part_request_id_foreign" FOREIGN KEY ("spare_part_request_id") REFERENCES "spare_part_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "spare_part_inventory_log" ADD CONSTRAINT "spare_part_inventory_log_spare_part_inventory_id_foreign" FOREIGN KEY ("spare_part_inventory_id") REFERENCES "spare_part_inventory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "spare_part_receipt" ADD CONSTRAINT "spare_part_receipt_spare_part_dispatch_id_foreign" FOREIGN KEY ("spare_part_dispatch_id") REFERENCES "spare_part_dispatch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "spare_part_receipt" ADD CONSTRAINT "spare_part_receipt_vehicle_id_foreign" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "spare_part_request" ADD CONSTRAINT "spare_part_request_spare_part_inventory_id_foreign" FOREIGN KEY ("spare_part_inventory_id") REFERENCES "spare_part_inventory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "spare_part_request" ADD CONSTRAINT "spare_part_request_vehicle_id_foreign" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vehicle_dispatch" ADD CONSTRAINT "vehicle_dispatch_vehicle_id_foreign" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vehicle_reservation" ADD CONSTRAINT "vehicle_reservation_vehicle_id_foreign" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_make_id_fkey" FOREIGN KEY ("make_id") REFERENCES "vehicle_makes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_spcode_fkey" FOREIGN KEY ("spcode") REFERENCES "subsidiary"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "vehicle_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workshops" ADD CONSTRAINT "workshops_supervisor_id_foreign" FOREIGN KEY ("supervisor_id") REFERENCES "supervisors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

