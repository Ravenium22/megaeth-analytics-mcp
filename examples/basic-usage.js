const axios = require('axios');

// Example: Get network statistics
async function getNetworkStats() {
  try {
    const response = await axios.get('http://localhost:3000/api/stats');
    console.log('Network Stats:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example: Get active contracts
async function getActiveContracts() {
  try {
    const response = await axios.get('http://localhost:3000/api/contracts?limit=5');
    console.log('Active Contracts:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run examples
getNetworkStats();
getActiveContracts();