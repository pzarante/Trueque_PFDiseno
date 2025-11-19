// scripts/testFlujoCompletoTrueque.js
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

async function testFlujoCompletoTrueque() {
  try {
    console.log('🧪 PRUEBA FLUJO COMPLETO TRUEQUE\n');
    console.log('==================================\n');

    // 1. Login
    console.log('1. 🔐 OBteniendo token de acceso...');
    const loginRes = await axios.post(`http://localhost:3000/api/auth/login`, {
      email: process.env.ROBLE_EMAIL,
      password: process.env.ROBLE_PASSWORD
    });
    
    const token = loginRes.data.token;
    console.log('   ✅ Token obtenido correctamente\n');

    // 2. Verificar trueques existentes
    console.log('2. 📋 ANALIZANDO TRUEQUES EXISTENTES...');
    const truequesRes = await axios.get(
      `http://localhost:3000/api/trueques/mis-trueques`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log(`   📊 Total de trueques: ${truequesRes.data.trueques.length}`);

    // Clasificar trueques por estado
    const truequesPendientes = truequesRes.data.trueques.filter(t => t.status === 'pendiente');
    const truequesConfirmados = truequesPendientes.filter(t => 
      t.confirmacion_oferente === 'confirmado' && 
      t.confirmacion_destinatario === 'confirmado'
    );
    const truequesParcialConfirmados = truequesPendientes.filter(t => 
      t.confirmacion_oferente === 'confirmado' || 
      t.confirmacion_destinatario === 'confirmado'
    );
    const truequesSinConfirmar = truequesPendientes.filter(t => 
      t.confirmacion_oferente === 'pendiente' && 
      t.confirmacion_destinatario === 'pendiente'
    );

    console.log('\n   📈 ESTADÍSTICAS:');
    console.log(`   ├── Listos para cierre: ${truequesConfirmados.length}`);
    console.log(`   ├── Confirmación parcial: ${truequesParcialConfirmados.length}`);
    console.log(`   ├── Sin confirmar: ${truequesSinConfirmar.length}`);
    console.log(`   └── Total pendientes: ${truequesPendientes.length}\n`);

    // 3. Procesar según lo encontrado
    if (truequesConfirmados.length > 0) {
      console.log('3. 🎯 TRUEQUES LISTOS PARA CIERRE:');
      truequesConfirmados.forEach((trueque, index) => {
        console.log(`   ${index + 1}. ID: ${trueque._id}`);
        console.log(`      📦 Ofrecido: ${trueque.productoOferente?.nombre}`);
        console.log(`      🔄 Solicitado: ${trueque.productoDestinatario?.nombre}`);
        console.log(`      👤 Oferente: ${trueque.oferente?.name}`);
        console.log(`      👤 Destinatario: ${trueque.destinatario?.name}`);
      });

      // Probar cierre con el primer trueque confirmado
      const truequeACerrar = truequesConfirmados[0];
      console.log(`\n4. 🔄 PROCESANDO CIERRE DEL TRUEQUE: ${truequeACerrar._id}`);
      
      const cierreRes = await axios.put(
        `http://localhost:3000/api/trueques/registrar-cierre`,
        { trueque_id: truequeACerrar._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('   ✅ RESPUESTA DEL CIERRE:');
      console.log(`      ├── Success: ${cierreRes.data.success}`);
      console.log(`      ├── Mensaje: ${cierreRes.data.message}`);
      console.log(`      ├── Trueque ID: ${cierreRes.data.trueque_id}`);
      console.log(`      └── Fecha: ${cierreRes.data.datos.fecha_cierre}`);

      // 5. Verificar trueques completados
      console.log('\n5. 📊 VERIFICANDO HISTORIAL DE TRUEQUES COMPLETADOS...');
      const completadosRes = await axios.get(
        `http://localhost:3000/api/trueques/completados`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log(`   ✅ Trueques completados en historial: ${completadosRes.data.total}`);
      
      if (completadosRes.data.trueques.length > 0) {
        console.log('\n   📝 ÚLTIMOS TRUEQUES COMPLETADOS:');
        completadosRes.data.trueques.slice(0, 3).forEach((trueque, index) => {
          console.log(`   ${index + 1}. ${trueque.fecha_confirmacion} - ${trueque.producto_ofrecido.nombre} ↔ ${trueque.producto_solicitado.nombre}`);
        });
      }

    } else if (truequesParcialConfirmados.length > 0) {
      console.log('3. ⚠️  TRUEQUES CON CONFIRMACIÓN PARCIAL:');
      truequesParcialConfirmados.forEach((trueque, index) => {
        console.log(`   ${index + 1}. ID: ${trueque._id}`);
        console.log(`      ✅ Oferente: ${trueque.confirmacion_oferente}`);
        console.log(`      ✅ Destinatario: ${trueque.confirmacion_destinatario}`);
        console.log(`      📦 ${trueque.productoOferente?.nombre} ↔ ${trueque.productoDestinatario?.nombre}`);
      });
      console.log('\n   💡 Faltan confirmaciones para completar el trueque');

    } else if (truequesSinConfirmar.length > 0) {
      console.log('3. ℹ️  TRUEQUES PENDIENTES DE CONFIRMACIÓN:');
      truequesSinConfirmar.slice(0, 3).forEach((trueque, index) => {
        console.log(`   ${index + 1}. ID: ${trueque._id}`);
        console.log(`      📦 ${trueque.productoOferente?.nombre} ↔ ${trueque.productoDestinatario?.nombre}`);
      });
      console.log('\n   💡 Necesitas confirmar estos trueques primero');

    } else {
      console.log('3. ❌ No hay trueques pendientes para procesar');
      console.log('   💡 Crea algunos trueques primero con: node scripts/testTruequeEnhanced.js');
    }

    console.log('\n🎉 PRUEBA COMPLETADA');

  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:');
    console.error('   🔴 Mensaje:', error.response?.data?.error || error.message);
    console.error('   📋 Detalles:', error.response?.data?.detalles);
    
    if (error.response?.status === 404) {
      console.error('   💡 Posible solución: Verifica que el servidor esté corriendo en puerto 3000');
    }
  }
}

// Ejecutar la prueba
testFlujoCompletoTrueque();