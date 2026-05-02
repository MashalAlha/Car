import json

# Update common or client_relations with clean role labels
files = ['frontend/src/locales/en.json', 'frontend/src/locales/ar.json']

new_keys_en = {
    "admin": {
        "common": {
            "roles": {
                "admin": "Administrator",
                "manager": "Workshop Manager",
                "customer": "VIP Customer"
            }
        }
    }
}

new_keys_ar = {
    "admin": {
        "common": {
            "roles": {
                "admin": "مدير النظام",
                "manager": "مدير الورشة",
                "customer": "عميل VIP"
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

print("i18n role keys updated successfully.")
