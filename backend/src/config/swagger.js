import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "MindCare API",
            version: "1.0.0",
            description: "Dokumentasi REST API MindCare"
        },
        servers: [
            {
                // url: `${process.env.API_BASE_URL}/api` || "http://localhost:3000/api",
                url: "http://localhost:3000/api",
                description: "API Server"
            },
            {
                url: "https://capstone-project-mindcare.vercel.app/api",
                description: "Production"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ["./src/docs/*.yaml"],
};

export default swaggerJsdoc(options);