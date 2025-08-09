export function getZooKeeperConnectionString(): string {
  return process.env.ZK_CONNECTION_STRING || "localhost:2181";
}

export function getTestNode(): string {
  return process.env.ZK_TEST_NODE || "/test";
}
