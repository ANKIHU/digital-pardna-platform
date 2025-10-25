# PardnaLink Platform Testing Suite

## 🎯 Testing Overview

This comprehensive testing suite validates the PardnaLink platform across three access tiers:

- **Customer Access**: End-user functionality testing
- **Corporate Access**: Admin dashboard and management testing  
- **Third-Party Access**: API integration and webhook testing

## 🚀 Quick Start

### Prerequisites
- Server running on `http://52.23.203.107:3001`
- `curl` command available
- `bc` calculator for load testing

### Run All Tests
```bash
cd testing
./run-all-tests.sh
```

## 📋 Individual Test Suites

### Customer Testing
```bash
./customer-tests.sh
```
Tests:
- User registration/login
- Profile management
- Circle creation
- KYC verification
- Payment methods

### Corporate Testing
```bash
./corporate-tests.sh
```
Tests:
- Admin authentication
- Dashboard analytics
- User management
- Circle oversight
- Fraud detection
- Compliance reports

### Third-Party API Testing
```bash
./third-party-tests.sh
```
Tests:
- API key authentication
- Data access endpoints
- Payment processing
- KYC integration
- Webhook handling
- Rate limiting

### Performance Testing
```bash
./load-test.sh
```
- Concurrent user simulation
- Response time measurement
- Throughput analysis

### Security Testing
```bash
./security-tests.sh
```
- SQL injection protection
- XSS prevention
- Authentication bypass
- Rate limiting
- CORS validation
- Input validation

## 🔧 Configuration

### Environment Variables
- `API_BASE`: Server base URL (default: http://52.23.203.107:3001/v1)
- `CONCURRENT_USERS`: Load test users (default: 10)
- `REQUESTS_PER_USER`: Requests per user (default: 5)

### Test Credentials
- Customer: `customer@test.com`
- Admin: `admin@pardnalink.com`
- API Key: `third-party-test-key-123`

## 📊 Expected Results

### Success Indicators
- HTTP 200/201 responses for valid requests
- HTTP 401/403 for unauthorized access
- HTTP 429 for rate limiting
- Valid JSON responses
- Proper error handling

### Failure Indicators
- Connection timeouts
- HTTP 500 server errors
- Malformed JSON responses
- Security vulnerabilities
- Performance degradation

## 🛠️ Troubleshooting

### Server Not Responding
```bash
# Check server status
curl -I http://52.23.203.107:3001/v1/health

# Restart server if needed
ssh -i pardnalink-keypair.pem ec2-user@52.23.203.107
cd /home/ec2-user/digital-pardna-platform/backend
pm2 restart all
```

### Test Failures
1. Check server logs for errors
2. Verify database connectivity
3. Confirm route registration
4. Validate authentication tokens

## 📈 Performance Benchmarks

### Target Metrics
- Response Time: < 200ms
- Throughput: > 100 req/sec
- Concurrent Users: 50+
- Error Rate: < 1%

### Load Testing Results
Results will show:
- Total duration
- Requests per second
- Response times
- Error rates