import { faker } from "https://cdn.jsdelivr.net/npm/@faker-js/faker/+esm";
import { connectDB } from "./database.ts";
import User, { Status } from "./model/User.ts";
import { Types } from "mongoose";

// Connect to MongoDB
await connectDB();

async function seedUsers() {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log("Existing users removed");
    // Generate dummy users
    const dummyUsers = Array.from({ length: 1000 }).map(() => {
        const past = faker.date.past();
        return {
        _id: new Types.ObjectId(Math.floor(past.getTime()) / 1000),
      username: faker.internet.username(),
      email: faker.internet.email(),
      password: "$2a$10$xyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyz", // Dummy bcrypt hash
      status: Status.Visible,
      createdAt: past,
      updatedAt: new Date(),
      displayName: faker.person.fullName(),
      description: faker.person.bio(),
      avatarUrl: faker.image.avatar(),
    }});

    // Insert the dummy users into the collection
    await User.insertMany(dummyUsers);
    console.log("✅ Dummy users inserted successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  }
}

// Run the seeding function
await seedUsers();
