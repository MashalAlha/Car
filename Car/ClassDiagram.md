classDiagram
    class User {
        +int id
        +String username
        +String email
        +String password
        +String role
        +String phone
        +String otp
        +bool is_verified
        +bool is_superuser
        +bool is_staff
        +bool is_active
        +datetime date_joined
        +datetime last_login
    }

    class Car {
        +int id
        +String make
        +String model
        +int year
        +String body_type
        +String category_tier
        +String description
        +JSON specs
        +bool is_for_sale
        +Decimal price
        +bool is_for_rent
        +Decimal daily_rent_price
        +String image_url
        +datetime created_at
    }

    class CarImage {
        +int id
        +int car_id
        +String image
        +bool is_primary
        +datetime created_at
    }

    class Purchase {
        +int id
        +int car_id
        +int user_id
        +int approved_by_id
        +Decimal price_paid
        +String status
        +String payment_method
        +bool payment_status
        +String transaction_id
        +datetime purchase_date
        +date delivery_date
        +time delivery_time
        +Text contract_notes
        +Text rejection_reason
    }

    class Rental {
        +int id
        +int car_id
        +int user_id
        +date start_date
        +date end_date
        +Decimal total_price
        +String status
        +String payment_method
        +bool payment_status
        +String transaction_id
        +bool engine_status
        +float geofence_radius
        +float last_lat
        +float last_lng
    }

    class TrustRequest {
        +int id
        +int user_id
        +String license_number
        +date expiry_date
        +String license_photo
        +String status
        +Text rejection_reason
        +datetime created_at
    }

    class Review {
        +int id
        +int user_id
        +int content_type_id
        +int object_id
        +int rating
        +Text comment
        +datetime created_at
    }

    class Favorite {
        +int id
        +int user_id
        +int content_type_id
        +int object_id
        +datetime created_at
    }

    class ConciergeMessage {
        +int id
        +int user_id
        +String name
        +String email
        +String subject
        +Text message
        +Text admin_reply
        +String status
        +datetime created_at
        +datetime updated_at
    }

    class PartCategory {
        +int id
        +String name
        +Text description
    }

    class Part {
        +int id
        +int category_id
        +String name
        +String sku
        +String brand
        +String car_make
        +String car_model
        +int model_year
        +Decimal price
        +int stock_quantity
        +String image
        +bool is_accessory
        +bool installation_available
    }

    class CarModelLookup {
        +int id
        +String make
        +String model
        +int year_start
        +int year_end
    }

    class StoreOrder {
        +int id
        +int user_id
        +int workshop_appointment_id
        +Decimal total_price
        +Decimal workshop_fee
        +String status
        +bool requires_installation
        +String payment_transaction_id
        +datetime created_at
    }

    class OrderItem {
        +int id
        +int order_id
        +int part_id
        +int quantity
        +Decimal price_at_time
    }

    class Workshop {
        +int id
        +int manager_id
        +String name
        +String category
        +String service_location_type
        +String working_days
        +String working_hours
        +Decimal mobile_fee
        +Decimal on_site_fee
    }

    class ServiceType {
        +int id
        +String name
        +Text description
        +String workshop_category
        +Decimal base_price
        +Decimal estimated_duration_hours
    }

    class Worker {
        +int id
        +int workshop_id
        +String name
        +String specialty
        +String phone
        +bool is_active
        +datetime created_at
    }

    class Appointment {
        +int id
        +int customer_id
        +int workshop_id
        +int service_id
        +date scheduled_date
        +time scheduled_time
        +bool is_home_service
        +String gps_coordinates
        +Text address_notes
        +String status
        +String payment_status
        +String payment_transaction_id
        +Decimal total_amount
        +datetime created_at
    }

    class WorkOrder {
        +int id
        +int appointment_id
        +int assigned_technician_id
        +int workshop_id
        +String status
        +Text manager_notes
        +Text technician_notes
        +Decimal additional_parts_cost
        +Decimal unforeseen_costs
    }

    class WorkOrderPart {
        +int id
        +int work_order_id
        +int part_id
        +int quantity
        +Decimal price_at_time
    }

    class Notification {
        +int id
        +int user_id
        +String title
        +Text message
        +String type
        +bool is_read
        +datetime created_at
    }

    class SupportTicket {
        +int id
        +int user_id
        +String subject
        +Text description
        +String status
        +Text admin_reply
        +datetime created_at
        +datetime updated_at
    }

    class AdBanner {
        +int id
        +String title
        +String image_url
        +String hyperlink
        +bool is_active
        +datetime created_at
    }

    %% User Relationships
    User "1" --> "0..*" Purchase : buys
    User "1" --> "0..*" Purchase : approves
    User "1" --> "0..*" Rental : rents
    User "1" --> "0..*" TrustRequest : submits
    User "1" --> "0..*" Review : writes
    User "1" --> "0..*" Favorite : saves
    User "1" --> "0..*" ConciergeMessage : sends
    User "1" --> "0..*" StoreOrder : places
    User "1" --> "0..*" Appointment : books
    User "1" --> "0..*" Notification : receives
    User "1" --> "0..*" SupportTicket : raises
    User "1" --> "0..*" Workshop : manages

    %% Car Relationships
    Car "1" --> "0..*" CarImage : has
    Car "1" --> "0..*" Purchase : purchased via
    Car "1" --> "0..*" Rental : rented via

    %% Store Relationships
    PartCategory "1" --> "0..*" Part : categorizes
    Part "0..*" --> "0..*" CarModelLookup : compatible with
    StoreOrder "1" --> "0..*" OrderItem : contains
    Part "1" --> "0..*" OrderItem : included in
    Appointment "1" --> "0..1" StoreOrder : linked to

    %% Workshop Relationships
    Workshop "1" --> "0..*" Worker : employs
    Workshop "1" --> "0..*" Appointment : hosts
    ServiceType "1" --> "0..*" Appointment : defines
    Appointment "1" --> "0..1" WorkOrder : generates
    Worker "1" --> "0..*" WorkOrder : assigned to
    Workshop "1" --> "0..*" WorkOrder : handled by
    WorkOrder "1" --> "0..*" WorkOrderPart : uses
    Part "1" --> "0..*" WorkOrderPart : used in
