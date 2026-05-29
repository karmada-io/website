#!/bin/bash

HOST_IP=$(if [ "$(uname)" == "Darwin" ]; then ipconfig getifaddr en0; else ip -o route get to 8.8.8.8 | sed -n 's/.*src \([0-9.]\+\).*/\1/p'; fi)
kubeconfig_cp=${KUBECONFIG_CP:-"/tmp/cp.kubeconfig"}
kubeconfig_c1=${KUBECONFIG_C1:-"/tmp/c1.kubeconfig"}
kubeconfig_c2=${KUBECONFIG_C2:-"/tmp/c2.kubeconfig"}
kubeconfig_c3=${KUBECONFIG_C3:-"/tmp/c3.kubeconfig"}
karmada_config=${KARMADA_CONFIG:-"/etc/karmada/karmada-apiserver.config"}

system=$(uname -s | tr [:upper:] [:lower:])
arch=$(if [ "$(uname)" == "Darwin" ]; then uname -m; else dpkg --print-architecture; fi)
osm_binary="$(pwd)/${system}-${arch}/osm"

k0="kubectl --kubeconfig ${kubeconfig_cp}"
k1="kubectl --kubeconfig ${kubeconfig_c1}"
k2="kubectl --kubeconfig ${kubeconfig_c2}"
k3="kubectl --kubeconfig ${kubeconfig_c3}"
kmd="kubectl --kubeconfig ${karmada_config}"

readonly reset=$(tput sgr0)
readonly green=$(
  tput bold
  tput setaf 2
)
readonly yellow=$(
  tput bold
  tput setaf 3
)
readonly blue=$(
  tput bold
  tput setaf 6
)
readonly timeout=$(if [ "$(uname)" == "Darwin" ]; then echo "1"; else echo "0.1"; fi)

DEMO_AUTO_RUN=true

function desc() {
  maybe_first_prompt
  echo "$blue# $@$reset"
  prompt
}

function prompt() {
  echo -n "$yellow\$ $reset"
}

started=""
function maybe_first_prompt() {
  if [ -z "$started" ]; then
    prompt
    started=true
  fi
}

# After a `run` this variable will hold the stdout of the command that was run.
# If the command was interactive, this will likely be garbage.
DEMO_RUN_STDOUT=""

function run() {
  maybe_first_prompt
  rate=250
  if [ -n "$DEMO_RUN_FAST" ]; then
    rate=1000
  fi
  echo "$green$1$reset" | pv -qL $rate
  if [ -n "$DEMO_RUN_FAST" ]; then
    sleep 0.5
  fi
  OFILE="$(mktemp -t $(basename $0).XXXXXX)"
  script -eq -c "$1" -f "$OFILE"
  r=$?
  #read -d '' -t "${timeout}" -n 10000 # clear stdin
  prompt
  if [ -z "$DEMO_AUTO_RUN" ]; then
    read -s
  fi
  DEMO_RUN_STDOUT="$(tail -n +2 $OFILE | sed 's/\r//g')"
  return $r
}

function relative() {
  for arg; do
    echo "$(realpath $(dirname $(which $0)))/$arg" | sed "s|$(realpath $(pwd))|.|"
  done
}

function check_command() {
  local installer="$2"
  if ! command -v $1 &>/dev/null; then
    echo "missing $1"
    if [ -z "${installer// /}" ]; then
      exit 1
    fi
    echo "Installing $1"
    eval $installer
  else
    echo "found $1"
  fi
}

function create_clusters() {
  API_PORT=6444
  PORT=80
  EXTRA_PORT=32443
  for CLUSTER_NAME in control-plane cluster-1 cluster-2 cluster-3; do
    desc "creating cluster ${CLUSTER_NAME}"
    k3d cluster create ${CLUSTER_NAME} \
      --image docker.io/rancher/k3s:v1.23.8-k3s2 \
      --api-port "${HOST_IP}:${API_PORT}" \
      --port "${PORT}:80@server:0" \
      --port "${EXTRA_PORT}:32443@server:0" \
      --servers-memory 2g \
      --k3s-arg "--disable=traefik@server:0" \
      --network multi-clusters \
      --timeout 120s \
      --wait
    ((API_PORT = API_PORT + 1))
    ((PORT = PORT + 1))
    ((EXTRA_PORT = EXTRA_PORT + 1))
  done
}

function install_eriecanal() {
  desc "Adding ErieCanal helm repo"
  helm repo add ec https://ec.flomesh.io --force-update
  helm repo update

  EC_NAMESPACE=erie-canal
  EC_VERSION=0.1.3

  for CLUSTER in ${!kubeconfig*}; do
    CLUSTER_NAME=$(if [ "${CLUSTER}" == "kubeconfig_c1" ]; then echo "cluster-1"; elif [ "${CLUSTER}" == "kubeconfig_c2" ]; then
      echo "cluster-2"
    elif [ "${CLUSTER}" == "kubeconfig_c3" ]; then echo "cluster-3"; else echo "control-plane"; fi)
    desc "installing ErieCanal on cluster ${CLUSTER_NAME}"
    helm upgrade -i --kubeconfig ${!CLUSTER} --namespace ${EC_NAMESPACE} --create-namespace --version=${EC_VERSION} --set ec.logLevel=5 ec ec/erie-canal
    sleep 1
    kubectl --kubeconfig ${!CLUSTER} wait --for=condition=ready pod --all -n $EC_NAMESPACE --timeout=120s
  done
}

function join_ec_clusters() {
  PORT=81
  for CLUSTER_NAME in cluster-1 cluster-2 cluster-3; do
    desc "Joining ${CLUSTER_NAME}"
    kubectl --kubeconfig ${kubeconfig_cp} apply -f - <<EOF
apiVersion: flomesh.io/v1alpha1
kind: Cluster
metadata:
  name: ${CLUSTER_NAME}
spec:
  gatewayHost: ${HOST_IP}
  gatewayPort: ${PORT}
  kubeconfig: |+
$(k3d kubeconfig get ${CLUSTER_NAME} | sed 's|^|    |g' | sed "s|0.0.0.0|$HOST_IP|g")
EOF
    ((PORT = PORT + 1))
  done
}

function install_osm_edge_binary() {
  release=v1.3.5
  desc "downloading osm-edge cli release - ${release}"
  curl -sL https://github.com/flomesh-io/osm-edge/releases/download/${release}/osm-edge-${release}-${system}-$arch.tar.gz | tar -vxzf -
  osm_binary="$(pwd)/${system}-${arch}/osm"
  $osm_binary version
}

function install_edge() {
  OSM_NAMESPACE=osm-system
  OSM_MESH_NAME=osm
  for CONFIG in kubeconfig_c1 kubeconfig_c2 kubeconfig_c3; do
    DNS_SVC_IP="$(kubectl --kubeconfig ${!CONFIG} get svc -n kube-system -l k8s-app=kube-dns -o jsonpath='{.items[0].spec.clusterIP}')"
    CLUSTER_NAME=$(if [ "${CONFIG}" == "kubeconfig_c1" ]; then echo "cluster-1"; elif [ "${CONFIG}" == "kubeconfig_c2" ]; then echo "cluster-2"; else echo "cluster-3"; fi)
    desc "Installing osm-edge service mesh in cluster ${CLUSTER_NAME}"
    KUBECONFIG=${!CONFIG} $osm_binary install \
      --mesh-name "$OSM_MESH_NAME" \
      --osm-namespace "$OSM_NAMESPACE" \
      --set=osm.certificateProvider.kind=tresor \
      --set=osm.image.pullPolicy=Always \
      --set=osm.sidecarLogLevel=error \
      --set=osm.controllerLogLevel=warn \
      --timeout=900s \
      --set=osm.localDNSProxy.enable=true \
      --set=osm.localDNSProxy.primaryUpstreamDNSServerIPAddr="${DNS_SVC_IP}"

    kubectl --kubeconfig ${!CONFIG} wait --for=condition=ready pod --all -n $OSM_NAMESPACE --timeout=120s
  done
}

function install_karmada_cli() {
  echo "install_karmada"
  curl -s https://raw.githubusercontent.com/karmada-io/karmada/master/hack/install-cli.sh | sudo bash
}

function install_karmada() {
  sudo karmadactl init --kubeconfig ${kubeconfig_cp} --karmada-apiserver-advertise-address ${HOST_IP}

  $kmd apply -f https://raw.githubusercontent.com/flomesh-io/ErieCanal/main/charts/erie-canal/apis/flomesh.io_clusters.yaml
  $kmd apply -f https://raw.githubusercontent.com/flomesh-io/ErieCanal/main/charts/erie-canal/apis/flomesh.io_mcs-api.yaml
}

function join_kmd_cluster() {
  for CONFIG in kubeconfig_c1 kubeconfig_c2 kubeconfig_c3; do
    CLUSTER_NAME=$(if [ "${CONFIG}" == "kubeconfig_c1" ]; then echo "cluster-1"; elif [ "${CONFIG}" == "kubeconfig_c2" ]; then echo "cluster-2"; else echo "cluster-3"; fi)
    desc "Joining ${CLUSTER_NAME} to karmada cluster"
    karmadactl --kubeconfig ${karmada_config} join ${CLUSTER_NAME} --cluster-kubeconfig=${!CONFIG}
  done
}

function run_demo() {
  NAMESPACE=httpbin
  desc "Create namespace ${NAMESPACE} on clusters cluster-1 and cluster-3 with Karmada"
  # $kmd create ns ${NAMESPACE}

  $kmd apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: ${NAMESPACE}
  labels:
    openservicemesh.io/monitored-by: osm
  annotations:
    openservicemesh.io/sidecar-injection: enabled
EOF

  # desc "Add namespace ${NAMESPACE} to service mesh"
  # KUBECONFIG=${kubeconfig_c1} $osm_binary namespace add ${NAMESPACE}
  # KUBECONFIG=${kubeconfig_c3} $osm_binary namespace add ${NAMESPACE}

  desc "Deploy sample app httpbin under the ${NAMESPACE} on clusters cluster-1 and cluster-3 with Karmada"
  $kmd apply -n ${NAMESPACE} -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: httpbin
  labels:
    app: pipy
spec:
  replicas: 2
  selector:
    matchLabels:
      app: pipy
  template:
    metadata:
      labels:
        app: pipy
    spec:
      containers:
        - name: pipy
          image: flomesh/pipy:latest
          ports:
            - containerPort: 8080
          command:
            - pipy
            - -e
            - |
              pipy()
              .listen(8080)
              .serveHTTP(() => new Message(os.env['HOSTNAME'] +'\n'))
---
apiVersion: v1
kind: Service
metadata:
  name: httpbin
spec:
  ports:
    - port: 8080
      targetPort: 8080
      protocol: TCP
  selector:
    app: pipy
EOF

  desc "Apply PropagationPolicy to propagate httpbin cluster-1 and cluster-3"
  $kmd apply -n ${NAMESPACE} -f - <<EOF
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: httpbin
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: httpbin
    - apiVersion: v1
      kind: Service
      name: httpbin
  placement:
    clusterAffinity:
      clusterNames:
        - cluster-1
        - cluster-3
    replicaScheduling:
      replicaDivisionPreference: Weighted
      replicaSchedulingType: Divided
      weightPreference:
        staticWeightList:
          - targetCluster:
              clusterNames:
                - cluster-1
            weight: 10
          - targetCluster:
              clusterNames:
                - cluster-3
            weight: 10
EOF

  run "sleep 2"
  run "$k1 wait --for=condition=ready pod -n ${NAMESPACE} --all --timeout=60s"
  run "$k3 wait --for=condition=ready pod -n ${NAMESPACE} --all --timeout=60s"

  NAMESPACE=curl
  desc "Create namespace ${NAMESPACE} on clusters cluster-2 with Karmada"
  
  $kmd apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: ${NAMESPACE}
  labels:
    openservicemesh.io/monitored-by: osm
  annotations:
    openservicemesh.io/sidecar-injection: enabled
EOF
  # $kmd create ns ${NAMESPACE}

  # desc "Add namespace ${NAMESPACE} to service mesh"
  # KUBECONFIG=${kubeconfig_c2} $osm_binary namespace add ${NAMESPACE}

  desc "Deploy sample app curl under the ${NAMESPACE} on clusters cluster-2 with Karmada"
  $kmd apply -n ${NAMESPACE} -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: curl
  name: curl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: curl
  strategy: {}
  template:
    metadata:
      creationTimestamp: null
      labels:
        app: curl
    spec:
      containers:
      - image: curlimages/curl
        name: curl
        command:
          - sleep
          - 365d
---
apiVersion: v1
kind: Service
metadata:
  name: curl
  labels:
    app: curl
    service: curl
spec:
  ports:
    - name: http
      port: 80
  selector:
    app: curl
EOF

  desc "Apply PropagationPolicy to propagate curl cluster-2"
  $kmd apply -n ${NAMESPACE} -f - <<EOF
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: curl
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: curl
    - apiVersion: v1
      kind: Service
      name: curl
  placement:
    clusterAffinity:
      clusterNames:
        - cluster-2
    replicaScheduling:
      replicaDivisionPreference: Weighted
      replicaSchedulingType: Divided
      weightPreference:
        staticWeightList:
          - targetCluster:
              clusterNames:
                - cluster-2
            weight: 10
EOF

  run "sleep 2"
  run "$k2 wait --for=condition=ready pod -n ${NAMESPACE} --all --timeout=60s"

  desc "Let's export services in cluster-1 and cluster-3 with Karmada"
  NAMESPACE=httpbin
  $kmd apply -n ${NAMESPACE} -f - <<EOF
apiVersion: flomesh.io/v1alpha1
kind: ServiceExport
metadata:
  name: httpbin
spec:
  serviceAccountName: "*"
  rules:
    - portNumber: 8080
      path: "/httpbin"
      pathType: Prefix
---
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: httpbin
spec:
  resourceSelectors:
    - apiVersion: flomesh.io/v1alpha1
      kind: ServiceExport
      name: httpbin
  placement:
    clusterAffinity:
      clusterNames:
        - cluster-1
        - cluster-2
        - cluster-3
EOF

  run "sleep 5"

  desc "After exporting the services, ErieCanal will automatically create ingress rules for them, and with the rules, you can access these services through Ingress"
  for CLUSTER_NAME in cluster-1 cluster-3; do
    ((PORT = 80 + ${CLUSTER_NAME: -1}))
    desc "calling service in cluster ${CLUSTER_NAME}"
    run "curl -s http://${HOST_IP}:${PORT}/httpbin"
    echo ""
  done

  desc "exported services can be imported into other managed clusters."
  desc "For example, let's look at cluster-2, and we can see services imported"
  run "$k2 get serviceimports -A"

  desc "Let's see if we can access these imported services"
  curl_client="$($k2 get pod -n curl -l app=curl -o jsonpath='{.items[0].metadata.name}')"
  run "$k2 exec "${curl_client}" -n curl -c curl -- curl -s http://httpbin.httpbin:8080/"
  desc "by default no other cluster instance will be used to respond to requests. To access cross cluster services"
  desc "we need to work with GlobalTrafficPolicy CRD"
  desc "Note that all global traffic policies are set on the user’s side, so this demo is about setting global traffic policies on the cluster-2"
  desc "For example: if we want to access http://httpbin.httpbin:8080, we need to create GlobalTrafficPolicy resource"
  run "$kmd apply -n httpbin -f - <<EOF
apiVersion: flomesh.io/v1alpha1
kind: GlobalTrafficPolicy
metadata:
  name: httpbin
spec:
  lbType: ActiveActive
  targets:
    - clusterKey: default/default/default/cluster-1
    - clusterKey: default/default/default/cluster-3
---
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: httpbin
spec:
  resourceSelectors:
    - apiVersion: flomesh.io/v1alpha1
      kind: GlobalTrafficPolicy
      name: httpbin
  placement:
    clusterAffinity:
      clusterNames:
        - cluster-2
EOF"
  run "sleep 8"
  desc "We have a multi-cluster service!"
  desc "See for yourself"
  run "$k2 exec "${curl_client}" -n curl -c curl -- curl -s http://httpbin.httpbin:8080/"
  run "$k2 exec "${curl_client}" -n curl -c curl -- curl -s http://httpbin.httpbin:8080/"
  desc "(Enter to exit)"
  read -s
}

function usage() {
  echo "Usage: $0 [-i|-d|-r|-u" 1>&2
  echo "       -h                     Show this help message"
  echo "       -i                     Creates 4 k3d clusters for demo use. Default true"
  echo "       -d                     Runs demo. Make sure you have created clusters before running this"
  echo "       -r                     Reset clusters and removes demo samples"
  echo "       -u                     Remove clusters by destroying them"
  echo ""
  exit 1
}
trap "echo" EXIT

INSTALL=false
UNINSTALL=false
RESET=false
DEMO=false

if [ $# -eq 0 ]; then
  INSTALL=true
  DEMO=true
fi

SHORT_OPTS=":ihdru"
OPTS=$(getopt $SHORT_OPTS "$@")
if [ $? != 0 ]; then
  echo "Failed to parse options...exiting." >&2
  exit 1
fi

eval set -- "$OPTS"
while true; do
  case "$1" in
  -i)
    INSTALL=true
    shift
    ;;
  -d)
    DEMO=true
    shift
    ;;
  -r)
    RESET=true
    shift
    ;;
  -u)
    UNINSTALL=true
    shift
    ;;
  -h)
    usage
    ;;
  --)
    shift
    break
    ;;
  *)
    usage
    ;;
  esac
done

shift $((OPTIND - 1))
[ $# -ne 0 ] && usage

if [ "$INSTALL" = true ]; then
  echo "Checking for pre-requiste commands"
  # check for docker
  check_command "docker"

  # check for kubectl
  # check_command "kubectl"

  # check for k3d
  check_command "k3d" "curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash"

  # check for helm
  check_command "helm" "curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash"

  # check for pv
  check_command "pv" "sudo apt-get install pv -y"

  # check for jq
  check_command "jq" "sudo apt-get install jq -y"

  echo "creating k3d clusters"
  create_clusters

  k3d kubeconfig get control-plane >"${kubeconfig_cp}"
  k3d kubeconfig get cluster-1 >"${kubeconfig_c1}"
  k3d kubeconfig get cluster-2 >"${kubeconfig_c2}"
  k3d kubeconfig get cluster-3 >"${kubeconfig_c3}"

  desc "installing ErieCanal on clusters"
  install_eriecanal

  desc "Joining clusters into a ErieCanal ClusterSet"
  join_ec_clusters

  desc "downloading osm-edge cli"
  install_osm_edge_binary

  desc "installing osm_edge on clusters"
  install_edge

  desc "installing karmada cli"
  install_karmada_cli

  desc "installing karmada on control-plane cluster"
  install_karmada

  desc "joining clusters into a karmada cluster"
  join_kmd_cluster

  echo "Clusters are ready. Proceed with running demo"
fi

if [ "$RESET" = true ]; then
  ${kmd} delete ns --ignore-not-found=true httpbin curl
fi

if [ "$DEMO" = true ]; then
  run_demo
fi

if [ "$UNINSTALL" = true ]; then
  echo "cleaning up"
  for cluster in control-plane cluster-1 cluster-2 cluster-3; do
    echo "deleting cluster ${cluster}"
    k3d cluster delete ${cluster}
  done

  for config in ${!kubeconfig*}; do
    rm -f ${!config}
  done

  rm -rf "./${system}-${arch}"
fi
