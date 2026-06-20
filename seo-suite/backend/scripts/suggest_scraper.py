import sys
import json
import urllib.request
import urllib.parse
import hashlib

def get_intent(keyword):
    kw = keyword.lower()
    info_words = ["how", "why", "what", "tutorial", "guide", "free", "read", "learn", "definition"]
    comm_words = ["best", "vs", "review", "alternative", "comparison", "top"]
    tran_words = ["buy", "price", "tool", "online", "convert", "merge", "compress", "editor", "download", "login", "app"]
    
    if any(w in kw for w in info_words):
        return "Informational"
    if any(w in kw for w in comm_words):
        return "Commercial"
    if any(w in kw for w in tran_words):
        return "Transactional"
    return "Navigational"

def calculate_difficulty(keyword):
    # Deterministic difficulty score based on hash of keyword
    h = hashlib.md5(keyword.encode('utf-8')).hexdigest()
    score = int(h[:2], 16) % 100
    # Keep it in realistic bounds (10-90)
    return str(max(10, min(90, score)))

def calculate_volume(keyword):
    # Deterministic volume count based on keyword length and characters
    h = hashlib.md5(keyword.encode('utf-8')).hexdigest()
    score = int(h[2:6], 16) % 25
    multiplier = [50, 100, 250, 500, 1000, 2500, 5000, 10000]
    val = (score + 1) * multiplier[score % len(multiplier)]
    return f"{val:,}"

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No query provided"}))
        return
        
    query = sys.argv[1]
    url = f"http://suggestqueries.google.com/complete/search?client=chrome&q={urllib.parse.quote(query)}"
    
    try:
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            suggestions = data[1] # Index 1 contains suggestion phrases
            
            output = []
            for sug in suggestions[:12]: # Limit to top 12
                output.append({
                    "keyword": sug,
                    "intent": get_intent(sug),
                    "difficulty": calculate_difficulty(sug),
                    "volume": calculate_volume(sug)
                })
            
            print(json.dumps({"suggestions": output}))
            
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == '__main__':
    main()
