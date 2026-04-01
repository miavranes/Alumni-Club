import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import jwt from 'jsonwebtoken';




const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log('Connected to the database');

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1);
    }
};


// Add this temporary debug route
app.get('/api/debug-jwt-setup', (req, res) => {
  const secret = process.env.JWT_SECRET;
  
  // Test creating a token with current secret
  const testToken = jwt.sign(
    { test: 'debug', userId: 1 }, 
    secret!
  );
  
  // Try to verify it
  try {
    const verified = jwt.verify(testToken, secret!);
    res.json({
      status: 'JWT is working',
      jwtSecret: secret ? 'Set' : 'Not set',
      secretPreview: secret ? `${secret.substring(0, 10)}...` : 'None',
      secretLength: secret?.length,
      testToken: testToken,
      verification: 'Success'
    });
  } catch (error) {
    // Fix the TypeScript error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.json({
      status: 'JWT is BROKEN',
      jwtSecret: secret ? 'Set' : 'Not set', 
      secretPreview: secret ? `${secret.substring(0, 10)}...` : 'None',
      secretLength: secret?.length,
      error: errorMessage
    });
  }

});

startServer();