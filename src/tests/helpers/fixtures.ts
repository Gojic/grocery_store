export const FIX = {
  user: {
    _id: "650000000000000000000001",
    email: "u@test.com",
    name: "User",
    role: "MANAGER",
    nodeId: "6500000000000000000000aa",
    passwordHash: "hashed",
  },
  loginOkBody: { email: "u@test.com", password: "Test123!" },
  loginBadBody: { email: "u@test.com", password: "Wrong123!" },
};
