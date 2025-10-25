#!/bin/bash

# PardnaLink Load Testing Suite
API_BASE="http://52.23.203.107:3001/v1"
CONCURRENT_USERS=10
REQUESTS_PER_USER=5

echo "⚡ PARDNALINK LOAD TESTING SUITE"
echo "==============================="
echo "Concurrent Users: $CONCURRENT_USERS"
echo "Requests per User: $REQUESTS_PER_USER"
echo ""

# Function to simulate user load
simulate_user() {
    local user_id=$1
    echo "👤 User $user_id starting load test..."
    
    for i in $(seq 1 $REQUESTS_PER_USER); do
        # Test health endpoint
        curl -s -w "User$user_id-Req$i: %{http_code} (%{time_total}s)\n" \
             -o /dev/null "$API_BASE/health"
        
        # Small delay between requests
        sleep 0.1
    done
    
    echo "✅ User $user_id completed"
}

# Start load test
echo "🚀 Starting load test..."
start_time=$(date +%s)

# Run concurrent users in background
for i in $(seq 1 $CONCURRENT_USERS); do
    simulate_user $i &
done

# Wait for all background jobs to complete
wait

end_time=$(date +%s)
duration=$((end_time - start_time))

echo ""
echo "📊 LOAD TEST RESULTS"
echo "==================="
echo "Total Duration: ${duration}s"
echo "Total Requests: $((CONCURRENT_USERS * REQUESTS_PER_USER))"
echo "Requests/Second: $(echo "scale=2; $((CONCURRENT_USERS * REQUESTS_PER_USER)) / $duration" | bc)"
echo ""
echo "✅ Load testing completed!"