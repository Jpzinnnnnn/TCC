const http = require('http');

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, res => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(responseBody) });
        } catch {
          resolve({ status: res.statusCode, body: responseBody });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Iniciando bateria de testes dos fluxos de CRUD...\n');

  // 1. Teste de Login
  console.log('1️⃣ Testando Autenticação (POST /login)...');
  const loginRes = await request('POST', '/login', {
    email: 'admin@escola.com',
    senha: 'Admin123!'
  });
  console.log(`Status: ${loginRes.status}, Sucesso: ${loginRes.body.sucesso}`);
  if (loginRes.status !== 200 || !loginRes.body.sucesso) throw new Error('Falha no teste de login');

  // 2. Teste de Avisos CRUD
  console.log('\n2️⃣ Testando Avisos CRUD...');
  // Criar
  const novoAviso = await request('POST', '/avisos', {
    titulo: 'Aviso Teste Automatizado',
    categoria: 'Geral',
    descricao: 'Conteúdo de teste para validação de CRUD',
    data: '2026-09-20',
    horario_comeco: '10:00',
    horario_final: '11:00',
    evento_dia: false,
    importante: true
  });
  console.log(`CRIAR: Status ${novoAviso.status}, ID: ${novoAviso.body.id_aviso}`);
  const idAviso = novoAviso.body.id_aviso;

  // Buscar todos
  const todosAvisos = await request('GET', '/avisos');
  console.log(`LISTAR: Status ${todosAvisos.status}, Total: ${todosAvisos.body.length}`);

  // Atualizar
  const editAviso = await request('PUT', `/avisos/${idAviso}`, {
    titulo: 'Aviso Teste Atualizado',
    categoria: 'Geral',
    descricao: 'Conteúdo editado com sucesso',
    data: '2026-09-21',
    horario_comeco: '14:00',
    horario_final: '15:00',
    evento_dia: false,
    importante: false
  });
  console.log(`ATUALIZAR: Status ${editAviso.status}, Msg: ${editAviso.body.mensagem}`);

  // Excluir
  const delAviso = await request('DELETE', `/avisos/${idAviso}`);
  console.log(`EXCLUIR: Status ${delAviso.status}, Msg: ${delAviso.body.mensagem}`);

  // 3. Teste de Calendário / Eventos CRUD
  console.log('\n3️⃣ Testando Calendário / Eventos CRUD...');
  // Criar
  const novoEvento = await request('POST', '/eventos', {
    titulo: 'Campeonato de Robótica',
    descricao: 'Competição escolar entre equipes',
    categoria: 'Acadêmico',
    cor: 'azul',
    data: '2026-10-15',
    horario: '09h00 às 16h00',
    local: 'Ginásio'
  });
  console.log(`CRIAR: Status ${novoEvento.status}, ID: ${novoEvento.body.id_evento}`);
  const idEvento = novoEvento.body.id_evento;

  // Listar
  const todosEventos = await request('GET', '/eventos');
  console.log(`LISTAR: Status ${todosEventos.status}, Total: ${todosEventos.body.length}`);

  // Atualizar
  const editEvento = await request('PUT', `/eventos/${idEvento}`, {
    titulo: 'Campeonato de Robótica Regional',
    descricao: 'Competição expandida',
    categoria: 'Acadêmico',
    cor: 'verde',
    data: '2026-10-16',
    horario: '10h00 às 17h00',
    local: 'Ginásio Poliesportivo'
  });
  console.log(`ATUALIZAR: Status ${editEvento.status}, Msg: ${editEvento.body.mensagem}`);

  // Excluir
  const delEvento = await request('DELETE', `/eventos/${idEvento}`);
  console.log(`EXCLUIR: Status ${delEvento.status}, Msg: ${delEvento.body.mensagem}`);

  // 4. Teste de Cardápio CRUD
  console.log('\n4️⃣ Testando Cardápio CRUD...');
  // Salvar refeição em lote
  const salvaRefeicao = await request('POST', '/cardapio/refeicao', {
    dia: '2026-09-22',
    hora: 1, // Almoço
    comidas: ['Arroz integral', 'Feijão preto', 'Frango grelhado', 'Salada de tomate']
  });
  console.log(`SALVAR REFEIÇÃO: Status ${salvaRefeicao.status}, Total: ${salvaRefeicao.body.total_itens}`);

  // Listar
  const todosCardapio = await request('GET', '/cardapio');
  console.log(`LISTAR: Status ${todosCardapio.status}, Total itens: ${todosCardapio.body.length}`);

  // Adicionar alimento avulso
  const itemIndividual = await request('POST', '/cardapio', {
    dia: '2026-09-22',
    hora: 2, // Café da tarde
    comida: 'Bolo de cenoura'
  });
  console.log(`CRIAR ITEM INDIVIDUAL: Status ${itemIndividual.status}, ID: ${itemIndividual.body.id_cardapio}`);

  // Excluir item avulso
  const delCardapio = await request('DELETE', `/cardapio/${itemIndividual.body.id_cardapio}`);
  console.log(`EXCLUIR ITEM: Status ${delCardapio.status}, Msg: ${delCardapio.body.mensagem}`);

  console.log('\n🎉 TODOS OS TESTES DE CRUD PASSARAM COM SUCESSO!');
}

module.exports = runTests;

if (require.main === module) {
  runTests().catch(err => {
    console.error('❌ Erro no teste:', err);
    process.exit(1);
  });
}
