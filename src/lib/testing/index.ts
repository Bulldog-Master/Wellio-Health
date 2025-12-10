// Testing utilities barrel export
// Re-export from testRunner (primary testing utilities)
export { 
  runTest, 
  runTestSuite, 
  formatTestResults,
  type TestResult, 
  type TestSuite 
} from '../testRunner';

// Re-export health check from testingUtils (uses same types)
export { runHealthCheck } from '../testingUtils';
