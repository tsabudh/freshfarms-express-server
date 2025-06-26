import request from "supertest";
import app from "../src/app";
import mongoose from "mongoose";
jest.setTimeout(15000);

const mongoDBString: string = (process.env["DATABASE_STRING"] as string).replace(
  "<password>",
  process.env["DATABASE_PASSWORD"] as string
);

describe("Authenticated Transaction routes", () => {
  let accessToken: string;

  beforeAll(async () => {
    console.log("Logging in...");
    console.log(
      "Mongoose connection readyState:",
      mongoose.connection.readyState
    );
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoDBString);
      console.log('Connected????:',mongoose.connection.readyState);
    }
    const loginRes = await request(app).post("/api/v1/admins/login").send({
      username: "sachin",
      password: "1234",
    });

    console.log("Login response:", loginRes.body);

    accessToken = loginRes.body.token;
  });

  describe("GET /api/v1/transactions", () => {
    it("should return all transactions with correct structure", async () => {
      const useCookie = Math.random() < 0.5;
      let req = request(app).get("/api/v1/transactions");

      if (useCookie) {
        console.log("Using cookie for authentication");
        req = req.set("Cookie", [`access_token=${accessToken}`]); // set cookie header if useCookie is true
      } else {
        req = req.set("Authorization", `Bearer ${accessToken}`); // set Authorization header
      }
      const res = await req;

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(typeof res.body.numberOfResults).toBe("number");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const transaction = res.body.data[0];
      expect(transaction).toHaveProperty("_id");
      expect(transaction).toHaveProperty("type");
      expect(transaction).toHaveProperty("customer");
      expect(transaction.customer).toHaveProperty("customerId");
      expect(transaction.customer).toHaveProperty("name");
      expect(transaction).toHaveProperty("items");
      expect(Array.isArray(transaction.items)).toBe(true);

      const item = transaction.items[0];
      expect(item).toHaveProperty("productId");
      expect(item).toHaveProperty("quantity");
      expect(item).toHaveProperty("productName");
      expect(item).toHaveProperty("priceThen");
    });
  });
});
