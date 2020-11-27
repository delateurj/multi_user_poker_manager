## Introduction

This project was created to make a starting point for projects that are multi-user PERN stack apps.
The major functionality of the base app is outlined below:

Client

- Home page
- User signup
- User signin
  With password reset request support
- Admin panel for managing users

Backend

- On signup, new users are autmatically given a dedicated schema in the database for each app the user is associated with. (note many ways of doing this, for apps involving thousands of users, this approach works. For larger user bases, this may not be appropriate.)
- Typically needed back end functionality of a multi-user PERN app.

Technology choices beyond the PERN stack:

- Create React App was used for client side and is not ejected at this point
- Emotion for css.
- Axios for client calls to server
- Passport for user authentication
- Reach router for client router
- React testing library and jest for client unit testing
- Knex for server to Postgres calls
- Sendgrid for processing password reset request emails

## Prerequisites

- Postgres
- Redis
- Sendgrid account

## Install

- Copy/clone repository
- run npm install from client and server directories

## Configuration

- Create .env file with appropriate values for your environment
  (see /server/example.env)

## Usage

- Server
- Client development is normal CRA process...NPM start in client directory.

## Notes
