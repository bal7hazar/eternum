# Made by @bal7hazar

import json
from pathlib import Path

path = Path(__file__).parent / "realms.json"

resources_stats = dict()
total_resources = 0

with open(path, "r") as f:
    data = json.load(f)

for index in range(len(data)):
    realm = data[f"{index + 1}"]
    for attribute in realm["attributes"]:
        if attribute["trait_type"] == "Resource":
            # occurences per resources
            resources_stats[attribute["value"]] = resources_stats.get(attribute["value"], 0) + 1
            total_resources += 1

# Sort resources by occurences and store in a list
resources = sorted(resources_stats.keys(), key=lambda x: resources_stats[x], reverse=True)
resources = ['Wood', 'Stone', 'Coal', 'Copper', 'Obsidian', 'Silver', 'Ironwood', 'Cold Iron', 'Gold', 'Hartwood', 'Diamonds', 'Sapphire', 'Ruby', 'Deep Crystal', 'Ignium', 'Ethereal Silica', 'True Ice', 'Twilight Quartz', 'Alchemical Silver', 'Adamantine', 'Mithral', 'Dragonhide']
print(resources)

# Sort realms by consecutive resources, the most rare resource first
# For instance, the Realm with last 3 resources in resources list is the most rare than the one with first 3,
# and the one with the first and the 3rd but not the second is disqualified because it does not have consecutive resources
realms = dict()
for key in data.keys():
    realm = data[key]
    realm_resources = list() 
    for attribute in realm["attributes"]:
        if attribute["trait_type"] == "Resource":
            realm_resources.append(attribute["value"])
    # sort realm_resources by occurences
    realm_resources = sorted(realm_resources, key=lambda x: resources_stats[x], reverse=True)
    # check the longest consecutive resources, the chain could not include the first for instance
    chain_length = 0
    chains = [[resources.index(realm_resources[0])]]
    for resource in realm_resources[1:]:
        index = resources.index(resource)
        if index == chains[-1][-1] + 1:
            chains[-1].append(index)
        else:
            chains.append([index])
    # sort chains by length
    chains = sorted(chains, key=lambda x: len(x), reverse=True)
    # store the longest chain and convert indexes to resources
    realms[key] = dict(chain=[resources[index] for index in chains[0]], length=len(chains[0]), total=len(realm_resources), name=realm["name"], key=key)

# sort realms by the length of the longest chain including at least 1 of the includes resources
includes = ["Ruby", "Deep Crystal"]
realms = [realm for realm in realms.values() if all(resource in realm["chain"] for resource in includes) or len(includes) == 0]
realms = sorted(realms, key=lambda x: x["length"], reverse=True)
for realm in realms[:10]:
    print(realm)
