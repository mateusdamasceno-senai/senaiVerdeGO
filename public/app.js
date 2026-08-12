document.addEventListener('DOMContentLoaded', () => {

    // 0. Feedback Sonoro Native Web Audio API
    function playAudioTone(freq = 600, duration = 0.1) {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.value = freq;
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
            osc.stop(ctx.currentTime + duration);
        } catch(e){}
    }

    // 1. Contador de CO2 Global
    let currentCo2 = 14829.4;
    const globalCo2Counter = document.getElementById('globalCo2Counter');
    setInterval(() => {
        currentCo2 += (Math.random() * 0.3);
        if(globalCo2Counter) globalCo2Counter.textContent = currentCo2.toLocaleString('pt-BR', {minimumFractionDigits: 1, maximumFractionDigits: 1}) + ' kg';
    }, 2500);

    // 2. Mapa Leaflet Elegante + Modos HD
    const originCoords = [-23.561684, -46.655981];
    let destCoords = [-23.587416, -46.657634];

    const map = L.map('map', { zoomControl: false }).setView(originCoords, 14);

    // Camadas de Mapa
    const tilesDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', { maxZoom: 19 });
    const tilesLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 });
    const tilesSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 });

    tilesDark.addTo(map); // Padrão

    // Alternar Estilos do Mapa
    const btnDark = document.getElementById('mapStyleDark');
    const btnLight = document.getElementById('mapStyleLight');
    const btnSat = document.getElementById('mapStyleSat');

    function setMapStyle(activeBtn, layer) {
        [btnDark, btnLight, btnSat].forEach(b => {
            b.classList.remove('bg-emerald-500', 'text-space-900');
            b.classList.add('text-slate-300');
        });
        activeBtn.classList.add('bg-emerald-500', 'text-space-900');
        activeBtn.classList.remove('text-slate-300');

        map.removeLayer(tilesDark);
        map.removeLayer(tilesLight);
        map.removeLayer(tilesSat);
        layer.addTo(map);
    }

    btnDark.addEventListener('click', () => setMapStyle(btnDark, tilesDark));
    btnLight.addEventListener('click', () => setMapStyle(btnLight, tilesLight));
    btnSat.addEventListener('click', () => setMapStyle(btnSat, tilesSat));

    // Marcador do Passageiro com Efeito Glow
    const userIcon = L.divIcon({
        className: 'custom-user-pin',
        html: `<div class="pulse-ring"></div><div style="background-color: #10B981; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #FFFFFF; box-shadow: 0 0 10px #00FF66;"></div>`
    });
    let userMarker = L.marker(originCoords, { icon: userIcon }).addTo(map);

    // Marcadores de Carros Flutuantes
    const carIcon = L.divIcon({
        className: 'custom-car-pin',
        html: `<div style="font-size: 24px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">🚗⚡</div>`
    });

    let liveCars = [
        { id: 1, lat: -23.5590, lng: -46.6580, marker: null },
        { id: 2, lat: -23.5640, lng: -46.6520, marker: null },
        { id: 3, lat: -23.5600, lng: -46.6510, marker: null }
    ];

    liveCars.forEach(c => {
        c.marker = L.marker([c.lat, c.lng], { icon: carIcon }).addTo(map);
    });

    // Animação de Vagando pela Cidade
    setInterval(() => {
        if(!isTripActive) {
            liveCars.forEach(c => {
                c.lat += (Math.random() - 0.5) * 0.0015;
                c.lng += (Math.random() - 0.5) * 0.0015;
                c.marker.setLatLng([c.lat, c.lng]);
            });
        }
    }, 2500);

    // 3. Rota Inicial
    let routePolyline = L.polyline([originCoords, destCoords], { color: '#00FF66', weight: 5, opacity: 0.8, dashArray: '10, 10' }).addTo(map);
    map.fitBounds(routePolyline.getBounds(), { padding: [50, 50] });

    // Autocomplete e Rota Dinâmica
    const destInput = document.getElementById('destInput');
    const autocompleteList = document.getElementById('autocompleteList');
    const tripDistance = document.getElementById('tripDistance');
    let currentDistanceKm = 4.2;

    if(destInput) {
        destInput.addEventListener('input', async (e) => {
            const query = e.target.value;
            if (query.length < 3) {
                autocompleteList.classList.add('hidden');
                return;
            }

            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=4`);
                const data = await res.json();

                autocompleteList.innerHTML = '';
                if(data.length > 0) {
                    autocompleteList.classList.remove('hidden');
                    data.forEach(item => {
                        const div = document.createElement('div');
                        div.className = 'autocomplete-item';
                        div.textContent = item.display_name;
                        div.addEventListener('click', () => {
                            destInput.value = item.display_name.split(',')[0];
                            autocompleteList.classList.add('hidden');
                            
                            destCoords = [parseFloat(item.lat), parseFloat(item.lon)];
                            
                            if(routePolyline) map.removeLayer(routePolyline);
                            
                            routePolyline = L.polyline([originCoords, destCoords], { color: '#00FF66', weight: 5, opacity: 0.8, dashArray: '10, 10' }).addTo(map);
                            map.fitBounds(routePolyline.getBounds(), { padding: [50, 50] });

                            const distMeters = L.latLng(originCoords).distanceTo(L.latLng(destCoords));
                            currentDistanceKm = (distMeters / 1000).toFixed(1);
                            if (currentDistanceKm < 1) currentDistanceKm = 1.5;
                            tripDistance.textContent = `${currentDistanceKm} km`;
                            
                            updatePrices();
                            playAudioTone(800, 0.1);
                        });
                        autocompleteList.appendChild(div);
                    });
                }
            } catch(err) {}
        });
    }

    // 4. Categorias de Veículos
    const rideOptions = document.querySelectorAll('.ride-option');
    const requestRideBtn = document.getElementById('requestRideBtn');
    const previewCarImg = document.getElementById('previewCarImg');
    const previewCarModel = document.getElementById('previewCarModel');
    const previewCarSpec = document.getElementById('previewCarSpec');
    const previewBattery = document.getElementById('previewBattery');

    let selectedCategory = {
        name: "VerdeGO Go",
        price: "24,60",
        model: "BYD Dolphin Mini",
        spec: "100% Elétrico • Hatch Compacto",
        battery: "92%",
        autonomia: "280km",
        img: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=300&q=80",
        interior: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80"
    };

    function updatePrices() {
        rideOptions.forEach(opt => {
            const base = parseFloat(opt.getAttribute('data-base'));
            const perkm = parseFloat(opt.getAttribute('data-perkm'));
            const price = (base + (perkm * currentDistanceKm)).toFixed(2).replace('.', ',');
            opt.querySelector('.price-tag').textContent = `R$ ${price}`;
            
            if(opt.classList.contains('active')) {
                const catName = opt.querySelector('.font-bold').textContent;
                selectedCategory.price = price;
                requestRideBtn.textContent = `Confirmar ${catName} • R$ ${price}`;
            }
        });
    }

    rideOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            playAudioTone(500, 0.08);
            rideOptions.forEach(o => {
                o.classList.remove('active', 'border-2', 'border-emerald-500', 'bg-emerald-950/30');
                o.classList.add('border', 'border-slate-800', 'bg-space-800/80');
            });
            opt.classList.remove('border', 'border-slate-800', 'bg-space-800/80');
            opt.classList.add('active', 'border-2', 'border-emerald-500', 'bg-emerald-950/30');

            const model = opt.getAttribute('data-model');
            const spec = opt.getAttribute('data-spec');
            const battery = opt.getAttribute('data-battery');
            const autonomia = opt.getAttribute('data-autonomia');
            const img = opt.getAttribute('data-img');
            const interior = opt.getAttribute('data-interior');
            const catName = opt.querySelector('.font-bold').textContent;
            const price = opt.querySelector('.price-tag').textContent;

            previewCarImg.src = img;
            previewCarModel.textContent = model;
            previewCarSpec.textContent = spec;
            previewBattery.textContent = `🔋 Bateria: ${battery} • Autonomia: ${autonomia}`;
            requestRideBtn.textContent = `Confirmar ${catName} • ${price}`;

            selectedCategory = { name: catName, price, model, spec, battery, autonomia, img, interior };
        });
    });

    // 5. Sistema de Animação Fluida de Corrida em Tempo Real
    let isTripActive = false;
    let animationInterval = null;
    const driverStatusCard = document.getElementById('driverStatusCard');
    const statusCarModel = document.getElementById('statusCarModel');
    const statusCarImg = document.getElementById('statusCarImg');
    const cancelRideBtn = document.getElementById('cancelRideBtn');
    const progressBar = document.getElementById('progressBar');
    const tripStatusLabel = document.getElementById('tripStatusLabel');

    requestRideBtn.addEventListener('click', () => {
        playAudioTone(900, 0.15);
        requestRideBtn.disabled = true;
        requestRideBtn.textContent = "Solicitando Motorista...";
        
        setTimeout(() => {
            requestRideBtn.disabled = false;
            requestRideBtn.textContent = "Corrida em Andamento";
            statusCarModel.textContent = `${selectedCategory.model} • ABC-4E20`;
            statusCarImg.src = selectedCategory.img;
            driverStatusCard.classList.remove('hidden');
            isTripActive = true;

            // Iniciar Animação do Veículo ao longo da Rota
            startCarAnimation();
        }, 1200);
    });

    function startCarAnimation() {
        const animatedCar = liveCars[0].marker;
        let step = 0;
        const totalSteps = 100;
        
        const startLat = originCoords[0];
        const startLng = originCoords[1];
        const endLat = destCoords[0];
        const endLng = destCoords[1];

        if(animationInterval) clearInterval(animationInterval);

        tripStatusLabel.textContent = "Viagem Iniciada";

        animationInterval = setInterval(() => {
            step++;
            const progress = step / totalSteps;
            
            // Interpolação Linear de Posição
            const currentLat = startLat + (endLat - startLat) * progress;
            const currentLng = startLng + (endLng - startLng) * progress;
            
            animatedCar.setLatLng([currentLat, currentLng]);
            map.panTo([currentLat, currentLng], { animate: true, duration: 0.1 });

            // Atualiza barra de progresso
            if(progressBar) progressBar.style.width = `${progress * 100}%`;

            if (step >= totalSteps) {
                clearInterval(animationInterval);
                tripStatusLabel.textContent = "Você Chegou ao Destino!";
                playAudioTone(1200, 0.3);
                setTimeout(() => {
                    alert('🎉 Você chegou ao seu destino! Obrigado por viajar de forma 100% sustentável com a VerdeGO!.');
                    driverStatusCard.classList.add('hidden');
                    isTripActive = false;
                    requestRideBtn.textContent = `Confirmar ${selectedCategory.name} • ${selectedCategory.price}`;
                }, 1000);
            }
        }, 100);
    }

    cancelRideBtn.addEventListener('click', () => {
        if(animationInterval) clearInterval(animationInterval);
        isTripActive = false;
        driverStatusCard.classList.add('hidden');
        requestRideBtn.textContent = `Confirmar ${selectedCategory.name} • ${selectedCategory.price}`;
        playAudioTone(300, 0.2);
    });

    // 6. Modal Visualizador 360° do Veículo
    const car360Modal = document.getElementById('car360Modal');
    const openCar360Btn = document.getElementById('openCar360Btn');
    const closeCar360Modal = document.getElementById('closeCar360Modal');
    const closeCar360ModalBtn = document.getElementById('closeCar360ModalBtn');
    const modalCarTitle = document.getElementById('modalCarTitle');
    const modalExtImg = document.getElementById('modalExtImg');
    const modalIntImg = document.getElementById('modalIntImg');
    const modalBattery = document.getElementById('modalBattery');
    const modalSpec = document.getElementById('modalSpec');

    if(openCar360Btn && car360Modal) {
        openCar360Btn.addEventListener('click', () => {
            playAudioTone(750, 0.1);
            modalCarTitle.textContent = `Ficha Técnica - ${selectedCategory.model}`;
            modalExtImg.src = selectedCategory.img;
            modalIntImg.src = selectedCategory.interior;
            modalBattery.textContent = `${selectedCategory.battery} (${selectedCategory.autonomia})`;
            modalSpec.textContent = selectedCategory.spec;
            car360Modal.classList.remove('hidden');
        });

        const hide360 = () => car360Modal.classList.add('hidden');
        closeCar360Modal.addEventListener('click', hide360);
        closeCar360ModalBtn.addEventListener('click', hide360);
    }

    // 7. Compartilhar Rota & Perfil B2B
    const shareTripBtn = document.getElementById('shareTripBtn');
    if(shareTripBtn) {
        shareTripBtn.addEventListener('click', () => {
            playAudioTone(850, 0.1);
            navigator.clipboard.writeText(window.location.href);
            alert('🔗 Link de acompanhamento da rota copiado para a área de transferência! Envie para sua família.');
        });
    }

    const btnProfilePersonal = document.getElementById('btnProfilePersonal');
    const btnProfileB2B = document.getElementById('btnProfileB2B');

    if(btnProfilePersonal && btnProfileB2B) {
        btnProfileB2B.addEventListener('click', () => {
            playAudioTone(700, 0.1);
            btnProfileB2B.classList.add('bg-emerald-500', 'text-space-900');
            btnProfileB2B.classList.remove('text-slate-400');
            btnProfilePersonal.classList.remove('bg-emerald-500', 'text-space-900');
            btnProfilePersonal.classList.add('text-slate-400');
            alert('💼 Modo Corporativo Ativado: Faturamento automático via VerdeGO Business com emissão de relatório de sustentabilidade ESG.');
        });
        btnProfilePersonal.addEventListener('click', () => {
            playAudioTone(400, 0.1);
            btnProfilePersonal.classList.add('bg-emerald-500', 'text-space-900');
            btnProfilePersonal.classList.remove('text-slate-400');
            btnProfileB2B.classList.remove('bg-emerald-500', 'text-space-900');
            btnProfileB2B.classList.add('text-slate-400');
        });
    }

    // 8. Chat Humano Interativo
    const supportModal = document.getElementById('supportModal');
    const openSupportBtn = document.getElementById('openSupportBtn');
    const closeSupportModal = document.getElementById('closeSupportModal');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatHistory = document.getElementById('chatHistory');

    if(openSupportBtn) openSupportBtn.addEventListener('click', () => supportModal.classList.remove('hidden'));
    if(closeSupportModal) closeSupportModal.addEventListener('click', () => supportModal.classList.add('hidden'));

    if(chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if(!text) return;

            const uMsg = document.createElement('div');
            uMsg.className = "bg-space-800 border border-slate-700 p-2.5 rounded-xl text-right text-slate-100";
            uMsg.textContent = text;
            chatHistory.appendChild(uMsg);

            chatInput.value = '';
            chatHistory.scrollTop = chatHistory.scrollHeight;

            setTimeout(() => {
                playAudioTone(1000, 0.1);
                const aMsg = document.createElement('div');
                aMsg.className = "bg-emerald-950/60 border border-emerald-500/30 p-2.5 rounded-xl text-slate-200";
                aMsg.innerHTML = `<span class="text-emerald-400 font-bold block mb-0.5">Atendente Gabriel</span>"Perfeito! Estou acompanhando sua chamada com suporte ADAS e telemetria ao vivo."`;
                chatHistory.appendChild(aMsg);
                chatHistory.scrollTop = chatHistory.scrollHeight;
            }, 1000);
        });
    }

    // 9. Modo Acessibilidade Simples
    const toggleSimpleModeBtn = document.getElementById('toggleSimpleMode');
    if(toggleSimpleModeBtn) {
        toggleSimpleModeBtn.addEventListener('click', () => document.body.classList.toggle('modo-simples'));
    }
});
