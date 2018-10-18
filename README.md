Mean stack typescript
=====================

Mean stack application based on Mongoose Express Angular and Nodejs writtent in typescript.

Backend
-------

A Nodejs Express server to expose REST API written in typescript. Persistance is done using Mongoose ORM for MongoDB.

Features

  * Authentication: user database to store login/password
  * Security: Passport JWT strategy
  * REST API:
    * login endpoint: to log in users
    * logout endpoint: to log out users
    * logging endpoint: to log messages from frontend application
    * refresh endpoint: to refresh JWT access token
    * validate endpoint: to validate JWT access token
  * Error handling: ApiError and generic error
  * Logging: multi-stream logging and debug logging

Frontend
--------

An angular application including several modules to handle basic configuration and calling of REST API.

Features

  * Authentication: login modal and JWT authentication
  * API: api caller to discover and handle call to API endpoints (REST resource or not)
  * Configuration: global configuration of core module and submodules
  * i18n: internationalization
  * Routing: base routing
  * Logging: logging of client errors to server log
  * Services: helpers to use base64, exceptions ...

Install
-------

    $ git clone https://github.com/angusyg/mean-stack-ts
    $ cd mean-stack-ts && npm install

Quick Start
-----------

After installation, a folder 'dist' is created at root.
For development, to launch a server and watch files changes, use :

    $ npm run dev
