#!/bin/bash

# GitHub Actions API Test Workflow Validation Script
# This script validates the syntax of GitHub Actions workflows for API testing

echo "🔍 Validating GitHub Actions API test workflows..."
echo ""

WORKFLOW_DIR=".github/workflows"
VALIDATION_ERRORS=0

# Check if workflows directory exists
if [ ! -d "$WORKFLOW_DIR" ]; then
    echo "❌ No .github/workflows directory found!"
    exit 1
fi

# Validate each workflow file
for workflow in "$WORKFLOW_DIR"/*.yml; do
    if [ -f "$workflow" ]; then
        filename=$(basename "$workflow")
        echo "📄 Validating: $filename"
        
        # Basic YAML syntax validation
        if command -v yamllint >/dev/null 2>&1; then
            if yamllint "$workflow" >/dev/null 2>&1; then
                echo "  ✅ YAML syntax: OK"
            else
                echo "  ❌ YAML syntax: FAILED"
                VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
            fi
        else
            echo "  ⚠️  yamllint not installed, skipping YAML validation"
        fi
        
        # Check for required GitHub Actions fields
        if grep -q "^name:" "$workflow" && \
           grep -q "^on:" "$workflow" && \
           grep -q "^jobs:" "$workflow"; then
            echo "  ✅ Required fields: OK"
        else
            echo "  ❌ Required fields: MISSING (name, on, or jobs)"
            VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
        fi
        
        # Check for Node.js setup consistency
        if grep -q "actions/setup-node@v4" "$workflow"; then
            if grep -q "node-version: '20'" "$workflow"; then
                echo "  ✅ Node.js version: OK (v20)"
            else
                echo "  ⚠️  Node.js version: Inconsistent or missing"
            fi
        fi
        
        # Check for Playwright installation (API testing requirement)
        if grep -q "npx playwright" "$workflow"; then
            if grep -q "npx playwright install" "$workflow"; then
                echo "  ✅ Playwright setup: OK"
            else
                echo "  ⚠️  Playwright install step missing"
            fi
        fi
        
        # Check for API-specific test patterns
        if grep -q "tests/" "$workflow" || grep -q "posts.*\.spec\.ts" "$workflow"; then
            echo "  ✅ API test patterns: Found"
        else
            echo "  ⚠️  No API test patterns detected"
        fi
        
        echo ""
    fi
done

# Summary
echo "📊 API Workflow Validation Summary:"
echo "   API test workflows found: $(ls -1 "$WORKFLOW_DIR"/*.yml 2>/dev/null | wc -l)"
echo "   Validation errors: $VALIDATION_ERRORS"

if [ $VALIDATION_ERRORS -eq 0 ]; then
    echo ""
    echo "🎉 All API test workflows are valid!"
    echo ""
    echo "📋 Available API workflows:"
    for workflow in "$WORKFLOW_DIR"/*.yml; do
        if [ -f "$workflow" ]; then
            filename=$(basename "$workflow" .yml)
            workflow_name=$(grep "^name:" "$workflow" | cut -d' ' -f2- | tr -d '"' | tr -d "'")
            echo "   • $filename: $workflow_name"
        fi
    done
    echo ""
    echo "🚀 To trigger API test workflows manually:"
    echo "   1. Go to your GitHub repository"
    echo "   2. Click on 'Actions' tab" 
    echo "   3. Select a workflow with 'workflow_dispatch'"
    echo "   4. Click 'Run workflow'"
    echo "   5. Choose API test options (test type, browser, environment)"
    exit 0
else
    echo ""
    echo "❌ Found $VALIDATION_ERRORS validation errors in API workflows!"
    echo "   Please fix the issues before committing."
    exit 1
fi
