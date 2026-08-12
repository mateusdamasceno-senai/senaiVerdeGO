document.addEventListener('DOMContentLoaded', () => {

    // 1. Mapa Leaflet (Estilo Dark Uber)
    const map = L.map('map', { zoomControl: false }).setView([-23.561684, -46.655981], 14);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; CARTO'
    }).addTo(map);

    const userIcon = L.divIcon({
        className: 'custom-user-pin',
        html: `<div style="background-color: #10B981; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #00FF66; box-shadow: 0 0 10px #00FF66;"></div>`,
        iconSize: [16, 16]
    });
    L.marker([-23.561684, -46.655981], { icon: userIcon }).addTo(map);

    const carIcon = L.divIcon({
        className: 'custom-car-pin',
        html: `<div style="font-size: 20px;">⚡🚗</div>`,
        iconSize: [24, 24]
    });

    [
        { lat: -23.5590, lng: -46.6580 },
        { lat: -23.5640, lng: -46.6520 },
        { lat: -23.5600, lng: -46.6510 }
    ].forEach(c => L.marker([c.lat, c.lng], { icon: carIcon }).addTo(map));

    // 2. Troca de Categoria e Atualização de Foto e Modelo do Carro
    const rideOptions = document.querySelectorAll('.ride-option');
    const requestRideBtn = document.getElementById('requestRideBtn');
    const previewCarImg = document.getElementById('previewCarImg');
    const previewCarModel = document.getElementById('previewCarModel');
    const previewCarSpec = document.getElementById('previewCarSpec');
    const co2RideSave = document.getElementById('co2RideSave');

    let currentSelectedCar = {
        model: "BYD Dolphin Mini",
        img: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=300&q=80"
    };

    rideOptions.forEach(option => {
        option.addEventListener('click', () => {
            rideOptions.forEach(o => {
                o.classList.remove('active', 'border-2', 'border-emerald-500', 'bg-emerald-950/30');
                o.classList.add('border', 'border-slate-800', 'bg-space-800/80');
            });

            option.classList.remove('border', 'border-slate-800', 'bg-space-800/80');
            option.classList.add('active', 'border-2', 'border-emerald-500', 'bg-emerald-950/30');

            const price = option.getAttribute('data-price');
            const model = option.getAttribute('data-model');
            const spec = option.getAttribute('data-spec');
            const img = option.getAttribute('data-img');
            const catName = option.querySelector('.font-bold').childNodes[0].textContent.trim();

            currentSelectedCar = { model, img };

            previewCarImg.src = img;
            previewCarModel.textContent = model;
            previewCarSpec.textContent = spec;
            requestRideBtn.textContent = `Confirmar ${catName} • R$ ${price}`;
            co2RideSave.textContent = (parseFloat(price) * 0.08).toFixed(1) + " kg";
        });
    });

    // 3. Solicitação de Corrida com Animação e Status do Carro
    const driverStatusCard = document.getElementById('driverStatusCard');
    const statusCarModel = document.getElementById('statusCarModel');
    const statusCarImg = document.getElementById('statusCarImg');
    const cancelRideBtn = document.getElementById('cancelRideBtn');

    requestRideBtn.addEventListener('click', () => {
        requestRideBtn.disabled = true;
        requestRideBtn.textContent = "Localizando motorista...";
        requestRideBtn.classList.add('opacity-75', 'animate-pulse');

        setTimeout(() => {
            requestRideBtn.disabled = false;
            requestRideBtn.classList.remove('opacity-75', 'animate-pulse');
            requestRideBtn.textContent = "Viagem Confirmada!";

            statusCarModel.textContent = `${currentSelectedCar.model} • ABC-4E20`;
            statusCarImg.src = currentSelectedCar.img;
            driverStatusCard.classList.remove('hidden');

            const routeCoordinates = [[-23.561684, -46.655981], [-23.5590, -46.6580]];
            const polyline = L.polyline(routeCoordinates, { color: '#00FF66', weight: 4, dashArray: '8, 8' }).addTo(map);
            map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
        }, 1500);
    });

    cancelRideBtn.addEventListener('click', () => {
        driverStatusCard.classList.add('hidden');
        requestRideBtn.textContent = "Confirmar VerdeGO Go • R$ 24,50";
    });

    // 4. Assistente Humano Interativo (Chat)
    const supportModal = document.getElementById('supportModal');
    const openSupportBtn = document.getElementById('openSupportBtn');
    const closeSupportModal = document.getElementById('closeSupportModal');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatHistory = document.getElementById('chatHistory');

    if (openSupportBtn && supportModal && closeSupportModal) {
        openSupportBtn.addEventListener('click', () => supportModal.classList.remove('hidden'));
        closeSupportModal.addEventListener('click', () => supportModal.classList.add('hidden'));
    }

    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if (!text) return;

            // Mensagem do Usuário
            const userMsg = document.createElement('div');
            userMsg.className = "bg-space-800 border border-slate-700 p-2.5 rounded-xl text-right text-slate-100";
            userMsg.textContent = text;
            chatHistory.appendChild(userMsg);

            chatInput.value = '';
            chatHistory.scrollTop = chatHistory.scrollHeight;

            // Resposta Automática Simula Atendente Humano
            setTimeout(() => {
                const agentMsg = document.createElement('div');
                agentMsg.className = "bg-emerald-950/60 border border-emerald-500/30 p-2.5 rounded-xl text-slate-200";
                
                const agentResponses = [
                    "Entendido! Estou acompanhando a localização do seu veículo no sistema agora mesmo.",
                    "Pode ficar tranquilo(a), os sensores ADAS e o motorista estão com status 100% verificado.",
                    "Precisa que eu envie alguma instrução ao motorista sobre o local de embarque?"
                ];
                const randomResponse = agentResponses[Math.floor(Math.random() * agentResponses.length)];
                
                agentMsg.innerHTML = `<span class="text-emerald-400 font-bold block mb-0.5">Atendente Gabriel</span>"${randomResponse}"`;
                chatHistory.appendChild(agentMsg);
                chatHistory.scrollTop = chatHistory.scrollHeight;
            }, 1000);
        });
    }

    // 5. Modo Acessibilidade Simples
    const toggleSimpleModeBtn = document.getElementById('toggleSimpleMode');
    if (toggleSimpleModeBtn) {
        toggleSimpleModeBtn.addEventListener('click', () => document.body.classList.toggle('modo-simples'));
    }
});
