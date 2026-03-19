#!/usr/bin/env bash
#
# Test all CRUD endpoints across all 4 production variants.
# Usage: ./test-all-endpoints.sh [local|prod]
#
# Defaults to "prod". Use "local" to test against localhost.

set -uo pipefail

ENV="${1:-prod}"

RED='\033[0;31m'
GREEN='\033[0;32m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

if [ "$ENV" = "local" ]; then
  declare -A ENDPOINTS=(
    ["JS Serverless"]="http://localhost:3000/local"
    ["JS SAM"]="http://localhost:3001"
    ["Go SAM"]="http://localhost:8080"
  )
else
  declare -A ENDPOINTS=(
    ["JS Serverless"]="https://roastly-js-serverless.projects.lauraesteves.com"
    ["JS SAM"]="https://roastly-api-js-sam.projects.lauraesteves.com"
    ["Go Serverless"]="https://roastly-go-serverless.projects.lauraesteves.com"
    ["Go SAM"]="https://roastly-api-go-sam.projects.lauraesteves.com"
  )
fi

PASS=0
FAIL=0

COL_W=16
OP_W=10
SEP="│"

run_test() {
  local url="$1" method="$2" path="$3" data="${4:-}"
  local args=(-s -w "|%{http_code}" -X "$method" "$url$path")
  if [ -n "$data" ]; then
    args+=(-H "Content-Type: application/json" -d "$data")
  fi
  curl "${args[@]}"
}

hr() {
  printf "├"
  printf '%.0s─' $(seq 1 $((COL_W + 2)))
  for _ in 1 2 3 4 5; do
    printf "┼"
    printf '%.0s─' $(seq 1 $((OP_W + 2)))
  done
  printf "┤\n"
}

printf "\n${BOLD}  Roastly API — Integration Tests (%s)${NC}\n\n" "$ENV"

# Top border
printf "┌"
printf '%.0s─' $(seq 1 $((COL_W + 2)))
for _ in 1 2 3 4 5; do
  printf "┬"
  printf '%.0s─' $(seq 1 $((OP_W + 2)))
done
printf "┐\n"

# Header
printf "${SEP} ${BOLD}%-${COL_W}s${NC} " "Endpoint"
for op in CREATE GET LIST UPDATE DELETE; do
  printf "${SEP} ${BOLD}%-${OP_W}s${NC} " "$op"
done
printf "${SEP}\n"

hr

SORTED_KEYS=$(for k in "${!ENDPOINTS[@]}"; do echo "$k"; done | sort)
FIRST=1
while IFS= read -r name; do
  url="${ENDPOINTS[$name]}"

  if [ "$FIRST" -eq 0 ]; then
    hr
  fi
  FIRST=0

  create_code="---"
  get_code="---"
  list_code="---"
  update_code="---"
  delete_code="---"

  # CREATE
  response=$(run_test "$url" "POST" "/products" '{"name":"Test Coffee","price":12.50,"stock":10}')
  body="${response%|*}"
  create_code="${response##*|}"
  id=$(echo "$body" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id') or d.get('payload',{}).get('id',''))" 2>/dev/null || echo "")

  if [ -n "$id" ]; then
    response=$(run_test "$url" "GET" "/products/$id")
    get_code="${response##*|}"

    response=$(run_test "$url" "GET" "/products")
    list_code="${response##*|}"

    response=$(run_test "$url" "PUT" "/products/$id" '{"name":"Updated Coffee","price":15.00}')
    update_code="${response##*|}"

    response=$(run_test "$url" "DELETE" "/products/$id")
    delete_code="${response##*|}"
  fi

  printf "${SEP} %-${COL_W}s " "$name"
  for code in "$create_code" "$get_code" "$list_code" "$update_code" "$delete_code"; do
    if [ "$code" = "200" ]; then
      PASS=$((PASS + 1))
      printf "${SEP} ${GREEN}%-10s${NC} " "OK   $code"
    elif [ "$code" = "---" ]; then
      FAIL=$((FAIL + 1))
      printf "${SEP} ${DIM}%-10s${NC} " "--   ---"
    else
      FAIL=$((FAIL + 1))
      printf "${SEP} ${RED}%-10s${NC} " "FAIL $code"
    fi
  done
  printf "${SEP}\n"

done <<< "$SORTED_KEYS"

# Bottom border
printf "└"
printf '%.0s─' $(seq 1 $((COL_W + 2)))
for _ in 1 2 3 4 5; do
  printf "┴"
  printf '%.0s─' $(seq 1 $((OP_W + 2)))
done
printf "┘\n"

TOTAL=$((PASS + FAIL))
printf "\n  ${BOLD}Results:${NC} "
if [ "$FAIL" -eq 0 ]; then
  printf "${GREEN}All %d tests passed ✔${NC}\n\n" "$TOTAL"
else
  printf "${GREEN}%d passed${NC}, ${RED}%d failed${NC} out of %d\n\n" "$PASS" "$FAIL" "$TOTAL"
fi

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
