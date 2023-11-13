# Virki - Web

Web application for Virki which is built with Vue.js and Tailwind 💚

> ⚠️ This project is very much a work in progress, so it should be considered unstable!

## ✨ Features
* Client-side encryption (using Argon2 and XChaCha20-Poly1305)
* Ability to organise your OTP codes into vaults, with even further organisation through the use of tags
* Offline-first. Your tokens can be accessed anywhere. Any changes you make will be synced up when connected again
* Simple import/export of data (soon). You can remain in complete control of your data

## 💪 Motivation

I was seeking a secure two-factor authentication service which I could store my secrets in, but didn't want to be locked in to services such as Authy or Google Authenticator,
which make it notoriously difficult to export your secrets in a simple format should you want to leave them.

This is why I have set out to build my own! Leveraging client-side technologies in the browser, I have been able to work on building a web application that end-to-end encrypts OTP secrets and stores them securely on the backend.

Here's the technologies in use here:
* Vue.js 3
* Tailwind CSS
* Argon2
* XChaCha20-Poly1305
* Go
* PostgreSQL
* Redis
* S3 Object Storage

## Getting Started

```bash
$ git clone https://github.com/virki-io/Virki-Web.git
$ cd Virki-Web/
$ yarn
$ yarn dev
```

### Docker (Development)
You can get up and running with Virki web client development with nothing but Docker and Docker Compose installed on your system.

```bash
$ docker-compose -f docker-compose-dev.yml up
```

This will start a Vite development server on http://localhost:5173 and hot reload for any changes you make on disk.