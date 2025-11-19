import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

async function checkColumns() {
  try {
    const authRes = await axios.post(
      `${process.env.ROBLE_AUTH_URL}/${process.env.DB_NAME}/login`,
      {
        email: process.env.ROBLE_EMAIL,
        password: process.env.ROBLE_PASSWORD
      }
    );
    
    const tableRes = await axios.get(
      `${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/table-data?table=productos`,
      { headers: { Authorization: `Bearer ${authRes.data.accessToken}` } }
    );

    console.log('📋 Columnas de la tabla productos:');
    tableRes.data.columns.forEach(col => {
      console.log(`   ${col.name} (${col.type})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkColumns();