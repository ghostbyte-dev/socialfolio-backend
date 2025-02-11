import { model, Schema } from "npm:mongoose";

// Define schema.
const profileScheme = new Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: { type: String }  
});

// Validations

// Export model.
export default model("Dinosaur", profileScheme);