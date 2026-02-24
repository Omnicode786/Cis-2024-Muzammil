import requests
import pandas as pd
from bs4 import BeautifulSoup
import json

headers = {'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36'}
url = 'https://quotes.toscrape.com/'
try:
     
    webpage = requests.get(url=url, headers=headers)
except Exception as e:
     print(f"The {url} failed with error {e}")

print(webpage.text.strip())

soup = BeautifulSoup(webpage, 'lxml')

content = soup.prettify()

quotes = soup.find_all("span", class_ = "text")

print(quotes[0].text)

results = []

for i in range(len(quotes)):
    results.append({
     i: quotes[i].text   
    })


jsonDump = json.dumps(results)

print(jsonDump)

def save_to_json(filename="Task_1.json"):
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=4)
        print(f"✅ Saved {len(results)} unique quotes to {filename}")

save_to_json(results)