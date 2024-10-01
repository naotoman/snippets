import json

import boto3

s3 = boto3.client("s3")

# Get this beforehand by calling the eBay API
# https://developer.ebay.com/api-docs/sell/metadata/resources/marketplace/methods/getItemConditionPolicies
with open("category-conditions.json", "r") as f:
    data = json.load(f)

total = len(data["itemConditionPolicies"])
print(f"total: {total}")

for i, node in enumerate(data["itemConditionPolicies"]):
    if i % (total // 10) == 0:
        print(f"{i}/{total}")
    category_id = node["categoryId"]
    content = json.dumps(node, ensure_ascii=False, indent=2)
    s3.put_object(
        Body=content,
        Bucket="naoto-dev-private",
        Key=f"emz/conditions/{category_id}.json",
    )
