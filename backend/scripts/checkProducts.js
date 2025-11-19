// backend/scripts/checkProducts.js
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

async function checkProducts() {
  try {
    console.log('🔍 Verificando productos existentes...');
    
    // Autenticar
    const authRes = await axios.post(
      `${process.env.ROBLE_AUTH_URL}/${process.env.DB_NAME}/login`,
      {
        email: process.env.ROBLE_EMAIL,
        password: process.env.ROBLE_PASSWORD
      }
    );
    
    const token = authRes.data.accessToken;

    // Obtener todos los productos
    const productsRes = await axios.get(
      `${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/read`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "productos" }
      }
    );

    console.log('📊 Productos en la tabla:');
    
    if (productsRes.data && productsRes.data.length > 0) {
      console.log('\n✅ Productos disponibles:');
      productsRes.data.forEach(producto => {
        console.log(`   📦 ${producto.nombre} - ID: ${producto._id} - Oferente: ${producto.oferenteID}`);
      });
      
      console.log('\n🎯 Para probar el trueque, usa estos IDs:');
      if (productsRes.data.length >= 2) {
        console.log(`   id_productDestinatario: "${productsRes.data[0]._id}"`);
        console.log(`   id_porductOferente: "${productsRes.data[1]._id}"`);
      }
    } else {
      console.log('❌ No hay productos en la tabla');
      
      // Crear productos de prueba
      console.log('🛠️ Creando productos de prueba...');
      const createRes = await axios.post(
        `${process.env.ROBLE_DB_URL}/${process.env.DB_NAME}/insert`,
        {
          tableName: 'productos',
          records: [
            {
              nombre: 'Bicicleta Mountain Bike',
              categoria: 'deportes',
              imagenes: [],
              condiciones_trueque: 'Intercambio por patineta eléctrica',
              comentario_nlp: 'Bicicleta profesional casi nueva',
              ubicacion: 'Barranquilla',
              estado: 'publicada',
              oferenteID: 'h8KjfVMw1aQb', // Tu ID de usuario
              fecha_creacion: new Date().toISOString(),
              fecha_actualizacion: new Date().toISOString()
            },
            {
              nombre: 'Libros de Programación',
              categoria: 'libros', 
              imagenes: [],
              condiciones_trueque: 'Intercambio por equipo electrónico',
              comentario_nlp: 'Libros de JavaScript y Python en buen estado',
              ubicacion: 'Barranquilla',
              estado: 'publicada',
              oferenteID: 'h8KjfVMw1aQb',
              fecha_creacion: new Date().toISOString(),
              fecha_actualizacion: new Date().toISOString()
            }
          ]
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('✅ Productos de prueba creados');
      console.log('IDs:', createRes.data.insertedIds);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkProducts();