# Virki Web

This repository contains the source for the web client.

```bash
$ git clone https://github.com/virki-io/Virki-Web.git
$ cd Virki-Web/
$ yarn
$ yarn dev
```

## Getting started with development (Docker)
You can get up and running with Virki web client development with nothing but Docker and Docker Compose installed on your system.

```bash
$ docker-compose -f docker-compose-dev.yml up
```

This will start a Vite development server on http://localhost:5173 and hot reload for any changes you make on disk.