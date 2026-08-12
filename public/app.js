document.addEventListener('DOMContentLoaded', () => {

    // 1. Dados e Seletor de Categorias
    const categoryData = {
        go: {
            title: "VerdeGO Go",
            persona: "Persona: Jairo",
            desc: "Foco em economia de até 5x por km rodado, agilidade e máxima eficiência sustentável para seus deslocamentos diários.",
            specs: ["✓ Hatch elétrico compacto e ágil", "✓ Economia máxima no dia a dia", "✓ Emissão zero de poluentes"],
            price: "R$ 1,80 / km"
        },
        shield: {
            title: "VerdeGO Shield",
            persona: "Persona: Célia",
            desc: "SUVs espaçosos com sensores ADAS ativos, oferecendo o máximo de segurança para famílias, idosos e mulheres.",
            specs: ["✓ SUV elétrico amplo com 5 estrelas em crash-test", "✓ Sensores ADAS ativados em tempo real", "✓ Motoristas com verificação de antecedentes avançada"],
            price: "R$ 2,50 / km"
        },
        exec: {
            title: "VerdeGO Executive",
            persona: "Persona: Otávio",
            desc: "Sedans e SUVs de alto padrão (BMW iX, Volvo XC40) com silêncio absoluto para reuniões e máximo conforto corporativo.",
            specs: ["✓ Veículos Premium de alta performance", "✓ Isolamento acústico avançado para chamadas", "✓ Wi-Fi a bordo e carregadores ultra-rápidos"],
            price: "R$ 4,20 / km"
        },
        pet: {
            title: "VerdeGO Pet & Eco",
            persona: "Persona: Alisson",
            desc: "Veículos equipados com capas higiênicas, cinto de segurança pet e total preparação para transportá-lo junto ao seu melhor amigo.",
            specs: ["✓ Equipamentos de proteção higiênica pet", "✓ Motoristas Pet-Friendly certificados", "✓ Espaço adaptado para caixas de transporte"],
            price: "R$ 2,90 / km"
        }
    };

    const categoryButtons = document.querySelectorAll('.cat-btn');
    const catTitle = document.getElementById('catTitle');
    const catBadge = document.getElementById('catBadge');
    const catDesc = document.getElementById('catDesc');
    const catSpecs = document.getElementById('catSpecs');
    const catPrice = document.getElementById('catPrice');

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => {
                b.classList.remove('bg-emerald-900/60', 'border-emerald-500', 'text-emerald-300');
                b.classList.add('bg-space-800', 'border-slate-700', 'text-slate-300');
            });

            btn.classList.remove('bg-space-800', 'border-slate-700', 'text-slate-300');
            btn.classList.add('bg-emerald-900/60', 'border-emerald-500', 'text-emerald-300');

            const catKey = btn.getAttribute('data-cat');
            const data = categoryData[catKey];

            if (data) {
                catTitle.textContent = data.title;
                catBadge.textContent = data.persona;
                catDesc.textContent = data.desc;
                catPrice.textContent = data.price;
                catSpecs.innerHTML = data.specs.map(spec => `<li>${spec}</li>`).join('');
            }
        });
    });

    // 2. Simulador de Impacto Ambiental (CO2)
    const kmInput = document.getElementById('kmInput');
    const kmValue = document.getElementById('kmValue');
    const co2Saved = document.getElementById('co2Saved');
    const treesSaved = document.getElementById('treesSaved');

    if (kmInput) {
        kmInput.addEventListener('input', (e) => {
            const km = parseInt(e.target.value);
            kmValue.textContent = `${km} KM/dia`;

            // Cálculo aproximado: 120g CO2 salvas por km rodado
            const co2Kg = ((km * 30 * 0.12)).toFixed(1);
            const trees = Math.round(co2Kg / 0.15);

            co2Saved.textContent = co2Kg;
            treesSaved.textContent = trees;
        });
    }

    // 3. Alternador "Modo VerdeGO Simples" (Acessibilidade)
    const toggleSimpleModeBtn = document.getElementById('toggleSimpleMode');
    const simpleBtnText = document.getElementById('simpleBtnText');

    if (toggleSimpleModeBtn) {
        toggleSimpleModeBtn.addEventListener('click', () => {
            document.body.classList.toggle('modo-simples');
            const isSimple = document.body.classList.contains('modo-simples');

            if (isSimple) {
                simpleBtnText.textContent = "Modo Padrão";
            } else {
                simpleBtnText.textContent = "Modo VerdeGO Simples";
            }
        });
    }

    // 4. Modais (Suporte Humano e B2B)
    const supportModal = document.getElementById('supportModal');
    const openSupportBtn = document.getElementById('openSupportBtn');
    const closeSupportModal = document.getElementById('closeSupportModal');

    if (openSupportBtn && supportModal && closeSupportModal) {
        openSupportBtn.addEventListener('click', () => supportModal.classList.remove('hidden'));
        closeSupportModal.addEventListener('click', () => supportModal.classList.add('hidden'));
    }

    const b2bModal = document.getElementById('b2bModal');
    const openB2BModal = document.getElementById('openB2BModal');
    const closeB2BModal = document.getElementById('closeB2BModal');

    if (openB2BModal && b2bModal && closeB2BModal) {
        openB2BModal.addEventListener('click', () => b2bModal.classList.remove('hidden'));
        closeB2BModal.addEventListener('click', () => b2bModal.classList.add('hidden'));
    }
});
