#!/bin/bash

# Curl 7.29.0 provided by CentOS 7.6 cannot access tls 1.3 server without "--tlsv1.3" option. But adding this option
# will make "kube-apiserver" health check to fail.
# So we need to use different option to access different backend.
# Updating curl version may fix this problem, but it needs to update CentOS version.

readonly -A services_standard=(
  [kube-apiserver]='https://127.0.0.1:6443/livez?verbose'
  [kube-controller-manager]='https://127.0.0.1:10257/healthz?verbose'
  [karmada-aggregated-apiserver]='https://127.0.0.1:7443/livez?verbose'
  [karmada-controller-manager]='http://127.0.0.1:10357/healthz?verbose'
  [karmada-scheduler]='http://127.0.0.1:10511/healthz?verbose'
  [karmada-scheduler-estimator]='http://127.0.0.1:10351/healthz?verbose'
)

readonly -A services_tls1_3=(
  [karmada-webhook]='https://127.0.0.1:8443/readyz/'
)

check_pass=1

# arg1: url
# arg2: additional options, may be empty string
# return: 0 if success, 1 if failed
# https://kubernetes.io/docs/reference/using-api/health-checks/
function health_check() {
  local http_code
  http_code="$(curl --silent $2 --output /dev/stderr --write-out "%{http_code}" \
    --cacert "/etc/karmada/pki/server-ca.crt" \
    --cert "/etc/karmada/pki/admin.crt" \
    --key "/etc/karmada/pki/admin.key" \
    "$1")"
  test $? -eq '0' && test ${http_code} -eq '200'
  return $?
}

function check_all() {
  local key

  for key in "${!services_standard[@]}"
  do
    check_one "${key}" "${services_standard[${key}]}" ""
  done

  for key in "${!services_tls1_3[@]}"
  do
    check_one "${key}" "${services_tls1_3[${key}]}" "--tlsv1.3"
  done
}

# arg1: service name
# arg2: http url
# arg3: additional options, may be empty string
function check_one() {
  echo "###### Start check $1"
  health_check "$2" "$3"
  if [ $? -ne 0 ]
  then
    printf "\n###### $1 check failed\n\n\n"
    check_pass=0
  else
    printf "\n###### $1 check success\n\n\n"
  fi
}

function main() {
  check_all

  if [ ${check_pass} -ne 1 ]
  then
    echo '###### Some checks failed'
    exit 1
  else
    echo '###### All checks succeed'
    exit 0
  fi
}

main "$@"