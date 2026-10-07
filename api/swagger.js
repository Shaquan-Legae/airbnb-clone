const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "Airbnb Clone API",
    version: "1.0.0",
    description: "RESTful API documentation for the Airbnb Clone application.",
  },
  servers: [
    {
      url: "https://airbnb-clone-backend-r26p.onrender.com",
      description: "Production Server (Render)",
    },
    {
      url: "http://localhost:4000",
      description: "Local Development Server",
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
        description: "JWT cookie set automatically upon login/register",
      },
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Bearer JWT token in Authorization header",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          country: { type: "string" },
          city: { type: "string" },
          bio: { type: "string" },
          profilePhoto: { type: "string" },
          role: { type: "string", enum: ["guest", "host"] },
        },
      },
      Place: {
        type: "object",
        properties: {
          _id: { type: "string" },
          owner: { type: "string" },
          title: { type: "string" },
          address: { type: "string" },
          photos: { type: "array", items: { type: "string" } },
          description: { type: "string" },
          perks: { type: "array", items: { type: "string" } },
          extraInfo: { type: "string" },
          checkIn: { type: "string" },
          checkOut: { type: "string" },
          maxGuests: { type: "number" },
          price: { type: "number" },
          beds: { type: "number" },
        },
      },
      Reservation: {
        type: "object",
        properties: {
          _id: { type: "string" },
          place: { $ref: "#/components/schemas/Place" },
          guest: { type: "string" },
          checkIn: { type: "string", format: "date" },
          checkOut: { type: "string", format: "date" },
          guests: { type: "number" },
          totalPrice: { type: "number" },
          status: { type: "string", enum: ["pending", "confirmed", "declined", "cancelled"] },
        },
      },
    },
  },
  paths: {
    "/test": {
      get: {
        summary: "Health Check",
        description: "Checks server status and environment connectivity.",
        responses: {
          200: { description: "Server is healthy." },
        },
      },
    },
    "/register": {
      post: {
        summary: "User Registration",
        description: "Registers a new user, sets a session cookie, and returns user data with JWT token.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "John Doe" },
                  email: { type: "string", example: "john@example.com" },
                  password: { type: "string", example: "secret123" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "User successfully registered." },
          400: { description: "Validation error." },
          409: { description: "User already exists." },
        },
      },
    },
    "/login": {
      post: {
        summary: "User Login",
        description: "Authenticates an existing user and sets an HttpOnly JWT cookie.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "john@example.com" },
                  password: { type: "string", example: "secret123" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login successful." },
          401: { description: "Invalid credentials." },
        },
      },
    },
    "/logout": {
      post: {
        summary: "User Logout",
        description: "Clears the authentication cookie.",
        responses: {
          200: { description: "Logged out successfully." },
        },
      },
    },
    "/profile": {
      get: {
        summary: "Get Current Profile",
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: { description: "User profile details." },
          401: { description: "Unauthorized." },
        },
      },
      put: {
        summary: "Update Profile",
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  firstName: { type: "string" },
                  lastName: { type: "string" },
                  email: { type: "string" },
                  phone: { type: "string" },
                  country: { type: "string" },
                  city: { type: "string" },
                  bio: { type: "string" },
                  profilePhoto: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Profile updated successfully." },
          400: { description: "Validation errors." },
          401: { description: "Unauthorized." },
        },
      },
    },
    "/become-host": {
      post: {
        summary: "Upgrade to Host",
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: { description: "User role upgraded to host." },
          401: { description: "Unauthorized." },
        },
      },
    },
    "/listings": {
      get: {
        summary: "List Accommodations",
        parameters: [
          { name: "location", in: "query", schema: { type: "string" } },
          { name: "date", in: "query", schema: { type: "string" } },
          { name: "guests", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "List of places matching query.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Place" },
                },
              },
            },
          },
        },
      },
    },
    "/listings/{id}": {
      get: {
        summary: "Get Single Listing",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Place details." },
          404: { description: "Place not found." },
        },
      },
    },
    "/places": {
      get: {
        summary: "Get Host Places",
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: { description: "List of places owned by current host." },
          403: { description: "Host access required." },
        },
      },
      post: {
        summary: "Create New Place",
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: { description: "Place created successfully." },
          403: { description: "Host access required." },
        },
      },
    },
    "/places/{id}": {
      get: {
        summary: "Get Host Place Details",
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Place details." },
          403: { description: "Host access required." },
        },
      },
      put: {
        summary: "Update Host Place",
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Place updated successfully." },
          403: { description: "Host access required." },
        },
      },
      delete: {
        summary: "Delete Host Place",
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Place deleted successfully." },
          403: { description: "Host access required." },
        },
      },
    },
    "/reservations": {
      post: {
        summary: "Create Reservation",
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: { description: "Reservation booked successfully." },
          401: { description: "Unauthorized." },
        },
      },
    },
    "/reservations/my": {
      get: {
        summary: "Get Current User Reservations",
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: { description: "List of user bookings." },
          401: { description: "Unauthorized." },
        },
      },
    },
    "/reservations/host": {
      get: {
        summary: "Get Host Reservations",
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: { description: "List of guest bookings on host places." },
          403: { description: "Host access required." },
        },
      },
    },
    "/reservations/unavailable/{placeId}": {
      get: {
        summary: "Get Unavailable Booking Dates",
        parameters: [
          { name: "placeId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "List of booked date ranges for calendar." },
        },
      },
    },
    "/upload": {
      post: {
        summary: "Upload Photo Files",
        responses: {
          200: { description: "Array of uploaded filenames." },
        },
      },
    },
    "/upload-by-link": {
      post: {
        summary: "Download Photo from URL",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  link: { type: "string", example: "https://example.com/photo.jpg" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Filename of saved photo." },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
