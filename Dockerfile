# Use official Deno image
FROM denoland/deno:latest

# Set the working directory inside the container
WORKDIR /app

# Copy files to the container
COPY . .

# Set permissions for the Deno executable
RUN deno cache main.ts

# Expose the port your app runs on (update if necessary)
EXPOSE 8000

# Command to run the Deno backend
CMD ["run", "--unstable-otel", "-A", "main.ts"]