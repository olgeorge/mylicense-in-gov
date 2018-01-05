#!/bin/bash
printf "GET /mylicense/professions " && curl localhost:8082/mylicense/professions &&
printf "\n\nGET /mylicense/licenseTypes " && curl localhost:8082/mylicense/licenseTypes &&
printf "\n\nGET /mylicense/statuses " && curl localhost:8082/mylicense/statuses &&
printf "\n\nGET /mylicense/states " && curl localhost:8082/mylicense/states &&
printf "\n\nGET /mylicense/searchOptions " && curl localhost:8082/mylicense/searchOptions
printf "\n\nPOST /mylicense/search " && curl localhost:8082/mylicense/search --data "{\"firstOrMidName\":\"John\"}" -H "Content-Type: application/json"

