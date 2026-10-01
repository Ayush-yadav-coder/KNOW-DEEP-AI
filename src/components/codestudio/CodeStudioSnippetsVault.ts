import { SnippetTemplate } from "./CodeStudioTypes";

export const SNIPPET_TEMPLATES: SnippetTemplate[] = [
  {
    id: "algo-quicksort-js",
    title: "QuickSort Algorithm (In-Place / Optimized)",
    category: "Algorithms",
    language: "javascript",
    difficulty: "Intermediate",
    description: "Partition-based divide-and-conquer sorting algorithm with average O(n log n) runtime.",
    tags: ["Sorting", "Recursion", "Divide & Conquer"],
    code: `// QuickSort Algorithm Implementation in JavaScript
function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}

const numbers = [64, 34, 25, 12, 22, 11, 90, 5];
console.log("Original array:", numbers);
const sorted = quickSort([...numbers]);
console.log("Sorted array:", sorted);
`,
  },
  {
    id: "ds-lru-cache-ts",
    title: "LRU (Least Recently Used) Cache",
    category: "Data Structures",
    language: "typescript",
    difficulty: "Advanced",
    description: "High performance O(1) Get & Put cache using HashMap and Doubly Linked List.",
    tags: ["Cache", "Hash Map", "Doubly Linked List"],
    code: `class DNode<K, V> {
  key: K;
  val: V;
  prev: DNode<K, V> | null = null;
  next: DNode<K, V> | null = null;
  constructor(key: K, val: V) {
    this.key = key;
    this.val = val;
  }
}

class LRUCache<K, V> {
  private capacity: number;
  private map = new Map<K, DNode<K, V>>();
  private head: DNode<K, V>;
  private tail: DNode<K, V>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.head = new DNode<K, V>(null as any, null as any);
    this.tail = new DNode<K, V>(null as any, null as any);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  private addNode(node: DNode<K, V>) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  private removeNode(node: DNode<K, V>) {
    const prev = node.prev!;
    const next = node.next!;
    prev.next = next;
    next.prev = prev;
  }

  private moveToHead(node: DNode<K, V>) {
    this.removeNode(node);
    this.addNode(node);
  }

  get(key: K): V | -1 {
    const node = this.map.get(key);
    if (!node) return -1;
    this.moveToHead(node);
    return node.val;
  }

  put(key: K, val: V): void {
    const node = this.map.get(key);
    if (node) {
      node.val = val;
      this.moveToHead(node);
    } else {
      const newNode = new DNode(key, val);
      this.map.set(key, newNode);
      this.addNode(newNode);
      if (this.map.size > this.capacity) {
        const tailPrev = this.tail.prev!;
        this.removeNode(tailPrev);
        this.map.delete(tailPrev.key);
      }
    }
  }
}

const cache = new LRUCache<string, number>(2);
cache.put("a", 100);
cache.put("b", 200);
console.log("Get 'a':", cache.get("a")); // Returns 100
cache.put("c", 300); // Evicts 'b'
console.log("Get 'b' (should be -1):", cache.get("b"));
console.log("Get 'c':", cache.get("c"));
`,
  },
  {
    id: "algo-dijkstra-py",
    title: "Dijkstra's Shortest Path Algorithm",
    category: "Algorithms",
    language: "python",
    difficulty: "Advanced",
    description: "Finds the shortest paths between nodes in a weighted graph using a min-priority queue.",
    tags: ["Graph", "Shortest Path", "Priority Queue"],
    code: `import heapq

def dijkstra(graph, start_node):
    # Distances dictionary initialized with infinity
    distances = {node: float('inf') for node in graph}
    distances[start_node] = 0
    
    # Priority queue: stores (cost, node)
    pq = [(0, start_node)]
    visited = set()
    
    while pq:
        current_distance, current_node = heapq.heappop(pq)
        
        if current_node in visited:
            continue
        visited.add(current_node)
        
        for neighbor, weight in graph[current_node].items():
            distance = current_distance + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(pq, (distance, neighbor))
                
    return distances

# Example Weighted Network Graph
network_graph = {
    'A': {'B': 4, 'C': 2},
    'B': {'A': 4, 'C': 1, 'D': 5},
    'C': {'A': 2, 'B': 1, 'D': 8, 'E': 10},
    'D': {'B': 5, 'C': 8, 'E': 2, 'Z': 6},
    'E': {'C': 10, 'D': 2, 'Z': 3},
    'Z': {'D': 6, 'E': 3}
}

shortest_paths = dijkstra(network_graph, 'A')
print("Shortest distances from source node 'A':")
for node, dist in shortest_paths.items():
    print(f"To {node} : {dist} units")
`,
  },
  {
    id: "web-interactive-widget-html",
    title: "Modern Glassmorphism Card & Interactive Chart",
    category: "Web & Frontend",
    language: "html",
    difficulty: "Beginner",
    description: "Responsive interactive web component with smooth CSS animations and pure JS state.",
    tags: ["HTML5", "CSS3", "Glassmorphism", "Responsive"],
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Know Deep Component Preview</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body {
      background: radial-gradient(circle at 50% 0%, #1e293b, #090d16);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      color: #f8fafc;
    }
    .card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 24px;
      padding: 32px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
      transition: transform 0.3s ease;
    }
    .card:hover { transform: translateY(-4px); }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 999px;
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    h2 { font-size: 22px; margin-bottom: 8px; font-weight: 700; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.5; margin-bottom: 24px; }
    .metric {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 16px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 16px;
      margin-bottom: 20px;
    }
    .metric-val { font-size: 28px; font-weight: 800; color: #10b981; }
    .btn {
      width: 100%;
      padding: 14px;
      border-radius: 14px;
      border: none;
      background: linear-gradient(135deg, #0284c7, #2563eb);
      color: white;
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn:hover { opacity: 0.92; transform: scale(0.99); }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Live Preview Sandbox</span>
    <h2>Performance Telemetry</h2>
    <p>Real-time microservice throughput latency metrics.</p>
    <div class="metric">
      <span>Average Latency</span>
      <span class="metric-val" id="latency">12.4 ms</span>
    </div>
    <button class="btn" onclick="pingServer()">Simulate API Benchmark</button>
  </div>

  <script>
    function pingServer() {
      const ms = (Math.random() * 8 + 6).toFixed(1);
      document.getElementById('latency').innerText = ms + ' ms';
    }
  </script>
</body>
</html>
`,
  },
  {
    id: "sql-ecommerce-analytics",
    title: "E-Commerce Revenue & Retention Analysis",
    category: "Backend & APIs",
    language: "sql",
    difficulty: "Intermediate",
    description: "Advanced SQL window functions, cohort retention rates, and customer lifetime revenue.",
    tags: ["SQL", "Analytics", "Aggregation", "CTE"],
    code: `-- Enterprise Customer Cohort & Revenue Analytics
WITH monthly_cohorts AS (
    SELECT 
        customer_id,
        MIN(DATE_TRUNC('month', order_date)) AS cohort_month
    FROM orders
    GROUP BY customer_id
),
customer_spending AS (
    SELECT 
        o.customer_id,
        c.cohort_month,
        COUNT(o.order_id) AS total_orders,
        SUM(o.amount) AS total_revenue,
        AVG(o.amount) AS avg_order_value
    FROM orders o
    JOIN monthly_cohorts c ON o.customer_id = c.customer_id
    WHERE o.status = 'COMPLETED'
    GROUP BY o.customer_id, c.cohort_month
)
SELECT 
    TO_CHAR(cohort_month, 'YYYY-MM') AS cohort,
    COUNT(customer_id) AS total_active_customers,
    ROUND(SUM(total_revenue), 2) AS gross_cohort_revenue,
    ROUND(AVG(avg_order_value), 2) AS mean_basket_size,
    ROUND(SUM(total_revenue) / COUNT(customer_id), 2) AS customer_ltv
FROM customer_spending
GROUP BY cohort_month
ORDER BY cohort_month DESC;
`,
  },
  {
    id: "leetcode-two-sum-ts",
    title: "LeetCode #1: Two Sum (Hash Map O(n))",
    category: "LeetCode Top",
    language: "typescript",
    difficulty: "Beginner",
    description: "Classic optimal one-pass hash map solution to find pair indices summing to target.",
    tags: ["LeetCode", "Hash Map", "Arrays"],
    code: `function twoSum(nums: number[], target: number): number[] {
  const seenMap = new Map<number, number>(); // value -> index
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seenMap.has(complement)) {
      return [seenMap.get(complement)!, i];
    }
    seenMap.set(nums[i], i);
  }
  
  return [];
}

const testArray = [2, 7, 11, 15];
const targetSum = 9;
const result = twoSum(testArray, targetSum);

console.log("Input Array:", testArray);
console.log("Target:", targetSum);
console.log("Found Indices:", result);
console.log("Verification values:", result.map(idx => testArray[idx]));
`,
  },
  {
    id: "backend-rate-limiter-js",
    title: "Token Bucket Rate Limiter",
    category: "Backend & APIs",
    language: "javascript",
    difficulty: "Advanced",
    description: "Robust rate limiter implementing Token Bucket algorithm with refill frequency.",
    tags: ["System Design", "Rate Limiter", "Networking"],
    code: `class TokenBucketRateLimiter {
  constructor(capacity, refillRatePerSec) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRatePerSec;
    this.lastRefillTimestamp = Date.now();
  }

  refill() {
    const now = Date.now();
    const elapsedSec = (now - this.lastRefillTimestamp) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsedSec * this.refillRate);
    this.lastRefillTimestamp = now;
  }

  allowRequest(tokensRequired = 1) {
    this.refill();
    if (this.tokens >= tokensRequired) {
      this.tokens -= tokensRequired;
      return { allowed: true, remainingTokens: Math.floor(this.tokens) };
    }
    return { allowed: false, remainingTokens: Math.floor(this.tokens), retryAfterMs: Math.ceil(((tokensRequired - this.tokens) / this.refillRate) * 1000) };
  }
}

const limiter = new TokenBucketRateLimiter(5, 2); // 5 tokens max, refills 2 tokens/sec

for (let i = 1; i <= 8; i++) {
  const check = limiter.allowRequest();
  console.log(\`Request #\${i}: Allowed=\${check.allowed}, Remaining=\${check.remainingTokens}\`);
}
`,
  },
];
