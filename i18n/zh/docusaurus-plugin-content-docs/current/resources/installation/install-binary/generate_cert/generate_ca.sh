#!/bin/bash

# generate front-proxy-ca, server-ca

set -e
set -o pipefail

function gen_server_ca() {
  openssl genrsa -out server-ca.key 2048
  openssl req -x509 -new -nodes -key server-ca.key -subj "/C=CN/ST=Guangdong/L=Guangzhou/O=karmada/OU=System/CN=karmada" -days 3650 -out server-ca.crt
}

function gen_front_proxy_ca() {
  openssl genrsa -out front-proxy-ca.key 2048
  openssl req -x509 -new -nodes -key front-proxy-ca.key -subj "/C=CN/ST=Guangdong/L=Guangzhou/O=karmada/OU=System/CN=front-proxy-ca" -days 3650 -out front-proxy-ca.crt
}

function main() {
  mkdir ca_cert
  cd ca_cert

  gen_server_ca
  gen_front_proxy_ca
}

main "$@"