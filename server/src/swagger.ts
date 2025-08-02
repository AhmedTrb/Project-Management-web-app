import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Project Manegement App Express API Documentation',
      version: '1.0.0',
      description: 'API documentation with Swagger and TypeScript',
    },
    servers: [
      {
        url: 'http://localhost:8000/api/',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // path to your route files
};

export const swaggerSpec = swaggerJSDoc(options);
export { swaggerUi };
