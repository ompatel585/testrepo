## 🚀 Docker Compose Commands

```bash
# Start all services with build in detached mode using a specific env file and compose file
## 🛠️ Start All Services
docker compose --env-file .env.docker -f docker-compose.local.yml up --build -d

# Stop and remove all services including volumes using the same env file and compose file
# 🛑 Stop and Remove Services
docker compose --env-file .env.docker -f docker-compose.local.yml down --volumes

# 🔍 Check Running Containers Status
docker compose --env-file .env.docker -f docker-compose.local.yml ps

# 📜 View live logs of the backend service
docker compose --env-file .env.docker -f docker-compose.local.yml logs -f backend

# 🔄 Rebuild and start only the backend service
docker compose --env-file .env.docker -f docker-compose.local.yml up --build -d backend

# 🖼️ List All Docker Images
docker image ls

# 🗑️ Remove Docker Image
docker image rm <IMAGE_ID>

# 🧑‍💻 Check Image Filesystem
docker run -it --rm <IMAGE_ID> sh


# Best Practices
Always pass .env.docker: Include .env.docker in both up and down commands to ensure environment variables are consistently applied.

Use plain .sql for DB dumps: Stick to plain .sql format for database dumps to avoid needing additional scripts or manual restores. 

Inject .env.docker during container creation: Pass .env.docker when creating containers to ensure consistent and secure environment variable injection.

# setup docker & docker compose for (Ubuntu)
ubuntu: https://docs.docker.com/engine/install/ubuntu/
ubuntu: https://docs.docker.com/compose/install/linux/

# setup docker & docker compose for (Mac)
mac: https://docs.docker.com/desktop/setup/install/mac-install/
