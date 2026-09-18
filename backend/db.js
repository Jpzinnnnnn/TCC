const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'monsenhor_bicudo',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(connection => {
    console.log('✅ Banco conectado com sucesso');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Erro ao conectar no banco:', err);
  });

module.exports = pool;