import json

files = ['frontend/src/locales/en.json', 'frontend/src/locales/ar.json']

new_keys_en = {
    "admin": {
        "common": {
            "filters": {
                "all_statuses": "All Statuses",
                "all_roles": "All Roles",
                "all_types": "All Types",
                "search_placeholder": "Search...",
                "filter_by": "Filter by"
            }
        }
    }
}

new_keys_ar = {
    "admin": {
        "common": {
            "filters": {
                "all_statuses": "جميع الحالات",
                "all_roles": "جميع الأدوار",
                "all_types": "جميع الأنواع",
                "search_placeholder": "بحث...",
                "filter_by": "تصفية حسب"
            }
        }
    }
}

def deep_update(mapping, *updating_mappings):
    updated_mapping = mapping.copy()
    for updating_mapping in updating_mappings:
        for k, v in updating_mapping.items():
            if k in updated_mapping and isinstance(updated_mapping[k], dict) and isinstance(v, dict):
                updated_mapping[k] = deep_update(updated_mapping[k], v)
            else:
                updated_mapping[k] = v
    return updated_mapping

# Update EN
with open(files[0], 'r', encoding='utf-8') as f:
    en_data = json.load(f)
en_data = deep_update(en_data, new_keys_en)
with open(files[0], 'w', encoding='utf-8') as f:
    json.dump(en_data, f, indent=2, ensure_ascii=False)

# Update AR
with open(files[1], 'r', encoding='utf-8') as f:
    ar_data = json.load(f)
ar_data = deep_update(ar_data, new_keys_ar)
with open(files[1], 'w', encoding='utf-8') as f:
    json.dump(ar_data, f, indent=2, ensure_ascii=False)

print("i18n filters updated successfully.")
