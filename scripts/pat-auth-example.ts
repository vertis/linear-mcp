/**
 * Example script demonstrating how to use Personal Access Token authentication with Linear API
 * 
 * To run: 
 * npm run build
 * node --loader ts-node/esm scripts/pat-auth-example.ts
 * 
 * You need to provide your PAT as an environment variable:
 * LINEAR_PAT=your_personal_access_token node --loader ts-node/esm scripts/pat-auth-example.ts
 */

import { PatLinearAuth, PersonalAccessTokenConfig } from '../src/auth.js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
  try {
    const patToken = process.env.LINEAR_PAT;
    
    if (!patToken) {
      console.error('Error: LINEAR_PAT environment variable is required');
      console.error('Create a Linear Personal Access Token at https://linear.app/settings/api');
      console.error('Then set LINEAR_PAT=your_token before running this script');
      process.exit(1);
    }
    
    // Create PAT config
    const patConfig: PersonalAccessTokenConfig = {
      type: 'pat',
      accessToken: patToken
    };
    
    // Initialize PatLinearAuth
    const linearAuth = new PatLinearAuth();
    linearAuth.initialize(patConfig);
    
    console.log('Authentication successful');
    
    // Get the Linear client
    const linearClient = linearAuth.getClient();
    
    // Fetch current user to test the connection
    const me = await linearClient.viewer;
    console.log(`Authenticated as: ${me.name} (${me.email})`);
    
    // Fetch a list of teams
    const teams = await linearClient.teams();
    console.log('\nTeams:');
    teams.nodes.forEach(team => {
      console.log(`- ${team.name} (${team.id})`);
    });
    
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();