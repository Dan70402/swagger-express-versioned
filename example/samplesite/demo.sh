#!/bin/bash

#Start the server
#node index.js &


GREEN='\033[0:32m'
YELLOW='\033[1:33m'
RED='\033[0;31m'
LIGHTGREY='\033[0:37m'
NC='\033[0m' # No Color


#Creates version 1.0.0 and 2.0.0
printf "${YELLOW}Ping has distinct endpoints for v1.0.0 and v2.0.0${NC}\n"
printf "${LIGHTGREY}curl --header \"X-Api-Version: 1.0.0\" localhost:1234/ping${NC}\n"
curl -s --header "X-Api-Version: 1.0.0" localhost:1234/ping > /dev/null
printf "${LIGHTGREY}curl --header \"X-Api-Version: 2.0.0\" localhost:1234/ping${NC}\n"
curl -s --header "X-Api-Version: 2.0.0" localhost:1234/ping > /dev/null
printf "\n"


#Default to 2.0.0
printf "${YELLOW}Ping default to the latest version 2.0.0\n"
printf "${LIGHTGREY}curl localhost:1234/ping\n"
curl -s localhost:1234/ping > /dev/null
printf "\n"


#Pong replies to all valid versions
printf "${YELLOW}Pong is '*' and will match ALL valid versions${NC}\n"
printf "${LIGHTGREY}curl --header \"X-Api-Version: 1.0.0\" localhost:1234/pong${NC}\n"
curl -s --header "X-Api-Version: 1.0.0" localhost:1234/ping > /dev/null
printf "${LIGHTGREY}curl --header \"X-Api-Version: 2.0.0\" localhost:1234/pong${NC}\n"
curl -s --header "X-Api-Version: 2.0.0" localhost:1234/ping > /dev/null
printf "\n"

#Invalid versions 404
printf "${YELLOW}Invalid Api's are 404${NC}\n"
printf "${LIGHTGREY}curl --header \"X-Api-Version: 3.0.0\" localhost:1234/ping${NC}\n"
curl -s --header "X-Api-Version: 3.0.0" localhost:1234/ping
printf "${LIGHTGREY}curl --header \"X-Api-Version: 1.1.1\" localhost:1234/ping${NC}\n"
curl -s --header "X-Api-Version: 1.1.1" localhost:1234/ping
printf "\n"