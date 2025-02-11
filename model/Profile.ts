import { model, Schema } from "npm:mongoose";

// Define schema.
const profileScheme = new Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },  
});

// Validations

// Export model.
export default model("Dinosaur", profileScheme);