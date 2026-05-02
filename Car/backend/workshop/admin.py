from django.contrib import admin

from .models import Workshop, ServiceType, Appointment, WorkOrder, Worker

@admin.register(Workshop)
class WorkshopAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'manager', 'service_location_type')

@admin.register(Worker)
class WorkerAdmin(admin.ModelAdmin):
    list_display = ('name', 'workshop', 'specialty', 'is_active')
    list_filter = ('workshop', 'specialty', 'is_active')

admin.site.register(ServiceType)
admin.site.register(Appointment)
admin.site.register(WorkOrder)
