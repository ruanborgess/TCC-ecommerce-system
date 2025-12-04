document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const searchInput = document.getElementById('searchProduto');
    const produtosGrid = document.getElementById('produtosGrid');
    const produtoCards = document.querySelectorAll('.produto-card');
    const tipoPesquisa = document.getElementById('tipoPesquisa');
    
    // Busca
    searchInput.addEventListener('input', filtrarProdutos);
    tipoPesquisa.addEventListener('change', filtrarProdutos);

    function filtrarProdutos() {
        const termo = searchInput.value.trim().toLowerCase();
        const tipo = tipoPesquisa.value;

        produtoCards.forEach(card => {
            const id = (card.getAttribute('data-id') || '').trim();
            const nome = (card.getAttribute('data-nome') || '').toLowerCase();

            let mostrar = false;
            if (!termo) {
                mostrar = true;
            } else if (tipo === 'id') {
                mostrar = id === termo;
            } else if (tipo === 'nome') {
                mostrar = nome.includes(termo);
            }

            card.style.display = mostrar ? '' : 'none';
        });

        atualizarContadores();
    }

    // Filtro por Categoria
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const filtro = this.dataset.filter;
            
            produtoCards.forEach(card => {
                if (filtro === 'all') {
                    card.style.display = '';
                } else {
                    const categoria = card.getAttribute('data-categoria');
                    card.style.display = categoria === filtro ? '' : 'none';
                }
            });
            
            atualizarContadores();
        });
    });

    // Toggle Detalhes
    window.toggleDetalhes = function(btn) {
        const card = btn.closest('.produto-item');
        const detalhes = card.querySelector('.produto-detalhes');
        const isVisible = detalhes.style.display !== 'none';
        
        detalhes.style.display = isVisible ? 'none' : 'block';
        btn.querySelector('i').className = isVisible ? 
            'fas fa-info-circle' : 'fas fa-chevron-up';
    };

    // Confirmação de Exclusão
    const confirmModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
    let produtoIdToDelete = null;

    document.querySelectorAll('.btn-delete-prod').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            produtoIdToDelete = this.getAttribute('data-id');
            const nome = this.getAttribute('data-nome');
            document.getElementById('confirmDeleteText').textContent = 
                `Deseja excluir "${nome}"? Esta ação não pode ser desfeita.`;
            confirmModal.show();
        });
    });

    document.getElementById('confirmDeleteBtn')?.addEventListener('click', function() {
        if (produtoIdToDelete) {
            const form = document.getElementById(`form-delete-${produtoIdToDelete}`);
            if (form) {
                form.submit();
            }
        }
        confirmModal.hide();
    });

    // Função atualizada para contar estoque corretamente
    function atualizarContadores() {
        const visiveis = Array.from(produtoCards).filter(
            card => card.style.display !== 'none'
        );
        
        const total = visiveis.length;
        const emEstoque = visiveis.filter(card => {
            const estoque = parseInt(card.querySelector('.estoque-badge').textContent.replace(/\D/g, ''));
            return estoque > 0;
        }).length;
        
        const estoqueBaixo = visiveis.filter(card => {
            const estoque = parseInt(card.querySelector('.estoque-badge').textContent.replace(/\D/g, ''));
            return estoque > 0 && estoque <= 5;
        }).length;

        // Atualiza os contadores
        document.querySelector('.stat-item:nth-child(1) h3').textContent = total;
        document.querySelector('.stat-item:nth-child(2) h3').textContent = emEstoque;
        document.querySelector('.stat-item:nth-child(3) h3').textContent = estoqueBaixo;

        // Atualiza os textos
        document.querySelector('.stat-item:nth-child(2) p').textContent = 
            emEstoque === 1 ? 'Em Estoque' : 'Em Estoque';
        document.querySelector('.stat-item:nth-child(3) p').textContent = 
            estoqueBaixo === 1 ? 'Estoque Baixo' : 'Estoque Baixo';
    }

    // Chama a função na inicialização
    atualizarContadores();

    // Foco na busca
    searchInput.focus();
});