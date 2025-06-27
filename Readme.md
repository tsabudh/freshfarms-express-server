# Freshfarms - Server for freshfarm's digital logkeeping.

## Overview

Freshfarms' digital record-keeping tool is designed to streamline the management of transactions, customer information, and product inventory for a local dairy shop. This tool simplifies the logging process and ensures accurate record maintenance.

## Project Structure

- **Frontend**: Built with React and deployed on Netlify for fast and reliable access.
- **Backend**: Hosted on AWS EC2 with Nginx as the web server, providing a robust and scalable server environment. Built server application with express over node.js.
- **Data Storage**: User profile pictures and other static assets are stored securely on AWS S3.

## Features

- **Transaction Logging**: Easily log transactions and keep track of sales.
- **Customer Management**: Manage customer information with ease.
- **Inventory Management**: Track product inventory efficiently.

## API Documentation

# Freshfarms API Collection

This repository contains a Postman collection for the Freshfarms API. The collection includes various API endpoints for managing customers, admins, products, and transactions.

## Collection Overview

### Customer

- **Get All Customers**: Retrieve all customers.
- **Add New Customer**: Add a new customer.
- **Get A Customer**: Retrieve details of a specific customer.
- **Delete Customer**: Delete a customer.
- **Update Customer**: Update customer information.
- **Customer Login**: Log in a customer and obtain a JWT token.
- **Get My Details Customer**: Retrieve details of the currently logged-in customer.

### Admin

- **Signup Admin**: Register a new admin.
- **Logout Admin**: Log out the current admin.
- **Login Admin**: Log in an admin and obtain a JWT token.
- **Get My Details**: Retrieve details of the currently logged-in admin.
- **Get All Admins**: Retrieve a list of all admins.
- **Upload Photo**: Upload a profile picture for the admin.
- **Update Admin**: Update admin information.
- **Verify Token**: Verify the current JWT token.

### Product

- **Get All Products**: Retrieve all products.
- **Create Product**: Add a new product.
- **Update Many Products**: Update multiple products.
- **Get A Product**: Retrieve details of a specific product.
- **Update Product**: Update product information.
- **Add Up Product Quantity**: Increase the quantity of a product.

### Transaction

- **Create Transaction**: Create a new transaction.
- **Get all Transaction**: Retriece all transactions. Supports query 'filter' in encrypted filter object format.

This project is licensed under the [MIT License](LICENSE).
