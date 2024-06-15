# Scale Chat

Scale Chat is a scalable chat app backend service utilizing Redis to enhance the scalability of web sockets, while leveraging Kafka to streamline the process of writing messages to the database, avoiding the need for individual write operations.

## Architecture

![](/github_assets/architecture.png)

### DB

![](/github_assets/DB%20Diagram.jpg)

## Folder Structure

```
.
├── README.md
├── github_assets
│   ├── DB Diagram.jpg
│   └── architecture.png
├── package-lock.json
├── package.json
├── prisma
│   ├── ca.pem
│   ├── example_key.pem
│   ├── migrations
│   │   ├── 20240502172518_init
│   │   │   └── migration.sql
│   │   ├── 20240504090739_init
│   │   │   └── migration.sql
│   │   ├── 20240504092402_update_tables
│   │   │   └── migration.sql
│   │   ├── 20240504105700_update_users_table
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   └── schema.prisma
├── public
│   ├── auth
│   │   └── index.html
│   └── chat
│       └── index.html
└── src
    ├── config
    │   ├── cookies.config.js
    │   ├── kafka.config.js
    │   └── redis.config.js
    ├── controllers
    │   ├── message
    │   │   └── message.controller.js
    │   └── user
    │       ├── userAuth.controller.js
    │       └── userDetails.controller.js
    ├── index.js
    ├── middlewares
    │   └── auth.middleware.js
    ├── routes
    │   ├── message.routes.js
    │   ├── user.routes.js
    │   └── version1.routes.js
    ├── service
    │   ├── cronJob.js
    │   ├── kafka
    │   │   ├── admin.js
    │   │   ├── client.js
    │   │   ├── consumer.js
    │   │   └── producer.js
    │   ├── prisma.js
    │   ├── redis.js
    │   └── socket.js
    └── utils
        ├── ApiError.js
        ├── ApiResponse.js
        ├── asyncHandler.js
        ├── bcrypt.js
        ├── constants.js
        ├── generateChatPair.js
        ├── jwt.js
        └── socketManager.js
```

## Run Locally

### Clone the project

```bash
git clone https://github.com/anuj-thakur-513/ScaleChat.git
```

### Go to the project directory

```bash
cd ScaleChat
```

### Install dependencies

```bash
npm install
```

### Install PM2

```bash
npm install pm2@latest -g
```

### Start Zookeper Container and expose PORT `2181`

```bash
docker run -p 2181:2181 zookeeper
```

### Start Kafka Container, expose PORT `9092` and setup ENV variables

```bash
docker run -p 9092:9092 \
-e KAFKA_ZOOKEEPER_CONNECT=<PRIVATE_IP>:2181 \
-e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://<PRIVATE_IP>:9092 \
-e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
confluentinc/cp-kafka
```

#### Change `.env.example` to `.env` and update the variables in the file

#### Replace `./prisma/example_key.pem` with your own DB key

### Run Kafka Admin to create topic in your local Kafka Server

```bash
npm run kafka-admin
```

### Spin up the Server on PORT `8000`

```bash
npm start or npm run dev
```

### Run the Application in Cluster Mode

```bash
pm2 start src/index.js -i max
```
