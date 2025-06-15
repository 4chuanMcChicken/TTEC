# VanityConnect - Phone Number Vanity Generator

A serverless application that converts phone numbers into memorable vanity numbers using a heuristic scoring algorithm. Built with AWS Lambda and DynamoDB.

## Overview

VanityConnect takes a phone number and generates meaningful vanity numbers by mapping digits to letters using the standard phone keypad mapping (e.g., 2=ABC, 3=DEF, etc.). The system uses a sophisticated scoring algorithm to rank the generated combinations and returns the top 5 most memorable options.

## Algorithm Details

### Phone Number to Vanity Conversion

1. **Keypad Mapping**:
   ```
   2: ABC    3: DEF    4: GHI    5: JKL
   6: MNO    7: PQRS   8: TUV    9: WXYZ
   ```

2. **Combination Generation**:
   - Takes the last 7 digits of the phone number
   - Generates all possible letter combinations using the keypad mapping
   - Each digit can be mapped to any of its corresponding letters

### Scoring Algorithm

The scoring system uses two main criteria to rank vanity number candidates:

1. **Dictionary Word Recognition** (Primary Score):
   - Uses a predefined dictionary (`assets/words.txt`)
   - Scans for valid English words within the combination
   - Longer words receive higher scores (length × 10 points)
   - Multiple words in a single combination are cumulative

2. **Pattern Recognition** (Bonus Score):
   - Awards bonus points (5 points) for patterns like:
     - Three or more consecutive identical characters
     - This helps identify memorable sequences

Example scoring:
- "CALLNOW" = 70 points (7-letter word)
- "HOME123" = 40 points (4-letter word)
- "AAA1234" = 35 points (30 for "AAA" + 5 bonus for repetition)

## Architecture

### AWS Services Used

1. **AWS Lambda**:
   - Runtime: Node.js 18.x
   - Memory: 256MB
   - Timeout: 10 seconds
   - Handles the vanity number generation and scoring logic

2. **Amazon DynamoDB**:
   - Table: VanityNumbers
   - Partition Key: callerNumber (String)
   - Sort Key: createdAt (String)
   - Stores generated vanity numbers for each caller
   - Uses on-demand (pay-per-request) billing

### Project Structure

```
├── src/
│   ├── handler.ts        # Main Lambda handler
│   ├── mapper.ts         # Phone keypad mapping logic
│   ├── scorer.ts         # Scoring algorithm implementation
│   └── types.ts          # TypeScript type definitions
├── assets/
│   └── words.txt         # Dictionary for word recognition
└── template.yaml         # AWS SAM template
```

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

## Security

- IAM roles with least privilege principle
- DynamoDB access limited to required operations
- Input validation and sanitization
- Error handling and logging

## Cost Considerations

1. **Lambda Costs**:
   - Pay only for execution time
   - 256MB memory allocation optimized for cost/performance

2. **DynamoDB Costs**:
   - On-demand pricing
   - No minimum capacity requirements
   - Pay per actual request

## Future Enhancements

1. **Performance Optimizations**:
   - Cache common word patterns
   - Optimize dictionary lookup

2. **Feature Additions**:
   - Custom dictionary support
   - Industry-specific word lists
   - Blacklist for inappropriate words

3. **Integration Options**:
   - Amazon Connect integration
   - API Gateway for REST endpoints
   - SMS notification support 