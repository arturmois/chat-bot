import axios from "axios";

test("Should handle webhook", async () => {
    const input = {
        name: "John",
        age: 20,
        email: "john@example.com",
        password: "password",
        confirmPassword: "password",
    }
    const output = await axios.post("http://localhost:3000/webhook", input);
    expect(output.status).toBe(200);
    expect(output.data).toBe("Hello World");
});