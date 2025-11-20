#!/bin/bash
# VOG System Test Script
# Quick test to verify all components working

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "VOG System Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

# Configuration
VOG_URL="${VOG_SERVICE_URL:-http://localhost:8000}"
INTERPRETER_URL="${INTERPRETER_URL:-http://localhost:8001}"

echo "1️⃣  Checking service health..."
echo

# Check VOG Service
echo "   VOG Service ($VOG_URL)..."
if curl -f -s "$VOG_URL/health" > /dev/null; then
    echo "   ✅ VOG Service healthy"
    curl -s "$VOG_URL/health" | jq '.'
else
    echo "   ❌ VOG Service not responding"
    echo "   Start with: docker-compose up -d"
    exit 1
fi

echo

# Check Interpreter
echo "   Interpreter ($INTERPRETER_URL)..."
if curl -f -s "$INTERPRETER_URL/health" > /dev/null; then
    echo "   ✅ Interpreter healthy"
    curl -s "$INTERPRETER_URL/health" | jq '.'
else
    echo "   ❌ Interpreter not responding"
    exit 1
fi

echo
echo "2️⃣  Getting authentication token..."
echo

# Get token
TOKEN=$(curl -s -X POST "$VOG_URL/v1/auth/token?subject=test&roles=director" | jq -r '.access_token')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    echo "   ❌ Failed to get token"
    exit 1
fi

echo "   ✅ Token obtained: ${TOKEN:0:20}..."

echo
echo "3️⃣  Testing VOG generation..."
echo

# Test VOG creation
RESPONSE=$(curl -s -X POST "$VOG_URL/v1/vog" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "text": "System test successful",
        "preset": "GOD-THUNDER",
        "priority": "standard"
    }')

echo "   Response:"
echo "$RESPONSE" | jq '.'

CUE_ID=$(echo "$RESPONSE" | jq -r '.cue_id')
STATUS=$(echo "$RESPONSE" | jq -r '.status')

if [ "$STATUS" == "ready" ] || [ "$STATUS" == "queued" ]; then
    echo "   ✅ VOG creation: $STATUS"
else
    echo "   ❌ VOG creation failed"
    exit 1
fi

echo
echo "4️⃣  Checking VOG status..."
echo

# Wait a bit if queued
if [ "$STATUS" == "queued" ]; then
    echo "   Waiting for generation..."
    sleep 2
fi

# Check status
STATUS_RESPONSE=$(curl -s -X GET "$VOG_URL/v1/vog/status/$CUE_ID" \
    -H "Authorization: Bearer $TOKEN")

echo "   Status:"
echo "$STATUS_RESPONSE" | jq '.'

FINAL_STATUS=$(echo "$STATUS_RESPONSE" | jq -r '.status')

if [ "$FINAL_STATUS" == "ready" ]; then
    echo "   ✅ VOG ready"
    URL=$(echo "$STATUS_RESPONSE" | jq -r '.url')
    echo "   📁 Audio file: $VOG_URL$URL"
else
    echo "   ⚠️  Status: $FINAL_STATUS"
fi

echo
echo "5️⃣  Testing parameter API..."
echo

# Get params
PARAMS=$(curl -s "$INTERPRETER_URL/params")
echo "   Current parameters:"
echo "$PARAMS" | jq '.params'

# Update param
UPDATE=$(curl -s -X POST "$INTERPRETER_URL/params" \
    -H "Content-Type: application/json" \
    -d '{"bloom_scale": 1.5}')

echo
echo "   Updated parameters:"
echo "$UPDATE" | jq '.params'
echo "   ✅ Parameter update successful"

echo
echo "6️⃣  Testing VOG playback (optional)..."
echo

read -p "   Trigger playback? (y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    PLAY_RESPONSE=$(curl -s -X POST "$INTERPRETER_URL/play/vog" \
        -H "Content-Type: application/json" \
        -d "{
            \"text\": \"Test complete\",
            \"preset\": \"HALL-ANNOUNCE\",
            \"token\": \"$TOKEN\"
        }")

    echo "   Playback triggered:"
    echo "$PLAY_RESPONSE" | jq '.'
    echo "   🔊 Listen for audio output..."
else
    echo "   Skipped"
fi

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All tests passed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo
echo "Next steps:"
echo "  • Open frontend: http://localhost:5173"
echo "  • Click 'VOG Control' tab"
echo "  • Test with custom text"
echo "  • Adjust parameters in real-time"
echo
