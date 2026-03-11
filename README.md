# Incident API

API backend para la gestion de incidentes tecnologicos, construida con NestJS.

## Stack Tecnologico

- **NestJS 11** - Framework backend con TypeScript, decoradores, inyeccion de dependencias y arquitectura modular
- **TypeORM** - ORM para SQL Server (almacenamiento principal de incidentes)
- **Mongoose** - ODM para MongoDB (almacenamiento de eventos/timeline)
- **Axios** (@nestjs/axios) - Cliente HTTP para integracion con el catalogo de servicios
- **class-validator / class-transformer** - Validacion de DTOs con decoradores

## Requisitos

- Node.js 20+
- SQL Server (para almacenamiento de incidentes)
- MongoDB (para almacenamiento de eventos)

## Variables de Entorno

| Variable | Descripcion | Valor por defecto |
|---|---|---|
| `PORT` | Puerto de la aplicacion | `3000` |
| `SQL_HOST` | Host de SQL Server | `localhost` |
| `SQL_PORT` | Puerto de SQL Server | `1433` |
| `SQL_USER` | Usuario de SQL Server | `sa` |
| `SQL_PASSWORD` | Password de SQL Server | `YourStrong!Passw0rd` |
| `SQL_DB_NAME` | Nombre de la base de datos | `IncidentDb` |
| `MONGO_URI` | URI de conexion a MongoDB | `mongodb://localhost:27017/incidentdb` |
| `SERVICE_CATALOG_BASE_URL` | URL base del catalogo de servicios | `http://localhost:3001` |

## Como Ejecutar

### Standalone (desarrollo)

```bash
npm install
npm run start:dev
```

### Con Docker

```bash
docker build -t incident-api .
docker run -p 3000:3000 \
  -e SQL_HOST=host.docker.internal \
  -e MONGO_URI=mongodb://host.docker.internal:27017/incidentdb \
  incident-api
```

### Con Docker Compose

Si existe un archivo `docker-compose.yml` en el repositorio de infraestructura, ejecutar:

```bash
docker compose up --build
```

## Endpoints de la API

### Health Check

```bash
curl http://localhost:3000/health
```

### Crear un incidente

```bash
curl -X POST http://localhost:3000/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Servicio de pagos caido",
    "description": "El servicio de pagos no responde desde las 10:00 AM",
    "severity": "CRITICAL",
    "serviceId": "svc-payments"
  }'
```

### Listar incidentes (con filtros y paginacion)

```bash
# Todos los incidentes
curl http://localhost:3000/incidents

# Con filtros
curl "http://localhost:3000/incidents?status=OPEN&severity=CRITICAL&page=1&pageSize=5"

# Busqueda por titulo
curl "http://localhost:3000/incidents?q=pagos"

# Ordenamiento
curl "http://localhost:3000/incidents?sort=createdAt_asc"
```

### Obtener un incidente con su timeline

```bash
curl http://localhost:3000/incidents/{id}
```

### Actualizar estado de un incidente

```bash
curl -X PATCH http://localhost:3000/incidents/{id}/status \
  -H "Content-Type: application/json" \
  -d '{ "status": "IN_PROGRESS" }'
```

Valores validos para `status`: `OPEN`, `IN_PROGRESS`, `RESOLVED`

## Tests

```bash
# Tests unitarios
npm run test

# Tests con cobertura
npm run test:cov

# Tests e2e
npm run test:e2e
```

## Decisiones de Arquitectura

### Por que NestJS?

- **TypeScript nativo**: Tipado fuerte reduce errores en tiempo de desarrollo y facilita el refactoring
- **Decoradores**: Simplifican la declaracion de rutas, validaciones, entidades y esquemas
- **Inyeccion de Dependencias (DI)**: Facilita el testing (mock de servicios), desacoplamiento y mantenibilidad
- **Arquitectura modular**: Cada dominio (incidents, events, service-catalog) es un modulo independiente con sus propios providers, controllers e imports
- **Ecosistema**: Integraciones oficiales con TypeORM, Mongoose y Axios reducen boilerplate

### Separacion de almacenamiento

- **SQL Server (TypeORM)**: Datos estructurados de incidentes que requieren consultas relacionales, filtros y paginacion
- **MongoDB (Mongoose)**: Eventos/timeline con estructura flexible (payload variable por tipo de evento), ideal para append-only logs

### Integracion con Catalogo de Servicios

- Se realiza via HTTP al crear un incidente, almacenando un snapshot del servicio como evento
- Los errores de conexion se manejan gracefully (no bloquean la creacion del incidente)

## Pendientes

- Autenticacion y autorizacion (JWT, roles)
- Rate limiting
- Migraciones de base de datos (TypeORM migrations en vez de synchronize)
- Swagger/OpenAPI para documentacion interactiva
- Metricas y observabilidad (health checks detallados, Prometheus)
- WebSockets para notificaciones en tiempo real
- Tests de integracion con bases de datos reales
