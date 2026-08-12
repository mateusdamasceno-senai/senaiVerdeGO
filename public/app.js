document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Inicialização do Mapa (Leaflet JS - Estilo Dark Uber)
    const map = L.map('map', {
        zoomControl: false
    }).setView([-23.561684, -46.655981], 14); // Posição Inicial: Av. Paulista (São Paulo)

    // Camada de Mapa Estilo Dark
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);

    // Marcador de Origem (Usuário)
    const userIcon = L.divIcon({
        className: 'custom-user-pin',
        html: `<div style="background-color: #10B981; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #00FF66; box-shadow: 0 0 10px #00FF66;"></div>`,
        iconSize: [16, 16]
    });
    const userMarker = L.marker([-23.561684, -46.655981], { icon: userIcon }).addTo(map);

    // Marcadores de Carros Elétricos VerdeGO Próximos Simulados
    const cars = [
        { lat: -23.5590, lng: -46.6580, title: "Hatch Elétrico" },
        { lat: -23.5640, lng: -46.6520, title: "SUV Shield" },
        { lat: -23.5600, lng: -46.6510, title: "Executive BMW" }
    ];

    const carIcon = L.divIcon({
        className: 'custom-car-pin',
        html: `<div style="font-size: 20px;">⚡🚗</div>`,
        iconSize: [24, 24]
    });

    cars.forEach(car => {
        L.marker([car.lat, car.lng], { icon: carIcon }).addTo(map);
    });

    // 2. Seleção de Categoria e Atualização de Preço
    const rideOptions = document.querySelectorAll('.ride-option');
    const requestRideBtn = document.getElementById('requestRideBtn');
    const co2RideSave = document.getElementById('co2RideSave');

    const co2Map = {
        go: "1.8 kg",
        shield: "2.4 kg",
        exec: "3.1 kg",
        pet: "2.2 kg"
    };

    rideOptions.forEach(option => {
        option.addEventListener('click', () => {
            rideOptions.forEach(o => {
                o.classList.remove('active', 'border-2', 'border-emerald-500', 'bg-emerald-950/30');
                o.classList.add('border', 'border-slate-800', 'bg-space-800/80');
            });

            option.classList.remove('border', 'border-slate-800', 'bg-space-800/80');
            option.classList.add('active', 'border-2', 'border-emerald-500', 'bg-emerald-950/30');

            const cat = option.getAttribute('data-cat');
            const price = option.getAttribute('data-price');
            const catName = option.querySelector('.font-bold').childNodes[0].textContent.trim();

            requestRideBtn.textContent = `Confirmar ${catName} • R$ ${price}`;
            co2RideSave.textContent = co2Map[cat] || "2.0 kg";
        });
    });

    // 3. Simulação de Solicitação de Corrida (Animação de Busca)
    const driverStatusCard = document.getElementById('driverStatusCard');
    const cancelRideBtn = document.getElementById('cancelRideBtn');

    requestRideBtn.addEventListener('click', () => {
        requestRideBtn.disabled = true;
        requestRideBtn.textContent = "Procurando motorista VerdeGO...";
        requestRideBtn.classList.add('opacity-75', 'animate-pulse');

        setTimeout(() => {
            requestRideBtn.disabled = false;
            requestRideBtn.classList.remove('opacity-75', 'animate-pulse');
            requestRideBtn.textContent = "Viagem em Andamento";
            
            // Exibe o Card do Motorista no Mapa
            driverStatusCard.classList.remove('hidden');

            // Desenha linha simulada de rota no mapa
            const routeCoordinates = [
                [-23.561684, -46.655981],
                [-23.5590, -46.6580]
            ];
            const polyline = L.polyline(routeCoordinates, { color: '#00FF66', weight: 4, dashArray: '8, 8' }).addTo(map);
            map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

        }, 2000);
    });

    cancelRideBtn.addEventListener('click', () => {
        driverStatusCard.classList.add('hidden');
        requestRideBtn.textContent = "Confirmar VerdeGO Go";
    });

    // 4. Modal de Suporte Humano
    const supportModal = document.getElementById('supportModal');
    const openSupportBtn = document.getElementById('openSupportBtn');
    const closeSupportModal = document.getElementById('closeSupportModal');

    if (openSupportBtn && supportModal && closeSupportModal) {
        openSupportBtn.addEventListener('click', () => supportModal.classList.remove('hidden'));
        closeSupportModal.addEventListener('click', () => supportModal.classList.add('hidden'));
    }

    // 5. Modo Acessibilidade
    const toggleSimpleModeBtn = document.getElementById('toggleSimpleMode');
    if (toggleSimpleModeBtn) {
        toggleSimpleModeBtn.addEventListener('click', () => {
            document.body.classList.toggle('modo-simples');
        });
    }
});
