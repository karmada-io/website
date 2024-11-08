#!/bin/bash

# generate CA & leaf certificates of etcd.

set -e
set -o pipefail

source "./util.sh"

# Absolute path to this script, e.g. /home/user/bin/foo.sh
script="$(readlink -f "${BASH_SOURCE[0]}")"
readonly script

# Absolute path this script is in, thus /home/user/bin
script_dir="$(dirname "$script")"
readonly script_dir

readonly csr_config_dir="${script_dir}/csr_config/etcd"
readonly leaf_certs=(
  "server"
  "peer"
  "healthcheck-client"
  "apiserver-etcd-client"
)

function gen_etcd_ca() {
  openssl genrsa -out ca.key 2048
  openssl req -x509 -new -nodes -key ca.key -subj "/C=CN/ST=Guangdong/L=Guangzhou/O=karmada/OU=System/CN=etcd-ca" -days 3650 -out ca.crt
}

function generate_leaf_certs() {
  local cert
  for cert in "${leaf_certs[@]}"
  do
    util::generate_leaf_cert_key "${cert}" "." "ca" "${csr_config_dir}"
  done
}

function main() {
  mkdir -p cert/etcd
  cd cert/etcd

  gen_etcd_ca

  generate_leaf_certs
}

main "$@"