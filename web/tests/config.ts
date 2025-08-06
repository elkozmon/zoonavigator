export function getZooKeeperConnectionString(): string {
  return process.env.ZK_CONNECTION_STRING || "localhost:2181";
}

export const config = {
  testsNode: "/tests",
  zookeeper: {
    connectionString: getZooKeeperConnectionString(),
  },
};
