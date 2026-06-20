#!/usr/bin/env python3
"""
daily_trends.py - Fetch Google Daily Trending Searches via RSS feed
Usage: python daily_trends.py [geo]
geo: p1=US, p2=CA, p3=AU, p4=NZ, p5=GB, p6=IN, p17=DE, p23=JP
"""
import sys, json, urllib.request, xml.etree.ElementTree as ET

GEO_MAP = {
    'US': 'p1', 'CA': 'p2', 'AU': 'p3', 'NZ': 'p4',
    'GB': 'p5', 'IN': 'p6', 'DE': 'p17', 'JP': 'p23',
    'FR': 'p16', 'BR': 'p18', 'IT': 'p27', 'ES': 'p26',
}

def fetch_trends(geo='US'):
    pn = GEO_MAP.get(geo.upper(), 'p1')
    url = f'https://trends.google.com/trends/hottrends/atom/feed?pn={pn}'
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Suite/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml'
    }
    
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as resp:
        xml_data = resp.read().decode('utf-8', errors='replace')
    
    root = ET.fromstring(xml_data)
    ns = {
        'ht': 'https://trends.google.com/trends/trendingSearches',
        'media': 'http://search.yahoo.com/mrss/'
    }
    
    trends = []
    channel = root.find('channel')
    if channel is None:
        return []
    
    for item in channel.findall('item')[:20]:
        title_el = item.find('title')
        title = title_el.text if title_el is not None else 'Unknown'
        
        # Try ht:approx_traffic
        traffic_el = item.find('ht:approx_traffic', ns)
        traffic = traffic_el.text if traffic_el is not None else '10K+'
        
        # Try pubDate
        pub_el = item.find('pubDate')
        pub = pub_el.text if pub_el is not None else ''
        
        # Related queries from ht:news_item or description
        related = []
        for ni in item.findall('ht:news_item', ns)[:3]:
            ni_title = ni.find('ht:news_item_title', ns)
            if ni_title is not None and ni_title.text:
                # Clean and shorten
                t = ni_title.text[:40]
                related.append(t)
        
        trends.append({
            'title': title,
            'traffic': traffic,
            'relatedQueries': related,
            'startTime': pub
        })
    
    return trends

def main():
    geo = sys.argv[1] if len(sys.argv) > 1 else 'US'
    try:
        trends = fetch_trends(geo)
        print(json.dumps({'trends': trends, 'geo': geo}))
    except Exception as e:
        print(json.dumps({'error': str(e), 'trends': []}))

if __name__ == '__main__':
    main()
