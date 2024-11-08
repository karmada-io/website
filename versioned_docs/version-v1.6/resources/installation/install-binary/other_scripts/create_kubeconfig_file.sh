#!/bin/bash

set -u
set -e
set -o pipefail

# By not embedding certificate, we don't need to regenerate kubeconfig file when certificates is replaced.

function parse_parameter() {
  if [ $# -ne 1 ]
  then
    echo "Usage: $0 <URL of Karmada API Server >"
    echo "Example: $0 \"https://127.0.0.1:6443\""
    exit 1
  fi

  KARMADA_APISERVER="$1"
}

function check_pki_dir_exist() {
  if [ ! -e "/etc/karmada/pki/karmada.crt" ]
  then
    echo 'You need to replace all certificates and private keys under "/etc/karmada/pki/", then execute this command'
    exit 1
  fi
}

# for kubectl
function create_admin_kubeconfig() {
  kubectl config set-cluster karmada \
    --certificate-authority=/etc/karmada/pki/server-ca.crt \
    --embed-certs=false \
    --server "${KARMADA_APISERVER}" \
    --kubeconfig=admin.kubeconfig

  kubectl config set-credentials admin \
    --client-certificate=/etc/karmada/pki/admin.crt \
    --client-key=/etc/karmada/pki/admin.key \
    --embed-certs=false \
    --kubeconfig=admin.kubeconfig

  kubectl config set-context karmada \
    --cluster=karmada \
    --user=admin \
    --kubeconfig=admin.kubeconfig

  kubectl config use-context karmada --kubeconfig=admin.kubeconfig
}

# for kube-controller-manager
function create_kube_controller_manager_kubeconfig() {
  kubectl config set-cluster karmada \
    --certificate-authority=/etc/karmada/pki/server-ca.crt \
    --embed-certs=false \
    --server "${KARMADA_APISERVER}" \
    --kubeconfig=kube-controller-manager.kubeconfig

  kubectl config set-credentials system:kube-controller-manager \
    --client-certificate=/etc/karmada/pki/kube-controller-manager.crt \
    --client-key=/etc/karmada/pki/kube-controller-manager.key \
    --embed-certs=false \
    --kubeconfig=kube-controller-manager.kubeconfig

  kubectl config set-context system:kube-controller-manager \
    --cluster=karmada \
    --user=system:kube-controller-manager \
    --kubeconfig=kube-controller-manager.kubeconfig

  kubectl config use-context system:kube-controller-manager --kubeconfig=kube-controller-manager.kubeconfig
}

# for a lot of different karmada components 
function create_karmada_kubeconfig() {
  kubectl config set-cluster karmada \
    --certificate-authority=/etc/karmada/pki/server-ca.crt \
    --embed-certs=false \
    --server "${KARMADA_APISERVER}" \
    --kubeconfig=karmada.kubeconfig

  kubectl config set-credentials system:karmada \
    --client-certificate=/etc/karmada/pki/karmada.crt \
    --client-key=/etc/karmada/pki/karmada.key \
    --embed-certs=false \
    --kubeconfig=karmada.kubeconfig

  kubectl config set-context system:karmada\
    --cluster=karmada \
    --user=system:karmada \
    --kubeconfig=karmada.kubeconfig

  kubectl config use-context system:karmada --kubeconfig=karmada.kubeconfig
}

parse_parameter "$@"
check_pki_dir_exist
cd /etc/karmada/
create_admin_kubeconfig
create_kube_controller_manager_kubeconfig
create_karmada_kubeconfig