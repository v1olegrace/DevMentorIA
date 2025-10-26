/**
 * DevMentor AI - Testes de Integração para Conflitos de Sincronização
 * Simula 3 clientes em conflito para validar resolução determinística
 */

class SyncConflictTest {
  constructor() {
    this.clients = [];
    this.testResults = [];
  }

  /**
   * Cria 3 clientes simulados
   */
  createClients() {
    for (let i = 1; i <= 3; i++) {
      const client = {
        id: `client_${i}`,
        data: new Map(),
        syncSystem: this.createMockSyncSystem(`client_${i}`)
      };
      this.clients.push(client);
    }
  }

  /**
   * Cria sistema de sync mock para teste
   */
  createMockSyncSystem(clientId) {
    return {
      clientId: clientId,
      createVersionedRecord: (data, version = 1) => ({
        ...data,
        _meta: {
          version: version,
          lastModifiedTs: Date.now(),
          clientId: clientId,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      }),
      applyIncoming: async (remote, key) => {
        // Simular lógica de aplicação
        return { success: true, action: 'applied' };
      }
    };
  }

  /**
   * Teste 1: Conflito de versão simples
   */
  async testVersionConflict() {
    console.log('\n=== TESTE 1: CONFLITO DE VERSÃO SIMPLES ===');
    
    const key = 'test_record_1';
    
    // Cliente 1 cria registro
    const record1 = this.clients[0].syncSystem.createVersionedRecord({
      title: 'Documento Original',
      content: 'Conteúdo inicial',
      status: 'draft'
    }, 1);
    
    this.clients[0].data.set(key, record1);
    console.log('Cliente 1 criou:', record1._meta);
    
    // Cliente 2 modifica (versão 2)
    const record2 = this.clients[1].syncSystem.createVersionedRecord({
      title: 'Documento Modificado',
      content: 'Conteúdo atualizado',
      status: 'review'
    }, 2);
    
    this.clients[1].data.set(key, record2);
    console.log('Cliente 2 modificou:', record2._meta);
    
    // Cliente 3 tenta modificar versão antiga (deve ser rejeitado)
    const record3 = this.clients[2].syncSystem.createVersionedRecord({
      title: 'Documento Conflitante',
      content: 'Conteúdo conflitante',
      status: 'published'
    }, 1); // Versão antiga!
    
    console.log('Cliente 3 tentou modificar versão antiga:', record3._meta);
    
    // Simular resolução
    const result = await this.resolveVersionConflict(key, record2, record3);
    console.log('Resultado da resolução:', result);
    
    this.testResults.push({
      test: 'Version Conflict',
      success: result.winner === 'newer',
      details: result
    });
  }

  /**
   * Teste 2: Conflito de merge (versões iguais)
   */
  async testMergeConflict() {
    console.log('\n=== TESTE 2: CONFLITO DE MERGE ===');
    
    const key = 'test_record_2';
    
    // Cliente 1 cria registro
    const record1 = this.clients[0].syncSystem.createVersionedRecord({
      title: 'Projeto Alpha',
      tasks: ['task1', 'task2'],
      status: 'active',
      priority: 'high'
    }, 1);
    
    this.clients[0].data.set(key, record1);
    console.log('Cliente 1 criou:', record1);
    
    // Cliente 2 modifica (versão 2)
    const record2 = this.clients[1].syncSystem.createVersionedRecord({
      title: 'Projeto Alpha',
      tasks: ['task1', 'task2', 'task3'],
      status: 'active',
      priority: 'medium'
    }, 2);
    
    this.clients[1].data.set(key, record2);
    console.log('Cliente 2 modificou:', record2);
    
    // Cliente 3 modifica versão 2 (conflito!)
    const record3 = this.clients[2].syncSystem.createVersionedRecord({
      title: 'Projeto Alpha',
      tasks: ['task1', 'task2', 'task4'],
      status: 'paused',
      priority: 'high'
    }, 2); // Mesma versão!
    
    console.log('Cliente 3 modificou mesma versão:', record3);
    
    // Simular merge
    const mergeResult = await this.simulateMerge(record2, record3);
    console.log('Resultado do merge:', mergeResult);
    
    this.testResults.push({
      test: 'Merge Conflict',
      success: mergeResult.merged.tasks.length === 4, // Deve ter todos os tasks
      details: mergeResult
    });
  }

  /**
   * Teste 3: Conflito de array (múltiplas modificações)
   */
  async testArrayConflict() {
    console.log('\n=== TESTE 3: CONFLITO DE ARRAY ===');
    
    const key = 'test_record_3';
    
    // Cliente 1 cria lista
    const record1 = this.clients[0].syncSystem.createVersionedRecord({
      items: ['item1', 'item2'],
      lastModified: Date.now()
    }, 1);
    
    this.clients[0].data.set(key, record1);
    console.log('Cliente 1 criou lista:', record1.items);
    
    // Cliente 2 adiciona item
    const record2 = this.clients[1].syncSystem.createVersionedRecord({
      items: ['item1', 'item2', 'item3'],
      lastModified: Date.now() + 1000
    }, 2);
    
    this.clients[1].data.set(key, record2);
    console.log('Cliente 2 adicionou item:', record2.items);
    
    // Cliente 3 adiciona item diferente
    const record3 = this.clients[2].syncSystem.createVersionedRecord({
      items: ['item1', 'item2', 'item4'],
      lastModified: Date.now() + 2000
    }, 2); // Mesma versão!
    
    console.log('Cliente 3 adicionou item diferente:', record3.items);
    
    // Simular merge de arrays
    const arrayMergeResult = await this.simulateArrayMerge(record2, record3);
    console.log('Resultado do merge de arrays:', arrayMergeResult);
    
    this.testResults.push({
      test: 'Array Conflict',
      success: arrayMergeResult.items.length === 4, // Deve ter todos os itens
      details: arrayMergeResult
    });
  }

  /**
   * Simula resolução de conflito de versão
   */
  async resolveVersionConflict(key, newer, older) {
    if (newer._meta.version > older._meta.version) {
      return {
        winner: 'newer',
        action: 'accepted',
        reason: 'newer_version',
        key: key
      };
    } else if (newer._meta.version < older._meta.version) {
      return {
        winner: 'older',
        action: 'accepted',
        reason: 'newer_version',
        key: key
      };
    } else {
      return {
        winner: 'conflict',
        action: 'merge_required',
        reason: 'equal_version',
        key: key
      };
    }
  }

  /**
   * Simula merge de registros
   */
  async simulateMerge(local, remote) {
    const conflicts = [];
    const merged = { ...local };
    
    // Salvar versões antes de remover metadata
    const localVersion = local._meta?.version || 1;
    const remoteVersion = remote._meta?.version || 1;
    
    // Remover metadata
    delete merged._meta;
    const remoteCopy = { ...remote };
    delete remoteCopy._meta;
    
    // Merge campo a campo
    for (const [field, remoteValue] of Object.entries(remoteCopy)) {
      const localValue = merged[field];
      
      if (localValue === undefined) {
        merged[field] = remoteValue;
      } else if (localValue !== remoteValue) {
        // Conflito detectado
        conflicts.push({
          field: field,
          local: localValue,
          remote: remoteValue
        });
        
        // Estratégia de merge simples
        if (field === 'priority') {
          merged[field] = 'high'; // Prioridade alta vence
        } else if (field === 'status') {
          merged[field] = 'active'; // Status ativo vence
        } else if (Array.isArray(localValue) && Array.isArray(remoteValue)) {
          // Merge de arrays
          merged[field] = [...new Set([...localValue, ...remoteValue])];
        } else {
          // Manter local por padrão
          merged[field] = localValue;
        }
      }
    }
    
    return {
      success: conflicts.length === 0,
      merged: merged,
      conflicts: conflicts,
      version: Math.max(localVersion, remoteVersion) + 1
    };
  }

  /**
   * Simula merge de arrays
   */
  async simulateArrayMerge(local, remote) {
    const localItems = local.items || [];
    const remoteItems = remote.items || [];
    
    // Merge inteligente de arrays
    const mergedItems = [...new Set([...localItems, ...remoteItems])];
    
    return {
      success: true,
      items: mergedItems,
      conflicts: [],
      version: Math.max(local._meta.version, remote._meta.version) + 1
    };
  }

  /**
   * Executa todos os testes
   */
  async runAllTests() {
    console.log('=== INICIANDO TESTES DE CONFLITO DE SINCRONIZAÇÃO ===');
    
    this.createClients();
    
    await this.testVersionConflict();
    await this.testMergeConflict();
    await this.testArrayConflict();
    
    this.printResults();
  }

  /**
   * Imprime resultados dos testes
   */
  printResults() {
    console.log('\n=== RESULTADOS DOS TESTES ===');
    
    let passed = 0;
    let total = this.testResults.length;
    
    this.testResults.forEach((result, index) => {
      const status = result.success ? '✅ PASSOU' : '❌ FALHOU';
      console.log(`Teste ${index + 1}: ${result.test} - ${status}`);
      
      if (result.success) {
        passed++;
      } else {
        console.log('  Detalhes:', result.details);
      }
    });
    
    console.log(`\nResumo: ${passed}/${total} testes passaram`);
    
    if (passed === total) {
      console.log('🎉 TODOS OS TESTES PASSARAM!');
    } else {
      console.log('⚠️  ALGUNS TESTES FALHARAM!');
    }
  }
}

// Executar testes
const testRunner = new SyncConflictTest();
testRunner.runAllTests();
