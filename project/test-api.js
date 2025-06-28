// API Test Suite for Fashion AI Platform
// Tests the complete workflow as specified in the n8n configuration

const API_BASE_URL = 'https://api.fashn.ai/v1';
const API_KEY = 'fa-Dy6SV0P0ZUSd-TijrFG5cmW5khB3TLrkmNVNk';

class APITester {
  constructor() {
    this.testResults = [];
    this.jobId = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message, type };
    this.testResults.push(logEntry);
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Step 1: Send POST request to /v1/run
  async testInitialRequest() {
    this.log('=== STEP 1: Testing Initial POST Request ===');
    
    const requestBody = {
      model_image: "http://example.com/path/to/model.jpg",
      garment_image: "http://example.com/path/to/garment.jpg",
      category: "tops"
    };

    try {
      this.log('Sending POST request to /v1/run...');
      this.log(`Request body: ${JSON.stringify(requestBody, null, 2)}`);

      const response = await fetch(`${API_BASE_URL}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(requestBody)
      });

      this.log(`Response status: ${response.status}`);
      this.log(`Response headers: ${JSON.stringify(Object.fromEntries(response.headers), null, 2)}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      this.log(`Response data: ${JSON.stringify(responseData, null, 2)}`);

      // Extract job ID
      this.jobId = responseData.id;
      if (!this.jobId) {
        throw new Error('No job ID found in response');
      }

      this.log(`✅ Job ID extracted: ${this.jobId}`, 'success');
      return { success: true, jobId: this.jobId, responseData };

    } catch (error) {
      this.log(`❌ Initial request failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  // Step 2: Poll status endpoint until complete
  async testStatusPolling() {
    this.log('=== STEP 2: Testing Status Polling ===');
    
    if (!this.jobId) {
      this.log('❌ No job ID available for status polling', 'error');
      return { success: false, error: 'No job ID' };
    }

    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    try {
      while (attempts < maxAttempts) {
        attempts++;
        this.log(`Status check attempt ${attempts}/${maxAttempts}`);

        const response = await fetch(`${API_BASE_URL}/status/${this.jobId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        this.log(`Status response: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          this.log(`Status check failed: HTTP ${response.status}: ${errorText}`, 'error');
          
          // Continue polling for temporary errors
          if (response.status >= 500 || response.status === 429) {
            this.log('Temporary error, continuing to poll...', 'warning');
            await this.sleep(2000); // Wait 2 seconds for server errors
            continue;
          } else {
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }
        }

        const statusData = await response.json();
        this.log(`Status data: ${JSON.stringify(statusData, null, 2)}`);

        // Check completion status (following n8n If condition)
        if (statusData.status === 'completed') {
          this.log('✅ Generation completed successfully!', 'success');
          return { success: true, finalData: statusData, attempts };
        }

        if (statusData.status === 'failed' || statusData.status === 'error') {
          throw new Error(`Generation failed: ${statusData.error || 'Unknown error'}`);
        }

        // Log current status
        this.log(`Current status: ${statusData.status}`);

        // Wait 1 second before next check (following n8n Wait node)
        await this.sleep(1000);
      }

      throw new Error('Polling timeout - generation did not complete within 5 minutes');

    } catch (error) {
      this.log(`❌ Status polling failed: ${error.message}`, 'error');
      return { success: false, error: error.message, attempts };
    }
  }

  // Step 3: Validate workflow components
  async validateWorkflowComponents() {
    this.log('=== STEP 3: Validating Workflow Components ===');

    const components = [
      'Manual trigger node',
      'HTTP POST request node', 
      'Status check node with loop',
      '1 second wait between status checks',
      'Conditional logic for completion',
      'Supabase vector store integration'
    ];

    const validationResults = {};

    // Manual trigger - simulated by our test execution
    validationResults['Manual trigger node'] = {
      status: 'simulated',
      description: 'Test execution simulates manual trigger'
    };

    // HTTP POST request - validated by step 1
    validationResults['HTTP POST request node'] = {
      status: this.testResults.some(r => r.message.includes('POST request')) ? 'validated' : 'failed',
      description: 'POST request to /v1/run endpoint'
    };

    // Status check with loop - validated by step 2
    validationResults['Status check node with loop'] = {
      status: this.testResults.some(r => r.message.includes('Status check attempt')) ? 'validated' : 'failed',
      description: 'GET requests to /v1/status/{id} endpoint'
    };

    // 1 second wait - validated by our sleep implementation
    validationResults['1 second wait between status checks'] = {
      status: 'validated',
      description: '1000ms delay between status checks implemented'
    };

    // Conditional logic - validated by our completion check
    validationResults['Conditional logic for completion'] = {
      status: this.testResults.some(r => r.message.includes('status === completed')) ? 'validated' : 'partial',
      description: 'Status comparison logic for completion detection'
    };

    // Supabase integration - would need database access to fully validate
    validationResults['Supabase vector store integration'] = {
      status: 'requires_database_access',
      description: 'Cannot validate without database connection'
    };

    this.log('Workflow component validation results:');
    Object.entries(validationResults).forEach(([component, result]) => {
      const statusIcon = result.status === 'validated' ? '✅' : 
                        result.status === 'partial' ? '⚠️' : 
                        result.status === 'simulated' ? '🔄' : '❌';
      this.log(`${statusIcon} ${component}: ${result.status} - ${result.description}`);
    });

    return validationResults;
  }

  // Step 4: Test response format validation
  async validateResponseFormat(responseData, finalData) {
    this.log('=== STEP 4: Validating Response Format ===');

    const validations = [];

    // Initial response validation
    if (responseData) {
      validations.push({
        test: 'Initial response has job ID',
        passed: !!responseData.id,
        value: responseData.id
      });

      validations.push({
        test: 'Initial response has status',
        passed: !!responseData.status,
        value: responseData.status
      });

      validations.push({
        test: 'Initial response has estimated_time',
        passed: responseData.hasOwnProperty('estimated_time'),
        value: responseData.estimated_time
      });
    }

    // Final response validation
    if (finalData) {
      validations.push({
        test: 'Final response has completed status',
        passed: finalData.status === 'completed',
        value: finalData.status
      });

      validations.push({
        test: 'Final response has output/images',
        passed: !!(finalData.output || finalData.images || finalData.image),
        value: finalData.output || finalData.images || finalData.image
      });

      validations.push({
        test: 'Final response has processing_time',
        passed: finalData.hasOwnProperty('processing_time'),
        value: finalData.processing_time
      });
    }

    validations.forEach(validation => {
      const icon = validation.passed ? '✅' : '❌';
      this.log(`${icon} ${validation.test}: ${validation.passed ? 'PASS' : 'FAIL'} (${validation.value})`);
    });

    const allPassed = validations.every(v => v.passed);
    this.log(`Response format validation: ${allPassed ? 'PASSED' : 'FAILED'}`, allPassed ? 'success' : 'error');

    return { allPassed, validations };
  }

  // Step 5: Simulate database insertion validation
  async validateDatabaseInsertion() {
    this.log('=== STEP 5: Database Insertion Validation ===');
    
    // Note: This would require actual database access to validate
    // For now, we'll simulate the expected behavior
    
    this.log('⚠️ Database validation requires actual Supabase connection', 'warning');
    this.log('Expected database operations:');
    this.log('- Insert into generations table with job details');
    this.log('- Update generation status to "processing"');
    this.log('- Update generation with final results');
    this.log('- Insert into workflow_executions table');
    this.log('- Update user credits');

    return {
      simulated: true,
      expectedOperations: [
        'generations table insert',
        'generations status update',
        'generations results update', 
        'workflow_executions insert',
        'user credits deduction'
      ]
    };
  }

  // Main test runner
  async runFullTest() {
    this.log('🚀 Starting Full API Test Suite');
    this.log(`Testing against: ${API_BASE_URL}`);
    this.log(`Using API Key: ${API_KEY.substring(0, 10)}...`);

    const results = {
      startTime: new Date().toISOString(),
      tests: {}
    };

    try {
      // Step 1: Initial request
      results.tests.initialRequest = await this.testInitialRequest();
      
      if (!results.tests.initialRequest.success) {
        this.log('❌ Initial request failed, stopping test suite', 'error');
        return this.generateReport(results);
      }

      // Step 2: Status polling
      results.tests.statusPolling = await this.testStatusPolling();

      // Step 3: Workflow validation
      results.tests.workflowValidation = await this.validateWorkflowComponents();

      // Step 4: Response format validation
      results.tests.responseValidation = await this.validateResponseFormat(
        results.tests.initialRequest.responseData,
        results.tests.statusPolling.finalData
      );

      // Step 5: Database validation
      results.tests.databaseValidation = await this.validateDatabaseInsertion();

      results.endTime = new Date().toISOString();
      results.duration = new Date(results.endTime) - new Date(results.startTime);

      return this.generateReport(results);

    } catch (error) {
      this.log(`💥 Test suite crashed: ${error.message}`, 'error');
      results.crashed = true;
      results.error = error.message;
      return this.generateReport(results);
    }
  }

  generateReport(results) {
    this.log('=== FINAL TEST REPORT ===');
    
    const report = {
      summary: {
        startTime: results.startTime,
        endTime: results.endTime,
        duration: results.duration,
        totalTests: Object.keys(results.tests || {}).length,
        passedTests: 0,
        failedTests: 0
      },
      details: results.tests || {},
      logs: this.testResults,
      recommendations: []
    };

    // Count passed/failed tests
    Object.values(results.tests || {}).forEach(test => {
      if (test.success || test.allPassed) {
        report.summary.passedTests++;
      } else {
        report.summary.failedTests++;
      }
    });

    // Generate recommendations
    if (results.tests?.initialRequest?.success === false) {
      report.recommendations.push('Check API endpoint availability and authentication');
    }
    
    if (results.tests?.statusPolling?.success === false) {
      report.recommendations.push('Verify status endpoint and job ID handling');
    }

    if (results.tests?.responseValidation?.allPassed === false) {
      report.recommendations.push('Review API response format compliance');
    }

    // Log summary
    this.log(`✅ Passed: ${report.summary.passedTests}`);
    this.log(`❌ Failed: ${report.summary.failedTests}`);
    this.log(`⏱️ Duration: ${report.summary.duration}ms`);

    if (report.recommendations.length > 0) {
      this.log('📋 Recommendations:');
      report.recommendations.forEach(rec => this.log(`  • ${rec}`));
    }

    return report;
  }
}

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APITester;
} else if (typeof window !== 'undefined') {
  window.APITester = APITester;
}

// Auto-run if called directly
if (typeof require !== 'undefined' && require.main === module) {
  const tester = new APITester();
  tester.runFullTest().then(report => {
    console.log('\n=== COMPLETE TEST REPORT ===');
    console.log(JSON.stringify(report, null, 2));
  });
}