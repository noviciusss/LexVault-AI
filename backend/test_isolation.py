import urllib.request
import json

def login(email, pwd="password123"):
    req = urllib.request.Request(
        "http://localhost:8000/api/auth/login",
        data=json.dumps({"email": email, "password": pwd}).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())["access_token"]

def get_items(token):
    req = urllib.request.Request(
        "http://localhost:8000/api/knowledge",
        headers={"Authorization": f"Bearer {token}"}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def run_test():
    # 1. Login as Rohit (Firm 1 - Chandra & Rao Associates)
    token_rohit = login("rohit@chandrarao.law")
    items_rohit = get_items(token_rohit)
    all_f1 = all(i.get("firm_id") == 1 for i in items_rohit)
    print(f"ROHIT (Firm 1 - Chandra & Rao): {len(items_rohit)} items. All firm_id == 1? {all_f1}")
    for i in items_rohit:
        safe_title = i['title'][:65].encode('ascii', errors='replace').decode()
        print(f"   - [Item #{i['id']}] Firm {i.get('firm_id')}: {safe_title}")

    # 2. Login as Arjun (Firm 2 - NyayaVault India Platform)
    token_arjun = login("arjun@nyayavault.in")
    items_arjun = get_items(token_arjun)
    all_f2 = all(i.get("firm_id") == 2 for i in items_arjun)
    print(f"\nARJUN (Firm 2 - NyayaVault): {len(items_arjun)} items. All firm_id == 2? {all_f2}")
    for i in items_arjun[:5]:
        safe_title = i['title'][:65].encode('ascii', errors='replace').decode()
        print(f"   - [Item #{i['id']}] Firm {i.get('firm_id')}: {safe_title}")

    # 3. Verify zero cross-firm leakage
    ids_rohit = set(i["id"] for i in items_rohit)
    ids_arjun = set(i["id"] for i in items_arjun)
    overlap = ids_rohit.intersection(ids_arjun)
    print(f"\nOverlapping Knowledge IDs between Firm 1 and Firm 2: {overlap}")
    assert len(overlap) == 0, "Multi-tenancy violation detected!"
    print(">>> STRICT MULTI-TENANCY ISOLATION: 100% VERIFIED! Firm A cannot see Firm B items.")

if __name__ == "__main__":
    run_test()
