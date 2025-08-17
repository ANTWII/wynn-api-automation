# Wynn API Automation

[![API Tests](https://github.com/ANTWII/wynn-api-automation/actions/workflows/api-tests.yml/badge.svg)](https://github.com/ANTWII/wynn-api-automation/actions/workflows/api-tests.yml)

This project contains comprehensive **API automation tests** built with Playwright and TypeScript, featuring CRUD operations testing with dynamic test data generation using Faker.js. The project focuses exclusively on API testing with JSONPlaceholder endpoints.

## 🚀 Features

- **API-First Testing**: Focused exclusively on REST API testing with JSONPlaceholder
- **Dynamic API Test Data**: Faker.js integration for realistic API request payloads  
- **Real API Data Integration**: Tests use actual JSONPlaceholder API data for validation
- **Comprehensive Negative Testing**: Realistic edge cases and error scenarios
- **Automated API CI/CD**: Single GitHub Actions workflow for continuous API testing
- **Complete Test Coverage**: All API operations (CRUD) with integration testing
- **Test Reports & Traces**: HTML reports and failure traces for debugging

## 📋 Prerequisites

Before setting up this project, ensure you have the following installed:

- **Node.js**: Version 20 or higher (LTS recommended)
- **npm**: Version 8 or higher (comes with Node.js)
- **Git**: For cloning the repository
- **VS Code**: Recommended IDE with TypeScript support

### System Requirements
- **Operating System**: Windows 10+, macOS 10.15+, or Ubuntu 18.04+
- **RAM**: Minimum 4GB (8GB recommended for running tests in parallel)
- **Storage**: At least 2GB free space for dependencies and browser installations

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/ANTWII/wynn-api-automation.git
cd wynn-api-automation
```

### 2. Install Dependencies
```bash
# Install all npm dependencies
npm install

# Install Playwright (for API testing capabilities)
npx playwright install
```

### 3. Verify Installation
```bash
# Check if all dependencies are correctly installed
npm run compile

# Run a quick smoke test
npx playwright test tests/postsRead.spec.ts
```

### 4. Environment Setup (Optional)
The project uses JSONPlaceholder API which doesn't require authentication. However, you can customize the base endpoint:

```bash
# Create a .env file (optional)
echo "BASE_ENDPOINT=https://jsonplaceholder.typicode.com" > .env
```

## 🧪 Running Tests

### Basic Test Execution

```bash
# Run all tests
npm test

# Run tests in debug mode
npm run test:debug

# Compile TypeScript before running tests
npm run compile
```

### Specific Test Categories

```bash
# Run only positive tests (main functionality)
npx playwright test --grep-invert "@negative"

# Run only negative tests (error scenarios)
npx playwright test --grep "@negative"

# Understanding Negative Test Failures
# Negative tests are EXPECTED to fail when testing against JSONPlaceholder
# These failures identify API validation discrepancies and are valuable for:
# 1. Understanding mock API vs real API differences
# 2. Identifying service layer constraints
# 3. Documenting expected error behaviors

# Run specific test file
npx playwright test tests/postsCreate.spec.ts
```

### Test Filtering and Execution

```bash
# Run tests matching a specific pattern
npx playwright test --grep "POST.*Create"

# Run tests for specific CRUD operation
npx playwright test tests/postsCreate.spec.ts tests/postsUpdate.spec.ts

# Run tests with specific tag
npx playwright test --grep "@smoke"
npx playwright test --grep "@regression"

# Run tests in parallel (default is 5 workers)
npx playwright test --workers=3

# Run tests with trace collection
npx playwright test --trace=on
```

### Debugging Tests

```bash
# Run tests in debug mode
npx playwright test --debug

# Run specific test in debug mode
npx playwright test tests/postsCreate.spec.ts:10 --debug

# Generate and view test reports
npm run report
```

## 🏗️ Project Architecture

### Directory Structure
```
📋 package.json              - Dependencies & scripts
⚙️ playwright.config.ts      - Playwright configuration
📖 README.md                 - Project documentation

� .github/workflows/        - CI/CD pipeline configurations
⚙️ config/                   - Configuration management  
🌍 constants/                - Environment constants
🛠️ helper/                   - Test framework helpers
📡 requests/                  - API request layer (URL builders)
✅ schemes/                   - Response validation schemas
⚙️ services/                  - Business logic layer
📊 testData/                  - Static test data
🧪 tests/                     - Test specifications
🏷️ types/                     - TypeScript type definitions
🔧 utils/                     - Utility functions
```

### Test Architecture Layers

#### 1. **Request Layer** (`requests/`)
Handles URL construction and endpoint management:
- `postsCreateRequests.ts` - POST endpoint builders
- `postsReadRequests.ts` - GET endpoint builders  
- `postsUpdateRequests.ts` - PUT/PATCH endpoint builders
- `postsDeleteRequests.ts` - DELETE endpoint builders

#### 2. **Service Layer** (`services/`)
Contains business logic and API interaction methods:
- `postsCreateService.ts` - Create operations with validation
- `postsReadService.ts` - Read operations with data extraction
- `postsUpdateService.ts` - Update operations (PUT/PATCH)
- `postsDeleteService.ts` - Delete operations

#### 3. **Utility Layer** (`utils/`)
Shared functionality across tests:
- `common.ts` - HTTP request methods (GET, POST, PUT, PATCH, DELETE)
- `apiDataExtractor.ts` - Real API data extraction and caching
- `logger.ts` - Winston-based logging for test execution

#### 4. **Test Layer** (`tests/`)
Actual test specifications organized by functionality:
- **Positive Tests**: Core CRUD functionality
- **Negative Tests**: Error scenarios and edge cases
- **Integration Tests**: Full E2E workflows

## 🧪 Test Suites Overview

### Positive Test Files
- `postsCreate.spec.ts` - POST operations with dynamic data (5 tests)
- `postsRead.spec.ts` - GET operations and data retrieval (6 tests)  
- `postsUpdate.spec.ts` - PUT/PATCH operations testing (4 tests)
- `postsDelete.spec.ts` - DELETE operations (2 tests)
- `posts-full-e2eFlow.spec.ts` - Complete API flow testing (8 tests)

### Negative Test Files
- `postsCreateNegative.spec.ts` - POST error scenarios (5 tests)
- `postsReadNegative.spec.ts` - GET error scenarios (4 tests)
- `postsUpdateNegative.spec.ts` - PUT/PATCH error scenarios (6 tests) 
- `postsDeleteNegative.spec.ts` - DELETE error scenarios (4 tests)

### Test Categories & Tags
- **@smoke**: Critical functionality tests (fast execution)
- **@regression**: Core feature tests (comprehensive coverage)
- **@negative**: Error scenario and edge case testing
- **@integration**: End-to-end workflow testing

## 🎯 Test Data Strategy

The project employs a sophisticated test data approach:

### 1. **Dynamic Data Generation (Faker.js)**
```typescript
// Example: Dynamic post creation data
const postData = {
    title: faker.lorem.sentence(),
    body: faker.lorem.paragraphs(2),
    userId: extractedUserId
};
```

### 2. **Real API Data Extraction**
```typescript
// Extract real data before tests
test.beforeAll(async () => {
    await apiDataExtractor.extractPostsData();
    const randomPost = apiDataExtractor.getRandomPostData();
    extractedPostId = randomPost.postId;
    extractedUserId = randomPost.userId;
});
```

### 3. **Data Strategy Benefits**
- **Realistic Testing**: Uses actual API data structure
- **Variability**: Different data on each test run
- **Reliability**: Known valid IDs and relationships
- **Maintainability**: Centralized data management

## 🔄 Continuous Integration

### GitHub Actions Workflow (`.github/workflows/api-tests.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` 
- Daily schedule at 6:00 AM UTC
- Manual workflow dispatch

**Matrix Strategy:**
- Comprehensive API testing with multiple validation scenarios
- Parallel execution with proper resource management
- Automatic retries on flaky test failures

**Artifacts & Reporting:**
- HTML test reports (downloadable)
- Failure traces for debugging
- Test execution summaries
- API response validation reports

### Manual CI Execution
1. Navigate to **Actions** tab in GitHub repository
2. Select **API Tests** workflow
3. Click **Run workflow** button
4. Choose branch and trigger execution

## 📊 Test Reporting & Analysis

### Generated Reports
```bash
# Generate HTML reports
npm run report

# View reports in browser
npx playwright show-report
```

### Report Features
- **Test Execution Summary**: Pass/fail statistics
- **Failure Analysis**: Detailed error information  
- **Performance Metrics**: Test execution times
- **API Response Analysis**: Detailed request/response validation
- **Trace Files**: Step-by-step test execution recordings

## ⚠️ Negative Testing Strategy

### Understanding Negative Test Failures

**Important**: Negative tests in this project are designed to FAIL when testing against JSONPlaceholder API. These failures are **expected and valuable** as they highlight the differences between mock APIs and real-world API behavior.

### Current Negative Test Results
- **Total Tests**: 18 negative tests
- **Expected Failures**: 12 tests (identifying API validation discrepancies)
- **Proper Failures**: 6 tests (correctly returning error codes)

### Failed Test Categories (Expected Behavior)

#### CREATE Operation Failures (4 tests)
```bash
# These scenarios return 201 (success) instead of expected error codes:
- Missing required fields → Should return 400/422, gets 201
- Invalid userId → Should return 400/404/422, gets 201  
- Null values → Should return 400/422, gets 201
- Empty strings → Should return 400/422, gets 201
```

#### UPDATE Operation Failures (5 tests)
```bash
# Service layer constraints and API lenient behavior:
- Non-existent ID PUT/PATCH → Service expects 200, API returns 500
- Zero ID PUT → Service expects 200, API returns 500
- Invalid userId PATCH → Should return 400/422, gets 200
- Missing fields PUT → Should return 400/422, gets 200
```

#### DELETE Operation Failures (3 tests)
```bash
# JSONPlaceholder idempotent delete behavior:
- Non-existent ID → Should return 404, gets 200 (idempotent)
- Zero ID → Should return 400, gets 200 (lenient)
- Negative ID → Should return 400, gets 200 (lenient)
```

### Value of These Failures

1. **API Behavior Documentation**: Demonstrates JSONPlaceholder's lenient validation
2. **Service Layer Constraints**: Identifies hardcoded status expectations
3. **Real-World Readiness**: Prepares tests for stricter production APIs
4. **Quality Insights**: Reveals areas where real APIs might behave differently

### Running Negative Tests

```bash
# Run all negative tests (expect 12 failures)
npx playwright test --grep "@negative"

# View specific negative test category
npx playwright test tests/postsCreateNegative.spec.ts
npx playwright test tests/postsReadNegative.spec.ts
npx playwright test tests/postsUpdateNegative.spec.ts
npx playwright test tests/postsDeleteNegative.spec.ts
```

### Reporting Failed Tests

When reporting test results, include:
- **Expected Failures**: Document the 12 failing negative tests as "Expected API Behavior Discrepancies"
- **Actual Issues**: Only report unexpected failures or changes in failure patterns
- **Recommendations**: Suggest API validation improvements based on failed scenarios

## 🚨 Challenges Encountered & Solutions

### 1. **Service Layer Rigidity**
**Challenge**: Original service methods had hardcoded status code expectations (always expecting 200), making negative testing difficult.

**Solution**: 
- Created separate negative test files
- Used flexible assertions in negative tests
- Documented expected behaviors for different scenarios

### 2. **Dynamic vs Static Test Data Balance**
**Challenge**: Balancing between realistic dynamic data (Faker.js) and predictable test data for validation.

**Solution**:
- Implemented `apiDataExtractor` for real API data
- Combined Faker.js for variable content with extracted IDs for relationships
- Used `beforeAll()` hooks to establish test data context

### 3. **Cross-Platform Test Consistency**
**Challenge**: Ensuring consistent API behavior across different environments.

**Solution**:
- Implemented robust wait strategies
- Used Playwright's built-in retry mechanisms
- Standardized error handling across all test scenarios

### 4. **Negative Test Realism**
**Challenge**: Creating meaningful negative tests that reflect real-world error scenarios.

**Solution**:
- Focused on practical error cases (invalid IDs, missing data, wrong endpoints)
- Removed artificial scenarios (non-existent domains, malformed JSON)
- Documented actual API behavior vs expected behavior

### 5. **CI/CD Optimization**
**Challenge**: Long CI execution times with comprehensive test coverage.

**Solution**:
- Optimized to single workflow file
- Implemented efficient test execution strategy
- Added selective test execution based on changes
- Used artifact caching for dependencies

## � Configuration Details

### Playwright Configuration (`playwright.config.ts`)
```typescript
// Key configurations
testDir: './tests',
timeout: 30000,
retries: 2,
workers: 5,
reporter: [['html'], ['json'], ['line']],
use: {
  baseURL: 'https://jsonplaceholder.typicode.com',
  extraHTTPHeaders: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
}
```

### Package.json Scripts
```json
{
  "test": "npx playwright test",
  "test:debug": "npx playwright test --debug",
  "compile": "npx tsc",
  "clean": "rm -rf test-results/ playwright-report/",
  "report": "npx playwright show-report"
}
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/new-test`
3. **Follow** the existing code patterns and architecture
4. **Add** comprehensive test coverage
5. **Update** documentation as needed
6. **Submit** a pull request with detailed description

### Code Standards
- Use TypeScript for type safety
- Follow existing naming conventions
- Add proper logging and error handling
- Include both positive and negative test cases
- Update README for significant changes

## 🆘 Troubleshooting

### Common Issues

**Issue**: Playwright installation fails
```bash
# Solution: Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npx playwright install
```

**Issue**: Tests fail with timeout errors
```bash
# Solution: Increase timeout in playwright.config.ts
timeout: 60000, // Increase to 60 seconds
```

**Issue**: Playwright installation fails with dependencies
```bash
# Solution: Install with system dependencies
npx playwright install --with-deps
```

**Issue**: TypeScript compilation errors
```bash
# Solution: Clean and recompile
npm run clean
npm run compile
```

## 📞 Support

For issues, questions, or contributions:
- **GitHub Issues**: [Create an issue](https://github.com/ANTWII/wynn-api-automation/issues)
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check this README and inline code comments

---

**Last Updated**: August 16, 2025  
**Version**: 1.0.0  
**Maintainer**: ANTWII
