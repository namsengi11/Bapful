# Bapful API

A FastAPI-based backend for a travel restaurant review application with location-based services and menu translation features.

## Features

- 🔐 **JWT Authentication** - User registration and login
- 📍 **Location Services** - Find nearby restaurants with reviews
- ⭐ **Review System** - Rate restaurants and vote on reviews
- 🍜 **Menu Translation** - Upload menu photos with mock translation
- 📁 **File Storage** - Configurable storage (local/S3)
- 🗄️ **PostgreSQL Database** - Robust data persistence
- 📝 **API Documentation** - Auto-generated with FastAPI

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Locations & Reviews

- `GET /locations` - Get nearby locations
- `GET /locations/{id}/reviews` - Get location reviews
- `POST /locations/{id}/reviews` - Create review
- `POST /locations/{id}/review/{review_id}/rate` - Rate review

### Menu Translation

- `POST /menus/upload-photo` - Upload menu photo
- `GET /locations/{id}/menus` - Get location menus

## Setup Instructions

### Prerequisites

- Python 3.10+
- PostgreSQL database
- pip or poetry for package management

### Installation

1. **Clone and navigate to the project:**

   ```bash
   cd Bapful
   ```

2. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

3. **Set up PostgreSQL database:**

   ```bash
   # Create database
   createdb bapful_db
   ```

4. **Configure environment:**

   ```bash
   # Copy environment template
   cp .env.example .env

   # Edit .env with your database credentials
   DATABASE_URL=postgresql://username:password@localhost:5432/bapful_db
   ```

5. **Initialize database migrations:**

   ```bash
   alembic revision --autogenerate -m "Initial migration"
   alembic upgrade head
   ```

6. **Run the server:**
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

The API will be available at:

- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **Health**: http://localhost:8000/health

## Project Structure

```
app/
├── __init__.py
├── main.py              # FastAPI app and configuration
├── config.py            # Settings and configuration
├── database.py          # Database connection and session
├── models.py            # SQLAlchemy models
├── schemas.py           # Pydantic schemas
├── auth.py              # Authentication logic
├── storage.py           # File storage abstraction
├── services.py          # Business logic services
└── routes/
    ├── __init__.py
    ├── auth.py          # Authentication routes
    ├── locations.py     # Location and review routes
    └── menus.py         # Menu upload routes
```

## Configuration

Key configuration options in `.env`:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/bapful_db

# JWT Authentication
JWT_SECRET_KEY=your-secret-key
JWT_EXPIRATION_HOURS=24

# File Storage
UPLOADS_DIR=uploads
MAX_FILE_SIZE=10485760
```

## Architecture Notes

### File Storage

The application uses an abstract storage interface that can be easily switched between local and S3 storage:

```python
# Current: Local storage
fileStorage = LocalFileStorage()

# Future: Switch to S3
fileStorage = S3FileStorage(bucketName="my-bucket")
```

### Mock Services

- **Menu Translation**: Currently returns mock translated data
- **Location Data**: Uses hardcoded sample locations
- **Ready for Integration**: Easily replaceable with real services

### Database Design

- **Scalable Schema**: Designed for growth with proper indexing
- **Relationships**: Proper foreign keys and joins
- **Migration Support**: Alembic for schema evolution

## Development

### Adding New Features

1. Add models in `models.py`
2. Create schemas in `schemas.py`
3. Implement business logic in `services.py`
4. Add routes in appropriate route files
5. Update tests and documentation

### Database Migrations

#### Workflow Example

Here's the typical workflow when you need to change your database schema:

1. **Modify your models** in `app/models.py`:

   ```python
   # Add a new field to an existing model
   class Location(Base):
       # ... existing fields ...
       new_field = Column(String, nullable=True)
   ```

2. **Generate migration**:

   ```bash
   alembic revision --autogenerate -m "Add new_field to Location"
   ```

   - Alembic compares your models to the current database
   - Creates a migration file in `alembic/versions/`
   - The file contains the SQL commands to update your schema

3. **Apply the migration**:
   ```bash
   alembic upgrade head
   ```
   - Executes the migration against your database
   - Updates the database schema to match your models

#### Common Commands

```bash
# Generate migration
alembic revision --autogenerate -m "Description"

# Apply migration
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View migration history
alembic history

# Check current database version
alembic current
```

## Production Considerations

1. **Environment Variables**: Set secure values for JWT_SECRET_KEY
2. **Database**: Configure production PostgreSQL with connection pooling
3. **File Storage**: Switch to S3 for scalability
4. **CORS**: Configure appropriate origins
5. **Logging**: Set up centralized logging
6. **Rate Limiting**: Add rate limiting middleware
7. **Health Monitoring**: Implement comprehensive health checks

## API Testing

Use the interactive docs at `/docs` or test with curl:

```bash
# Register user
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"secret123"}'

# Get nearby locations
curl "http://localhost:8000/locations?lat=48.8566&lng=2.3522&radius=1000"
```
