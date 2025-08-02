"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerUi = exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
exports.swaggerUi = swagger_ui_express_1.default;
const options = {
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
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
