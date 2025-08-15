# Project Architecture

This document outlines the architecture and design patterns used in the Wynn API Automation framework.

## Architecture Overview

The framework follows a layered architecture pattern with clear separation of concerns:

- **Authentication Layer** - Handles auth tokens and global setup
- **Configuration Management** - Dynamic configuration loading
- **Request Layer** - API URL builders and request handling
- **Validation Layer** - Response schema validation
- **Service Layer** - Business logic encapsulation
- **Test Layer** - Test specifications and execution
- **Utility Layer** - Common helper functions

## Design Patterns

- Repository Pattern for API requests
- Page Object Model adaptation for API endpoints
- Factory Pattern for test data generation
- Builder Pattern for request construction
