#!/bin/bash

# Reference:
# 1. https://karmada.io/zh/docs/installation/install-binary
# 2. https://kubernetes.io/docs/tasks/administer-cluster/certificates/#openssl
# 3. https://kubernetes.io/docs/setup/best-practices/certificates/
# 4. https://kubernetes.io/docs/tasks/extend-kubernetes/configure-aggregation-layer/#ca-reusage-and-conflicts

# util::get_random_serial_number generates a 64 bit signed positive integer.
# karmadactl also uses [0, 2^63 -1] integers as serial_number for cert.
#
# There are two ways of handling certificate serial number:
# 1. Use `-CAcreateserial`, let openssl record the latest generated certificate's serial number, and increment
# serial_number every time.
# This way requires user to commit the srl file to git every time a new certificate is generated, so it requires
# a lot of bookkeeping. If once a user forgot to commit the srl file, the next certificate generated will have the
# same serial number as the previous one, the behavior of program is undefined.
# 2. Use `-set_serial` to appoint a random number as the serial number.
# This way is much easier to maintain. So we use this approach. This is also newer version of openssl recommended
# approach (see link 2).
#
# Newer version of openssl can generate random number itself. But as the author of this script, I don't know
# what version of openssl will the user use. So I can only generate the random number in this shell script,
# as this is the most portable way.
#
# Information related to serial number problem:
# 1. https://www.rfc-editor.org/rfc/rfc5280#section-4.1.2.2
# 2. https://www.openssl.org/docs/man3.0/man1/openssl-x509.html#:~:text=1)%20for%20details.-,%2DCAserial%20filename,-Sets%20the%20CA
function util::get_random_serial_number() {
  serial_number="$(shuf -i '0-9223372036854775807' -n 1)"
}

# util::generate_leaf_cert_key generate a pair of signed leaf certificate and private key.
#
# arg1: base filename of generated file
# arg2: ca file directory
# arg3: base filename of ca
# arg4: csr_config_dir
function util::generate_leaf_cert_key() {
  local local_cert="$1"
  local local_ca_dir="$2"
  local local_ca_file="$3"
  local local_csr_config_dir="$4"

  util::get_random_serial_number

  openssl genrsa -out "${local_cert}.key" 2048
  openssl req -new -key "${local_cert}.key" -out "${local_cert}.csr" -config "${local_csr_config_dir}/${local_cert}.conf"
  openssl x509 -req -in "${local_cert}.csr" -CA "${local_ca_dir}/${local_ca_file}.crt" -CAkey "${local_ca_dir}/${local_ca_file}.key" \
    -set_serial "${serial_number}" -out "${local_cert}.crt" -days 3650 \
    -sha256 -extensions v3_ext -extfile "${local_csr_config_dir}/${local_cert}.conf"
}