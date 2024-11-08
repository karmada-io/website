#!/bin/bash

# generate leaf certificates of front-proxy-ca, server-ca

set -e
set -o pipefail

source "./util.sh"

readonly server_ca_leaf_certs=(
  "admin"
  "kube-apiserver"
  "kube-controller-manager"
  "karmada"
)

function parse_parameter() {
  if [ $# -ne 1 ]
  then
    echo "Usage: $0 <folder of ca files>"
    exit 1
  fi

  ca_dir="$(readlink -f ${1})"
  readonly ca_dir

  if [ ! -d "${ca_dir}" ]
  then
    echo "${ca_dir} is not a directory"
    exit 1
  fi
}

function generate_server_ca_leaf_certs() {
  local cert
  for cert in "${server_ca_leaf_certs[@]}"
  do
    util::generate_leaf_cert_key "${cert}" "${ca_dir}" "server-ca" "../csr_config"
  done
}

function generate_front_proxy_client() {
  util::generate_leaf_cert_key "front-proxy-client" "${ca_dir}" "front-proxy-ca" "../csr_config"
}

function generate_service_account() {
  openssl genrsa -out sa.key 2048
  openssl rsa -in sa.key -pubout -out sa.pub
}

function main() {
  parse_parameter "$@"

  mkdir -p cert
  cd cert

  generate_server_ca_leaf_certs
  generate_front_proxy_client
  generate_service_account
}

main "$@"