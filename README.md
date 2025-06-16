# VanityConnect - Phone Number Vanity Generator

A serverless application that converts phone numbers into memorable vanity numbers using a sophisticated combination of algorithms. Built with AWS Lambda and DynamoDB.

## Overview

VanityConnect takes a phone number and generates meaningful vanity numbers by mapping digits to letters using the standard phone keypad mapping (e.g., 2=ABC, 3=DEF, etc.). The system employs multiple algorithmic approaches to generate and rank the combinations, ensuring both efficiency and quality of results.

## Algorithm Details

### 1. Phone Number to Vanity Conversion

#### Keypad Mapping
```
2: ABC    3: DEF    4: GHI    5: JKL
6: MNO    7: PQRS   8: TUV    9: WXYZ
```

#### Generation Algorithm
The system uses a Cartesian Product algorithm to generate all possible combinations:
- Takes the last 7 digits of the phone number
- For each digit, maps to possible letters using the keypad mapping
- Uses dynamic array expansion to build combinations
- Time Complexity: O(4^n) where n is number of digits
- Space Complexity: O(4^n) to store all combinations

Example:
```
Input: "234"
Step 1: [A,B,C]
Step 2: [AD,AE,AF,BD,BE,BF,CD,CE,CF]
Step 3: [ADG,ADH,ADI,AEG,AEH,AEI,...,CFI]
```

### 2. Scoring System

The scoring algorithm uses a combination of techniques:

#### A. Dictionary Word Recognition
- Uses dynamic programming for substring matching
- Maintains a Set data structure for O(1) word lookups
- Scores based on word length: length × 10 points
- Multiple word detection in single combination
- Time Complexity: O(n²) per combination where n is word length

#### B. Pattern Analysis
- Regular expression based pattern matching
- Detects repeating character sequences
- Awards bonus points (5 points) for patterns:
  - Three or more consecutive identical characters
  - Time Complexity: O(n) for pattern matching

#### C. Combined Scoring Example
```
"CALLNOW":
- "CALL" (4 letters) = 40 points
- "NOW" (3 letters) = 30 points
Total = 70 points

"AAA1234":
- "AAA" = 30 points
- Pattern bonus = 5 points
Total = 35 points
```

### 3. Overall Algorithm Complexity
- Generation Phase: O(4^n) where n ≤ 7
- Scoring Phase: O(m²) per combination where m is combination length
- Total Time Complexity: O(4^n * m²)
- Space Complexity: O(4^n) for storing combinations

## Architecture

### AWS Services Used

1. **AWS Lambda**:
   - Runtime: Node.js 18.x
   - Memory: 256MB
   - Timeout: 10 seconds
   - Handles the vanity number generation and scoring logic
   - Optimized for the algorithm's memory and CPU requirements

2. **Amazon DynamoDB**:
   - Table: VanityNumbers
   - Partition Key: callerNumber (String)
   - Sort Key: createdAt (String)
   - Stores generated vanity numbers for each caller
   - Uses on-demand (pay-per-request) billing
   - Optimized for quick lookups and writes

### Project Structure

```
├── src/
│   ├── handler.ts        # Main Lambda handler
│   ├── mapper.ts         # Cartesian product implementation
│   ├── scorer.ts         # Scoring algorithm implementation
│   └── types.ts          # TypeScript type definitions
├── assets/
│   └── words.txt         # Dictionary for word recognition
└── template.yaml         # AWS SAM template
```

## Performance Optimizations

1. **Dictionary Lookup**:
   - Uses Set data structure for O(1) lookups
   - Case-insensitive matching to reduce dictionary size
   - Preloaded during Lambda cold start

2. **Combination Generation**:
   - Optimized array operations
   - Early filtering of invalid combinations
   - Memory-efficient string concatenation

3. **Scoring Algorithm**:
   - Dynamic programming for word finding
   - Efficient regex pattern matching
   - Early termination for low-scoring candidates

## Deployment

### Prerequisites

1. AWS CLI installed and configured
2. AWS SAM CLI installed
3. Node.js 18.x
4. TypeScript

### Deployment Steps

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Deploy using SAM:
   ```bash
   sam deploy --guided
   ```

### Configuration

The application uses the following environment variables:
- `TABLE_NAME`: DynamoDB table name (default: VanityNumbers)

## API Usage

### Input Format

```json
{
  "phoneNumber": "1234567890"
}
```

### Output Format

```json
{
  "vanity1": "BESTVAN",
  "vanity2": "CALLNOW",
  "vanity3": "HELPYOU"
}
```

## Performance and Limitations

- Processes the last 7 digits of phone numbers
- Dictionary-based scoring ensures meaningful results
- DynamoDB on-demand capacity for cost optimization
- Lambda timeout set to 10 seconds for complex combinations
- Maximum of 16384 combinations per number (4^7)

## Security

- IAM roles with least privilege principle
- DynamoDB access limited to required operations
- Input validation and sanitization
- Error handling and logging

## Cost Considerations

1. **Lambda Costs**:
   - Pay only for execution time
   - 256MB memory allocation optimized for cost/performance
   - Average execution time: 1-2 seconds

2. **DynamoDB Costs**:
   - On-demand pricing
   - No minimum capacity requirements
   - Pay per actual request
   - Minimal storage costs due to small record size

## Future Enhancements

1. **Algorithm Optimizations**:
   - Implement trie data structure for faster word lookup
   - Add memoization for common substrings
   - Parallel processing for large combination sets

2. **Feature Additions**:
   - Custom dictionary support
   - Industry-specific word lists
   - Blacklist for inappropriate words
   - Contextual scoring based on business type

3. **Integration Options**:
   - Amazon Connect integration
   - API Gateway for REST endpoints
   - SMS notification support

## Testing

### Test Framework and Tools

The project uses Jest with TypeScript support for comprehensive testing:
- Jest: Primary testing framework
- ts-jest: TypeScript support
- @types/jest: TypeScript type definitions

### Test Structure

```
test/
├── unit/
│   ├── mapper.test.ts    # Tests for phone number mapping
│   ├── scorer.test.ts    # Tests for scoring algorithm
│   └── handler.test.ts   # Tests for Lambda handler
└── integration/
    └── vanity.test.ts    # End-to-end integration tests
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- mapper.test.ts
```

