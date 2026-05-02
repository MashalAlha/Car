flowchart LR
    %% ── Actors (left) ──
    Guest(["👤 Guest"])
    Client(["👤 Client"])
    Admin(["👤 Admin"])
    Manager(["👤 Workshop\nManager"])

    %% ── Actor Inheritance ──
    Guest -->|"&lt;&lt;extends&gt;&gt;"| Client
    Client -->|"&lt;&lt;extends&gt;&gt;"| Admin
    Client -->|"&lt;&lt;extends&gt;&gt;"| Manager

    %% ══════════════════════════════════════════════
    subgraph SYSTEM ["🏎️  Exotic Motors Platform"]
    %% ══════════════════════════════════════════════

        %% ── AUTH ──
        UC1(["Register"])
        UC2(["Login"])
        UC3(["Admin Login"])
        UC4(["Logout"])
        UC5(["Maintain Session"])
        UC6(["Role-Based Access Control"])

        %% ── PUBLIC ──
        UC7(["View Home Page"])
        UC8(["Browse Car Catalog"])
        UC9(["Search Catalog"])
        UC10(["View Vehicle Details"])
        UC11(["View Store Catalog"])
        UC12(["View Part Details"])
        UC13(["Workshop Status Inquiry"])
        UC14(["View Support Center"])
        UC15(["Toggle Language EN/AR"])

        %% ── CLIENT DASHBOARD ──
        UC16(["View Profile"])
        UC17(["Edit Profile"])
        UC18(["Submit ID Verification"])
        UC19(["Manage Favorites"])
        UC20(["View My Purchases"])
        UC21(["Download Purchase Contract PDF"])
        UC22(["View My Rentals"])
        UC23(["View My Appointments"])
        UC24(["View My Store Orders"])
        UC25(["View Financial History"])
        UC26(["Send Concierge Message"])
        UC27(["View Concierge Responses"])

        %% ── TRANSACTIONS ──
        UC28(["Initiate Vehicle Purchase"])
        UC29(["Request VIP Rental"])
        UC30(["Book Workshop Service"])
        UC31(["Select Service Location"])
        UC32(["Manage Cart"])
        UC33(["Finalize Store Purchase"])

        %% ── ADMIN DASHBOARD ──
        UC34(["View Executive Dashboard"])
        UC35(["View Real-Time Revenue"])
        UC36(["Monitor Active Users"])
        UC37(["Track Inventory Velocity"])
        UC38(["View Activity Stream"])
        UC39(["Manual Telemetry Refresh"])

        %% ── VEHICLE MGMT ──
        UC40(["Manage Vehicle Inventory"])
        UC41(["Add New Vehicle"])
        UC42(["Edit Vehicle Metadata"])
        UC43(["Delete Vehicle"])
        UC44(["Toggle Vehicle Availability"])
        UC45(["Manage Vehicle Images"])

        %% ── RENTAL MGMT ──
        UC46(["Manage Rental Requests"])
        UC47(["Approve Rental"])
        UC48(["Reject Rental"])
        UC49(["Mark Rental Completed"])
        UC50(["Live GPS Tracking"])
        UC51(["Monitor Engine Health"])
        UC52(["Remote Engine Control"])

        %% ── PURCHASE MGMT ──
        UC53(["Manage Purchase Requests"])
        UC54(["Approve Acquisition"])
        UC55(["Reject Acquisition"])
        UC56(["Schedule Delivery"])
        UC57(["Manage Purchase Contract"])

        %% ── CRM ──
        UC58(["Manage User Directory"])
        UC59(["Create / Edit / Delete User"])
        UC60(["Role Promotion / Demotion"])
        UC61(["Review Identity Documents"])
        UC62(["Approve / Reject Verification"])

        %% ── WORKSHOP OPS ──
        UC63(["Manage Service Appointments"])
        UC64(["Assign Technician"])
        UC65(["Update Service Status"])
        UC66(["Record Notes & Costs"])

        %% ── STORE MGMT ──
        UC67(["Manage Store Catalog"])
        UC68(["Add / Edit / Delete Part"])
        UC69(["Update Pricing & Stock"])
        UC70(["Categorize Items"])

        %% ── SETTINGS ──
        UC71(["Admin Settings"])
        UC72(["Site Metadata & Mode"])
        UC73(["Theme & Custom Styling"])
        UC74(["View Security Logs"])
        UC75(["Manage Localization Keys"])

        %% ════════════════════════════
        %% include / extend relationships
        %% ════════════════════════════

        %% Auth includes
        UC2 -.->|"&lt;&lt;include&gt;&gt;"| UC5
        UC3 -.->|"&lt;&lt;include&gt;&gt;"| UC5
        UC3 -.->|"&lt;&lt;include&gt;&gt;"| UC6

        %% Search extends Browse
        UC9 -.->|"&lt;&lt;extend&gt;&gt;"| UC8

        %% Vehicle details extends browse
        UC10 -.->|"&lt;&lt;extend&gt;&gt;"| UC8

        %% Part details extends store catalog
        UC12 -.->|"&lt;&lt;extend&gt;&gt;"| UC11

        %% Purchase contract extends view purchases
        UC21 -.->|"&lt;&lt;extend&gt;&gt;"| UC20

        %% Concierge response extends send message
        UC27 -.->|"&lt;&lt;extend&gt;&gt;"| UC26

        %% Rental request includes select service location
        UC30 -.->|"&lt;&lt;include&gt;&gt;"| UC31

        %% Finalize store purchase includes manage cart
        UC33 -.->|"&lt;&lt;include&gt;&gt;"| UC32

        %% Executive dashboard includes sub-metrics
        UC34 -.->|"&lt;&lt;include&gt;&gt;"| UC35
        UC34 -.->|"&lt;&lt;include&gt;&gt;"| UC36
        UC34 -.->|"&lt;&lt;include&gt;&gt;"| UC37
        UC34 -.->|"&lt;&lt;include&gt;&gt;"| UC38
        UC39 -.->|"&lt;&lt;extend&gt;&gt;"| UC34

        %% Vehicle inventory includes sub-cases
        UC40 -.->|"&lt;&lt;include&gt;&gt;"| UC41
        UC40 -.->|"&lt;&lt;include&gt;&gt;"| UC42
        UC40 -.->|"&lt;&lt;include&gt;&gt;"| UC43
        UC40 -.->|"&lt;&lt;include&gt;&gt;"| UC44
        UC40 -.->|"&lt;&lt;include&gt;&gt;"| UC45

        %% Rental management includes sub-cases
        UC46 -.->|"&lt;&lt;include&gt;&gt;"| UC47
        UC46 -.->|"&lt;&lt;include&gt;&gt;"| UC48
        UC46 -.->|"&lt;&lt;include&gt;&gt;"| UC49
        UC50 -.->|"&lt;&lt;extend&gt;&gt;"| UC46
        UC51 -.->|"&lt;&lt;extend&gt;&gt;"| UC46
        UC52 -.->|"&lt;&lt;extend&gt;&gt;"| UC51

        %% Purchase management includes sub-cases
        UC53 -.->|"&lt;&lt;include&gt;&gt;"| UC54
        UC53 -.->|"&lt;&lt;include&gt;&gt;"| UC55
        UC56 -.->|"&lt;&lt;extend&gt;&gt;"| UC54
        UC57 -.->|"&lt;&lt;extend&gt;&gt;"| UC54

        %% User management includes sub-cases
        UC58 -.->|"&lt;&lt;include&gt;&gt;"| UC59
        UC60 -.->|"&lt;&lt;extend&gt;&gt;"| UC59
        UC61 -.->|"&lt;&lt;include&gt;&gt;"| UC62

        %% Workshop includes sub-cases
        UC63 -.->|"&lt;&lt;include&gt;&gt;"| UC64
        UC63 -.->|"&lt;&lt;include&gt;&gt;"| UC65
        UC66 -.->|"&lt;&lt;extend&gt;&gt;"| UC63

        %% Store management includes sub-cases
        UC67 -.->|"&lt;&lt;include&gt;&gt;"| UC68
        UC67 -.->|"&lt;&lt;include&gt;&gt;"| UC69
        UC70 -.->|"&lt;&lt;extend&gt;&gt;"| UC67

        %% Admin settings includes sub-cases
        UC71 -.->|"&lt;&lt;include&gt;&gt;"| UC72
        UC71 -.->|"&lt;&lt;include&gt;&gt;"| UC73
        UC74 -.->|"&lt;&lt;extend&gt;&gt;"| UC71
        UC75 -.->|"&lt;&lt;extend&gt;&gt;"| UC71

        %% ID Verification extends profile
        UC18 -.->|"&lt;&lt;extend&gt;&gt;"| UC16

    end

    %% ── Actor → Use Case connections ──
    Guest --> UC1
    Guest --> UC2
    Guest --> UC7
    Guest --> UC8
    Guest --> UC9
    Guest --> UC10
    Guest --> UC11
    Guest --> UC12
    Guest --> UC13
    Guest --> UC14
    Guest --> UC15

    Client --> UC4
    Client --> UC16
    Client --> UC17
    Client --> UC18
    Client --> UC19
    Client --> UC20
    Client --> UC21
    Client --> UC22
    Client --> UC23
    Client --> UC24
    Client --> UC25
    Client --> UC26
    Client --> UC27
    Client --> UC28
    Client --> UC29
    Client --> UC30
    Client --> UC32
    Client --> UC33

    Admin --> UC3
    Admin --> UC34
    Admin --> UC40
    Admin --> UC46
    Admin --> UC53
    Admin --> UC58
    Admin --> UC61
    Admin --> UC67
    Admin --> UC71

    Manager --> UC63
    Manager --> UC46
    Manager --> UC50
    Manager --> UC51
    Manager --> UC52
