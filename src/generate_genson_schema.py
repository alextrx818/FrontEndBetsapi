import requests
from genson import SchemaBuilder
import json

# Fetch raw JSON data
response = requests.get('http://localhost:8000/api/tennis/raw')
if response.status_code != 200:
    raise Exception(f'Failed to fetch data: {response.status_code}')

raw_data = response.json()

# Generate JSON schema using Genson
builder = SchemaBuilder()
builder.add_object(raw_data)
schema = builder.to_schema()

# Save schema to file
with open('genson_schema.json', 'w') as f:
    json.dump(schema, f, indent=2)

print('JSON schema generated and saved to genson_schema.json')