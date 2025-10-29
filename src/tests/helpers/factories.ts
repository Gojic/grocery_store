export const makeUser = (over: Partial<any> = {}) => ({
  _id: "650000000000000000000001",
  email: "u@test.com",
  name: "User",
  role: "MANAGER",
  nodeId: "6500000000000000000000aa",
  passwordHash: "hashed",
  ...over,
});
