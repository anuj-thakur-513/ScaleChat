# Scale Chat

Scale Chat is a scalable chat app backend service utilizing Redis to enhance the scalability of web sockets, while leveraging Kafka to streamline the process of writing messages to the database, avoiding the need for individual write operations.

## 🚧 This project is Under Dev 🚧

## Architecture

![](/github_assets/architecture.png)

### DB

![](/github_assets/DB%20Diagram.jpg)

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
