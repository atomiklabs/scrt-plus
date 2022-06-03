// TODO FIX OPEN OSX ERROR: localhost:9091, 1337, 26657 -> Connection Refused
// Command:   nc -vz localhost 9091
// Result:    nc: connectx to localhost port 9091 (tcp) failed: Connection refused
// WORKAROUND: GITPOD_WORKSPACE_URL -> https://www.gitpod.io/docs/environment-variables/
const TEMP_GITPOD_WORKSPACE_URL = 'atomiklabs-scrtnetworkd-opkb4uszz6x.ws-us46.gitpod.io'

export const CONFIG = {
  CHAIN_ID: 'secretdev-1',
  CHAIN_NAME: 'Secret Local',
  CHAIN_gRPC: `https://9091-${TEMP_GITPOD_WORKSPACE_URL}`,
  CHAIN_RPC: `https://26657-${TEMP_GITPOD_WORKSPACE_URL}`,
  CHAIN_REST: `https://1317-${TEMP_GITPOD_WORKSPACE_URL}`,
  // counterAddr: '....',
}
