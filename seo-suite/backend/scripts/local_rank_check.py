#!/usr/bin/env python3
"""
local_rank_check.py - Check local Google rankings for keywords in a city.
Usage: python local_rank_check.py '["keyword1","keyword2"]' "New York, NY" "domain.com"
"""
import sys, json, urllib.request, urllib.parse, re, time

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
}

def search_local(keyword, city, domain=''):
    """Search Google for a keyword + city and extract position."""
    query = f'{keyword} {city}'
    encoded = urllib.parse.quote(query)
    url = f'https://www.google.com/search?q={encoded}&num=20&gl=us&hl=en'
    
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode('utf-8', errors='replace')
    
    # Extract organic results
    # Pattern: look for result divs
    results = []
    
    # Try to find map pack (Local 3-pack)
    map_pack = False
    map_pack_titles = re.findall(r'class="[^"]*local[^"]*"[^>]*>([^<]+)', html)
    
    # Extract search result links and titles
    link_pattern = r'href="(https?://[^"]+?)"[^>]*>([^<]+)'
    title_pattern = r'<h3[^>]*>([^<]+)</h3>'
    titles = re.findall(title_pattern, html)
    
    # Find anchored result blocks
    block_pattern = r'<a href="(/url\?q=([^&"]+)[^"]*)"[^>]*><h3[^>]*>([^<]+)</h3>'
    blocks = re.findall(block_pattern, html)
    
    if not blocks:
        # Fallback pattern
        alt_pattern = r'href="(https?://[^"]+)".*?<h3[^>]*>([^<]+)</h3>'
        blocks_alt = re.findall(alt_pattern, html, re.DOTALL)
        for i, (href, title) in enumerate(blocks_alt[:10]):
            results.append({'url': href, 'title': title.strip(), 'position': i + 1})
    else:
        for i, (_, clean_url, title) in enumerate(blocks[:10]):
            decoded = urllib.parse.unquote(clean_url)
            results.append({'url': decoded, 'title': title.strip(), 'position': i + 1})
    
    # Find domain position
    position = None
    found_url = ''
    found_title = ''
    
    if domain:
        for r in results:
            if domain.lower().replace('www.', '') in r['url'].lower():
                position = r['position']
                found_url = r['url']
                found_title = r['title']
                break
    
    # Check for map pack presence (heuristic: "maps" in url or local block)
    map_pack = bool(re.search(r'maps\.google|google\.com/maps|class="[^"]*rllt__', html))
    
    return {
        'keyword': keyword,
        'city': city,
        'position': position,
        'mapPack': map_pack and (position is not None and position <= 3),
        'url': found_url,
        'title': found_title,
        'inTop3': position is not None and position <= 3,
    }

def main():
    keywords_json = sys.argv[1] if len(sys.argv) > 1 else '[]'
    city = sys.argv[2] if len(sys.argv) > 2 else 'New York'
    domain = sys.argv[3] if len(sys.argv) > 3 else ''
    
    keywords = json.loads(keywords_json)
    results = []
    
    for i, kw in enumerate(keywords[:8]):  # limit to 8 to avoid rate limits
        try:
            result = search_local(kw, city, domain)
            results.append(result)
            if i < len(keywords) - 1:
                time.sleep(1.5)  # polite delay
        except Exception as e:
            results.append({
                'keyword': kw,
                'city': city,
                'position': None,
                'mapPack': False,
                'url': '',
                'title': '',
                'inTop3': False,
                'error': str(e)
            })
    
    print(json.dumps({'results': results}))

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(json.dumps({'error': str(e), 'results': []}))
