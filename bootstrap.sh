#!/bin/sh
set -eu

# One-command installer for macOS and Linux. It keeps its runtime isolated in
# the user's home and never edits shell startup files.

NODE_VERSION="v24.20.0"
REPO_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
TARGET_HOME=${HOME}
PROJECT=""
PROJECT_ONLY=0
NO_LAUNCH=0
STRUCTURAL_ONLY=0
CONFLICT="fail"

usage() {
  cat <<'EOF'
agent-orchestra bootstrap

Usage: ./bootstrap.sh [options]

Options:
  --home PATH          Override the target home (clean-room testing)
  --project PATH       Install project-local agents into PATH
  --project-only       Leave global configuration untouched (requires --project)
  --conflict POLICY    fail, skip, or backup (default: fail)
  --no-launch          Verify setup without opening Herdr
  --structural-only    Do not require an authenticated OpenCode provider
  --help               Show this help
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --home) [ "$#" -ge 2 ] || { echo "ERROR: --home requires a path" >&2; exit 2; }; TARGET_HOME=$2; shift 2 ;;
    --project) [ "$#" -ge 2 ] || { echo "ERROR: --project requires a path" >&2; exit 2; }; PROJECT=$2; shift 2 ;;
    --project-only) PROJECT_ONLY=1; shift ;;
    --conflict) [ "$#" -ge 2 ] || { echo "ERROR: --conflict requires a policy" >&2; exit 2; }; CONFLICT=$2; shift 2 ;;
    --no-launch) NO_LAUNCH=1; shift ;;
    --structural-only) STRUCTURAL_ONLY=1; shift ;;
    --help|-h) usage; exit 0 ;;
    *) echo "ERROR: unknown option: $1" >&2; usage >&2; exit 2 ;;
  esac
done

case "$CONFLICT" in fail|skip|backup) ;; *) echo "ERROR: --conflict must be fail, skip, or backup" >&2; exit 2 ;; esac
[ "$PROJECT_ONLY" -eq 0 ] || [ -n "$PROJECT" ] || { echo "ERROR: --project-only requires --project" >&2; exit 2; }

case "$TARGET_HOME" in /*) ;; *) TARGET_HOME="$(pwd)/$TARGET_HOME" ;; esac
if [ -n "$PROJECT" ]; then
  case "$PROJECT" in /*) ;; *) PROJECT="$(pwd)/$PROJECT" ;; esac
  [ -d "$PROJECT" ] || { echo "ERROR: project directory does not exist: $PROJECT" >&2; exit 1; }
fi

RUNTIME_DIR="$TARGET_HOME/.local/share/agent-orchestra"
BIN_DIR="$RUNTIME_DIR/bin"
NPM_PREFIX="$RUNTIME_DIR/npm"
mkdir -p "$BIN_DIR" "$NPM_PREFIX"
PATH="$BIN_DIR:$NPM_PREFIX/bin:$TARGET_HOME/.opencode/bin:$TARGET_HOME/.local/bin:$PATH"
export PATH HOME="$TARGET_HOME" USERPROFILE="$TARGET_HOME"

step() { printf '\n==> %s\n' "$1"; }
fail() { printf 'ERROR: %s\n' "$1" >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || fail "required command not found: $1"; }

install_node() {
  if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
    major=$(node -p 'Number(process.versions.node.split(".")[0])')
    [ "$major" -ge 20 ] && return 0
  fi

  need curl
  need tar
  os=$(uname -s)
  arch=$(uname -m)
  case "$os" in Darwin) platform="darwin" ;; Linux) platform="linux" ;; *) fail "supported systems are macOS and Linux; use bootstrap.ps1 on Windows" ;; esac
  case "$arch" in arm64|aarch64) architecture="arm64" ;; x86_64|amd64) architecture="x64" ;; *) fail "unsupported architecture: $arch" ;; esac

  archive="node-${NODE_VERSION}-${platform}-${architecture}.tar.gz"
  node_dir="$RUNTIME_DIR/node-${NODE_VERSION}-${platform}-${architecture}"
  if [ ! -x "$node_dir/bin/node" ]; then
    temporary=$(mktemp -d)
    trap 'rm -rf "$temporary"' EXIT HUP INT TERM
    base="https://nodejs.org/dist/${NODE_VERSION}"
    step "Installing isolated Node.js ${NODE_VERSION}"
    curl -fsSL --retry 3 "$base/SHASUMS256.txt" -o "$temporary/SHASUMS256.txt"
    curl -fsSL --retry 3 "$base/$archive" -o "$temporary/$archive"
    expected=$(awk -v file="$archive" '$2 == file { print $1; exit }' "$temporary/SHASUMS256.txt")
    [ -n "$expected" ] || fail "Node.js checksum is missing for $archive"
    if command -v sha256sum >/dev/null 2>&1; then actual=$(sha256sum "$temporary/$archive" | awk '{print $1}')
    elif command -v shasum >/dev/null 2>&1; then actual=$(shasum -a 256 "$temporary/$archive" | awk '{print $1}')
    elif command -v openssl >/dev/null 2>&1; then actual=$(openssl dgst -sha256 "$temporary/$archive" | awk '{print $NF}')
    else fail "SHA-256 verification requires sha256sum, shasum, or openssl"
    fi
    [ "$actual" = "$expected" ] || fail "Node.js checksum did not match"
    mkdir -p "$node_dir"
    tar -xzf "$temporary/$archive" -C "$node_dir" --strip-components=1
    rm -rf "$temporary"
    trap - EXIT HUP INT TERM
  fi
  PATH="$node_dir/bin:$PATH"
  export PATH
}

install_herdr() {
  command -v herdr >/dev/null 2>&1 && return 0
  need curl
  step "Installing Herdr into the isolated runtime"
  curl -fsSL https://herdr.dev/install.sh | HERDR_INSTALL_DIR="$BIN_DIR" sh
  command -v herdr >/dev/null 2>&1 || fail "Herdr installation did not produce an executable"
}

install_opencode() {
  command -v opencode >/dev/null 2>&1 && return 0
  step "Installing OpenCode into the isolated runtime"
  npm install --global --prefix "$NPM_PREFIX" opencode-ai
  command -v opencode >/dev/null 2>&1 || fail "OpenCode installation did not produce an executable"
}

step "Preparing portable runtime"
install_node
install_herdr
install_opencode

step "Detected tools"
node --version
herdr --version
opencode --version

step "Installing the agent team"
# Paths are validated above and passed as individual arguments through this helper.
set -- install --home "$TARGET_HOME" --conflict "$CONFLICT"
if [ -n "$PROJECT" ]; then set -- "$@" --project "$PROJECT"; fi
if [ "$PROJECT_ONLY" -eq 1 ]; then set -- "$@" --project-only; fi
node "$REPO_DIR/orchestra.mjs" "$@"

step "Verifying files and runtime"
set -- doctor --home "$TARGET_HOME" --installed --structural
if [ -n "$PROJECT" ]; then set -- "$@" --project "$PROJECT"; fi
if [ "$PROJECT_ONLY" -eq 1 ]; then set -- "$@" --project-only; fi
node "$REPO_DIR/orchestra.mjs" "$@"

if [ "$STRUCTURAL_ONLY" -eq 0 ]; then
  step "Verifying authenticated model routes"
  set -- doctor --home "$TARGET_HOME" --installed
  if [ -n "$PROJECT" ]; then set -- "$@" --project "$PROJECT"; fi
  if [ "$PROJECT_ONLY" -eq 1 ]; then set -- "$@" --project-only; fi
  node "$REPO_DIR/orchestra.mjs" "$@"
fi

printf '\nREADY: agent-orchestra is installed and verified.\n'
if [ "$NO_LAUNCH" -eq 1 ]; then exit 0; fi

launch_dir=${PROJECT:-$REPO_DIR}
step "Opening the dedicated agent-orchestra Herdr session"
cd "$launch_dir"
opencode_binary=$(command -v opencode)
herdr_config="$RUNTIME_DIR/herdr.toml"
node -e 'const fs = require("node:fs"); const [file, shell] = process.argv.slice(1); fs.writeFileSync(file, `[terminal]\ndefault_shell = ${JSON.stringify(shell)}\nshell_mode = "non_login"\nnew_cwd = "current"\n`);' "$herdr_config" "$opencode_binary"
export HERDR_CONFIG_PATH="$herdr_config"
export OPENCODE_CONFIG_CONTENT='{"default_agent":"lenka"}'
exec herdr --session agent-orchestra
