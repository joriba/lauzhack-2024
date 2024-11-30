#!/usr/bin/env sh

special=$1

ssh root@104.248.27.229 mkdir -p /root/lauzhack-2024/data/$special
scp -r ./dist/* root@104.248.27.229:/root/lauzhack-2024/data/$special

echo   
echo   
echo =========
echo available under: https://spellz.a1n.ch/$special

