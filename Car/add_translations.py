import json
import os

en_file = 'frontend/src/locales/en.json'
ar_file = 'frontend/src/locales/ar.json'

with open(en_file, 'r', encoding='utf-8') as f:
    en_data = json.load(f)
with open(ar_file, 'r', encoding='utf-8') as f:
    ar_data = json.load(f)

en_admin_dict = {
  "sidebar": {
    "management": "Management",
    "welcome": "Welcome,",
    "modules": "Modules",
    "exec_overview": "Executive Overview",
    "inventory_app": "Inventory App",
    "rental_dispatch": "Rental Dispatch",
    "client_relations": "Client Relations",
    "workshop_control": "Workshop Control",
    "settings": "Settings",
    "visit_site": "Visit Live Site",
    "terminate_session": "Terminate Session"
  },
  "admin_dashboard": {
    "title": "Executive Overview",
    "subtitle": "High-level metrics and platform performance analytics.",
    "revenue": "Total Revenue",
    "active_users": "Active Users",
    "vehicles_sold": "Vehicles Sold",
    "platform_uptime": "Platform Uptime",
    "stable": "Stable",
    "revenue_trajectory": "Revenue Trajectory",
    "ytd_growth": "YTD Growth",
    "chart_pending": "[ Analytics Chart Rendering Engine Pending ]",
    "recent_activity": "Recent Activity",
    "ago": "ago",
    "mins": "mins",
    "hour": "hour",
    "hours": "hours",
    "day": "day"
  },
  "inventory": {
    "title": "Inventory Management",
    "subtitle": "Add, update, and remove vehicles from the global showroom.",
    "add_vehicle": "Add New Vehicle",
    "search_placeholder": "Search make or model...",
    "loading": "Loading inventory data...",
    "col_vehicle": "Vehicle",
    "col_specs": "Specs Summary",
    "col_status": "Listing Status",
    "col_pricing": "Pricing",
    "col_actions": "Actions",
    "color": "Color:",
    "engine": "Engine:",
    "for_sale": "For Sale",
    "for_rent": "For Rent",
    "unlisted": "Unlisted",
    "buy": "Buy:",
    "rent": "Rent:",
    "day": "/day",
    "edit": "Edit",
    "delete": "Delete",
    "modal_title": "Catalog New Vehicle",
    "core_identity": "Core Identity",
    "make": "Make",
    "model": "Model",
    "year": "Year",
    "tech_specs": "Technical Specifications",
    "exterior_color": "Exterior Color",
    "0_to_60": "0 to 60 mph",
    "top_speed": "Top Speed",
    "media_desc": "Media & Description",
    "img_url": "Primary Image URL",
    "desc_label": "Listing Description",
    "comm_config": "Commercial Configuration",
    "avail_purchase": "Available for Purchase",
    "sale_price": "Sale Price ($)",
    "avail_rent": "Available for VIP Rental",
    "daily_rate": "Daily Rate ($)",
    "cancel": "Cancel",
    "commit": "Commit to Inventory",
    "confirm_delete": "Are you sure you want to delete this vehicle from inventory?"
  },
  "rental_dispatch": {
    "title": "VIP Rental Requests",
    "subtitle": "Review, approve, and manage customer vehicle reservations.",
    "loading": "Loading rental dispatch ledger...",
    "no_rentals": "No active rental requests found in the ledger.",
    "renter_id": "Renter ID:",
    "vip": "VIP Customer",
    "vehicle_id": "Vehicle ID:",
    "reservation_total": "Reservation Total:",
    "duration": "Duration",
    "to": "to",
    "approve": "Approve",
    "reject": "Reject",
    "mark_completed": "Mark Returned / Completed",
    "active": "active",
    "approved": "approved",
    "completed": "completed",
    "rejected": "rejected"
  },
  "client_relations": {
    "title": "Client & Staff Relations",
    "subtitle": "Manage platform accounts, monitor verification status, and assign administrative privileges.",
    "loading": "Loading identity registry...",
    "col_identifier": "Identifier",
    "col_contact": "Contact Protocol",
    "col_security": "Security Level",
    "col_access": "Access Control",
    "uid": "UID:",
    "no_phone": "No phone registered",
    "verified": "Verified",
    "unverified": "Unverified",
    "role_customer": "Demote to Customer",
    "role_manager": "Set to Workshop Manager",
    "role_admin": "Promote to Super Admin",
    "cant_demote_self": "You cannot demote yourself."
  },
  "workshop_dashboard": {
    "title": "Executive Workshop Control",
    "subtitle": "Live overview of service bays and technician dispatches.",
    "live_sync": "Live Sync",
    "active_orders": "Active Orders",
    "pending_assign": "Pending Assignment",
    "techs_avail": "Techs Available",
    "requisitions": "Active Requisitions",
    "view_all": "View All"
  }
}

ar_admin_dict = {
  "sidebar": {
    "management": "الإدارة",
    "welcome": "مرحباً،",
    "modules": "الوحدات",
    "exec_overview": "النظرة العامة",
    "inventory_app": "إدارة المخزون",
    "rental_dispatch": "إدارة الإيجارات",
    "client_relations": "علاقات العملاء",
    "workshop_control": "إدارة الورشة",
    "settings": "الإعدادات",
    "visit_site": "زيارة الموقع الحي",
    "terminate_session": "إنهاء الجلسة"
  },
  "admin_dashboard": {
    "title": "النظرة التنفيذية العامة",
    "subtitle": "مقاييس عالية المستوى وتحليلات أداء المنصة.",
    "revenue": "إجمالي الإيرادات",
    "active_users": "المستخدمون النشطون",
    "vehicles_sold": "السيارات المباعة",
    "platform_uptime": "استقرار المنصة",
    "stable": "مستقر",
    "revenue_trajectory": "مسار الإيرادات",
    "ytd_growth": "النمو منذ بداية العام",
    "chart_pending": "[ محرك تصيير التحليلات قيد الانتظار ]",
    "recent_activity": "النشاطات الأخيرة",
    "ago": "مضت",
    "mins": "دقائق",
    "hour": "ساعة",
    "hours": "ساعات",
    "day": "يوم"
  },
  "inventory": {
    "title": "إدارة المخزون",
    "subtitle": "إضافة وتحديث وإزالة المركبات من صالة العرض العالمية.",
    "add_vehicle": "إضافة مركبة جديدة",
    "search_placeholder": "ابحث عن صانع أو موديل...",
    "loading": "جارٍ تحميل بيانات المخزون...",
    "col_vehicle": "المركبة",
    "col_specs": "ملخص المواصفات",
    "col_status": "حالة الإدراج",
    "col_pricing": "التسعير",
    "col_actions": "الإجراءات",
    "color": "اللون:",
    "engine": "المحرك:",
    "for_sale": "للبيع",
    "for_rent": "للإيجار",
    "unlisted": "غير مدرج",
    "buy": "شراء:",
    "rent": "إيجار:",
    "day": "/يوم",
    "edit": "تعديل",
    "delete": "حذف",
    "modal_title": "فهرسة مركبة جديدة",
    "core_identity": "الهوية الأساسية",
    "make": "الصانع",
    "model": "الموديل",
    "year": "السنة",
    "tech_specs": "المواصفات الفنية",
    "exterior_color": "اللون الخارجي",
    "0_to_60": "من 0 إلى 60 ميل",
    "top_speed": "السرعة القصوى",
    "media_desc": "الوسائط والوصف",
    "img_url": "رابط الصورة الأساسية",
    "desc_label": "وصف الإدراج",
    "comm_config": "التكوين التجاري",
    "avail_purchase": "متاحة للشراء",
    "sale_price": "سعر البيع ($)",
    "avail_rent": "متاحة للإيجار المميز",
    "daily_rate": "المعدل اليومي ($)",
    "cancel": "إلغاء",
    "commit": "تأكيد في المخزون",
    "confirm_delete": "هل أنت متأكد من رغبتك في حذف هذه المركبة من المخزون؟"
  },
  "rental_dispatch": {
    "title": "طلبات إيجار VIP",
    "subtitle": "مراجعة والموافقة وإدارة حجوزات مركبات العملاء.",
    "loading": "جارٍ تحميل سجل الإيجارات...",
    "no_rentals": "لا توجد طلبات إيجار نشطة.",
    "renter_id": "معرف المستأجر:",
    "vip": "عميل متميز (VIP)",
    "vehicle_id": "معرف المركبة:",
    "reservation_total": "إجمالي الحجز:",
    "duration": "المدة",
    "to": "إلى",
    "approve": "موافقة",
    "reject": "رفض",
    "mark_completed": "اكتمل / تم الإرجاع",
    "active": "نشط",
    "approved": "مُعْتَمَد",
    "completed": "مُكتمل",
    "rejected": "مرفوض"
  },
  "client_relations": {
    "title": "علاقات العملاء والموظفين",
    "subtitle": "إدارة حسابات المنصة، مراقبة حالة التحقق، وتعيين الصلاحيات الإدارية.",
    "loading": "جارٍ تحميل سجل الهويات...",
    "col_identifier": "المُعرّف",
    "col_contact": "بروتوكول الاتصال",
    "col_security": "مستوى الأمان",
    "col_access": "التحكم في الوصول",
    "uid": "معرف مستخدم:",
    "no_phone": "لا يوجد هاتف مسجل",
    "verified": "مُوثّق",
    "unverified": "غير مُوثّق",
    "role_customer": "تخفيض إلى عميل",
    "role_manager": "تعيين مدير ورشة",
    "role_admin": "ترقية إلى مسؤول علوي",
    "cant_demote_self": "لا يمكنك تخفيض رتبتك."
  },
  "workshop_dashboard": {
    "title": "التحكم التنفيذي في الورشة",
    "subtitle": "نظرة مباشرة على محطات الخدمة وإدارة الفنيين.",
    "live_sync": "مزامنة حية",
    "active_orders": "الطلبات النشطة",
    "pending_assign": "في انتظار التعيين",
    "techs_avail": "الفنيون المتاحون",
    "requisitions": "الطلبات الحالية",
    "view_all": "مشاهدة الكل"
  }
}

en_data['admin'] = en_admin_dict
ar_data['admin'] = ar_admin_dict

with open(en_file, 'w', encoding='utf-8') as f:
    json.dump(en_data, f, indent=2, ensure_ascii=False)
with open(ar_file, 'w', encoding='utf-8') as f:
    json.dump(ar_data, f, indent=2, ensure_ascii=False)

print("Translation dictionaries updated successfully!")
