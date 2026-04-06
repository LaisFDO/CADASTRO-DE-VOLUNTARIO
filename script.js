// Início - Inicialização do Lenis e GSAP
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Registrar plugin GSAP
gsap.registerPlugin(ScrollTrigger);

// Máscaras e Validações simples
const cpfInput = document.getElementById('cpf');
cpfInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    // Máscara 000.000.000-00
    if (value.length > 9) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (value.length > 3) {
        value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    e.target.value = value;
});

// Condicionais do formulário


function toggleCNH(hasCNH) {
    const container = document.getElementById('cnhContainer');
    if (!container) return;
    
    if (hasCNH) {
        container.style.display = 'block';
        gsap.fromTo(container, {height: 0, opacity: 0}, {height: 'auto', opacity: 1, duration: 0.3});
    } else {
        gsap.to(container, {height: 0, opacity: 0, duration: 0.3, onComplete: () => {
            container.style.display = 'none';
            // Limpa todos os checkboxes no fechamento
            const checks = container.querySelectorAll('.hab-checkbox');
            checks.forEach(c => c.checked = false);
            // Chama a função para esconder e zerar as sub-condicionais
            toggleHabilitacaoFields();
        }});
    }
}

function toggleHabilitacaoFields() {
    const container = document.getElementById('cnhContainer');
    if (!container) return;
    
    const hasCNHChecked = container.querySelectorAll('input[data-cnh="true"]:checked').length > 0;
    const hasOutroChecked = container.querySelectorAll('input[data-outro="true"]:checked').length > 0;
    
    // Conditional 1: Número da CNH
    const numContainer = document.getElementById('numero_cnh_container');
    const numInput = document.getElementById('numero_cnh');
    if (hasCNHChecked && numContainer.style.display === 'none') {
        numContainer.style.display = 'block';
        numInput.required = true;
        gsap.fromTo(numContainer, {opacity: 0, y: -10}, {opacity: 1, y: 0, duration: 0.3, ease: 'power2.out'});
    } else if (!hasCNHChecked && numContainer.style.display !== 'none') {
        gsap.to(numContainer, {opacity: 0, y: -10, duration: 0.2, ease: 'power2.in', onComplete: () => {
            numContainer.style.display = 'none';
            numInput.required = false;
            numInput.value = '';
        }});
    }
    
    // Conditional 2: Especifique a habilitação
    const espContainer = document.getElementById('categoria_cnh_esp_container');
    const espInput = document.getElementById('categoria_cnh_especifico');
    if (hasOutroChecked && espContainer.style.display === 'none') {
        espContainer.style.display = 'block';
        espInput.required = true;
        gsap.fromTo(espContainer, {opacity: 0, y: -10}, {opacity: 1, y: 0, duration: 0.3, ease: 'power2.out'});
    } else if (!hasOutroChecked && espContainer.style.display !== 'none') {
        gsap.to(espContainer, {opacity: 0, y: -10, duration: 0.2, ease: 'power2.in', onComplete: () => {
            espContainer.style.display = 'none';
            espInput.required = false;
            espInput.value = '';
        }});
    }
}

// Lógica de dependência da CNH (B requerida para C, D, E)
function enforceCNHDependencies(targetCheckbox) {
    if (targetCheckbox.name !== 'hab_terrestre') return;

    const val = targetCheckbox.value;
    const isChecked = targetCheckbox.checked;
    const container = document.getElementById('cnhContainer');
    if (!container) return;

    const bCheckbox = container.querySelector('input[name="hab_terrestre"][value="B"]');
    const advancedCats = ['C', 'D', 'E'];
    const msgBox = document.getElementById('cnh-helper-msg');
    
    if (!bCheckbox) return;

    // Regra 1: Ao selecionar C, D ou E, marca automaticamente a B
    if (isChecked && advancedCats.includes(val)) {
        if (!bCheckbox.checked) {
            bCheckbox.checked = true;
            // Exibir feedback visual discreto
            if (msgBox) {
                msgBox.style.display = 'block';
                gsap.fromTo(msgBox, {opacity: 0, y: -5}, {opacity: 1, y: 0, duration: 0.4});
                
                // Opcional: esconder a mensagem após alguns segundos para limpar a interface
                setTimeout(() => {
                    if (msgBox.style.display === 'block') {
                        gsap.to(msgBox, {opacity: 0, duration: 0.4, onComplete: () => { msgBox.style.display = 'none'; }});
                    }
                }, 5000);
            }
        }
    }

    // Regra 2: Ao desmarcar B, desmarca automaticamente C, D e E
    if (!isChecked && val === 'B') {
        advancedCats.forEach(cat => {
            const catCheckbox = container.querySelector(`input[name="hab_terrestre"][value="${cat}"]`);
            if (catCheckbox && catCheckbox.checked) {
                catCheckbox.checked = false;
            }
        });
        
        if (msgBox && msgBox.style.display !== 'none') {
            msgBox.style.display = 'none';
        }
    }
}

// Escuta mudanças nos checkboxes dinâmicos de Habilitação
document.addEventListener('change', function(e) {
    if (e.target && e.target.classList.contains('hab-checkbox')) {
        enforceCNHDependencies(e.target);
        toggleHabilitacaoFields();
    }
});



function toggleOutrosInput(selectElement, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const input = container.querySelector('input');
    const value = selectElement.value.toLowerCase();
    
    if (value === 'outros' || value === 'outro') {
        container.style.display = 'block';
        input.required = true;
        gsap.fromTo(container, {height: 0, opacity: 0, y: -10}, {height: 'auto', opacity: 1, y: 0, duration: 0.3, ease: 'power2.out'});
    } else {
        if(container.style.display === 'block') {
            gsap.to(container, {height: 0, opacity: 0, y: -10, duration: 0.3, ease: 'power2.in', onComplete: () => {
                container.style.display = 'none';
                input.required = false;
                input.value = '';
                // trigger change to valid progress
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }});
        }
    }
}

function toggleOutrosCheckboxPj(checkboxElement, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const input = container.querySelector('input');
    
    if (checkboxElement.checked) {
        container.style.display = 'block';
        input.required = true;
        gsap.fromTo(container, {height: 0, opacity: 0, y: -10}, {height: 'auto', opacity: 1, y: 0, duration: 0.3, ease: 'power2.out'});
    } else {
        if(container.style.display === 'block') {
            gsap.to(container, {height: 0, opacity: 0, y: -10, duration: 0.3, ease: 'power2.in', onComplete: () => {
                container.style.display = 'none';
                input.required = false;
                input.value = '';
                // trigger change to valid progress
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }});
        }
    }
}

let currentMode = 'pf'; // 'pf' or 'pj'

// Animações
window.addEventListener("DOMContentLoaded", () => {
    
    // Animar Hero Inicial
    const tl = gsap.timeline();
    tl.fromTo(".hero-bg", {scale: 1.2}, {scale: 1, duration: 2, ease: "power2.out"})
      .fromTo(".hero-title", {y: 40, opacity: 0}, {y: 0, opacity: 1, duration: 1, ease: "power3.out"}, "-=1.5")
      .fromTo(".hero-subtitle", {y: 20, opacity: 0}, {y: 0, opacity: 1, duration: 0.8}, "-=1")
      .fromTo(".cta-button", {y: 20, opacity: 0}, {y: 0, opacity: 1, duration: 0.8}, "-=0.8");

    // Switching logic PF / PJ
    function switchFormTo(mode) {
        if (mode === currentMode) {
            lenis.scrollTo("#formSection", {offset: -50});
            return;
        }
        
        const oldForm = document.getElementById(currentMode === 'pf' ? 'volunteerForm' : 'organizationForm');
        const newForm = document.getElementById(mode === 'pf' ? 'volunteerForm' : 'organizationForm');
        const dynamicTitle = document.getElementById('dynamicHeroSubtitle');
        const pageTitle = document.getElementById('pageTitle');
        
        currentMode = mode;

        if (mode === 'pf') {
            dynamicTitle.innerHTML = 'seja um voluntário.';
            pageTitle.innerText = 'Cadastro de Voluntários - Defesa Civil do Amazonas';
            document.getElementById('submitBtn').setAttribute('form', 'volunteerForm');
        } else {
            dynamicTitle.innerHTML = 'seja uma organização parceira.';
            pageTitle.innerText = 'Cadastro de Organização Parceira - Defesa Civil do Amazonas';
            document.getElementById('submitBtn').setAttribute('form', 'organizationForm');
        }

        gsap.to(oldForm, {opacity: 0, duration: 0.3, onComplete: () => {
            oldForm.style.display = 'none';
            oldForm.style.pointerEvents = 'none';
            oldForm.style.position = 'absolute';
            
            newForm.style.display = 'flex';
            newForm.style.position = 'relative';
            newForm.style.pointerEvents = 'auto';
            
            gsap.fromTo(newForm, {opacity: 0, y: 30}, {opacity: 1, y: 0, duration: 0.5, ease: "power2.out", onComplete: () => {
                ScrollTrigger.refresh();
            }});
        }});
        
        monitorProgress();
        lenis.scrollTo("#formSection", {offset: -50});
    }

    document.getElementById("btnPF").addEventListener("click", () => switchFormTo('pf'));
    document.getElementById("btnPJ").addEventListener("click", () => switchFormTo('pj'));

    // Efeito Parallax Background
    gsap.to(".hero-bg", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });

    // Navbar functionality moved to hero logo

    // Mostrar Bottom Bar ao chegar no formulário
    ScrollTrigger.create({
        trigger: "#formSection",
        start: "top center",
        onEnter: () => document.querySelector(".fixed-bottom-bar").classList.add("visible"),
        onLeaveBack: () => document.querySelector(".fixed-bottom-bar").classList.remove("visible")
    });

    // Fade in nos Cards
    const cards = gsap.utils.toArray('.form-card');
    cards.forEach((card, i) => {
        gsap.to(card, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: card,
                start: "top 85%",
            }
        });
    });

    // Barra de progresso de scroll da página
    gsap.to("#progressBar", {
        width: "100%",
        ease: "none",
        scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.3
        }
    });

    // Monitorar preenchimento para texto da barra inferior
    function monitorProgress() {
        let filled = 0;
        const activeFormId = currentMode === 'pf' ? '#volunteerForm' : '#organizationForm';
        const selectors = `${activeFormId} input[required], ${activeFormId} select[required], ${activeFormId} textarea[required]`;
        const inputs = document.querySelectorAll(selectors);
        
        inputs.forEach(input => {
            if(input.type === 'radio' || input.type === 'checkbox') {
                const name = input.name;
                if(document.querySelector(`${activeFormId} input[name="${name}"]:checked`)) {
                    filled++;
                }
            } else if (input.value.trim() !== '') {
                filled++;
            }
        });
        
        const completionText = document.getElementById("completionText");
        
        if(inputs.length > 0 && filled >= Math.floor(inputs.length * 0.8)) { 
            completionText.textContent = "Quase lá, revise seus dados.";
            completionText.style.color = "var(--primary-blue)";
        } else {
            completionText.textContent = "Preencha os campos para concluir";
            completionText.style.color = "var(--text-secondary)";
        }

        // LGPD State and visual button logic
        const lgpdCb = document.querySelector(`${activeFormId} input[name="lgpd_consent"]`);
        const btn = document.getElementById('submitBtn');
        if (lgpdCb && btn) {
            if (lgpdCb.checked) {
                btn.classList.remove('visually-disabled');
                lgpdCb.setCustomValidity('');
            } else {
                btn.classList.add('visually-disabled');
                lgpdCb.setCustomValidity('Você precisa concordar com o Termo de Consentimento para continuar.');
            }
        }
    }
    
    document.getElementById('volunteerForm').addEventListener('change', monitorProgress);
    document.getElementById('volunteerForm').addEventListener('keyup', monitorProgress);
    document.getElementById('organizationForm').addEventListener('change', monitorProgress);
    document.getElementById('organizationForm').addEventListener('keyup', monitorProgress);
    
    // Initial validation call
    monitorProgress();

    // LGPD Modal Logic
    const lgpdModal = document.getElementById('lgpdModal');
    const closeLgpdBtn = document.getElementById('closeLgpdBtn');
    const lgpdTriggers = document.querySelectorAll('.lgpd-trigger');
    let lastActiveElement = null;

    function openLgpdModal(triggerElement) {
        lastActiveElement = triggerElement;
        lgpdModal.classList.add('active');
        lgpdModal.setAttribute('aria-hidden', 'false');
        triggerElement.setAttribute('aria-expanded', 'true');
        
        if (typeof lenis !== 'undefined') lenis.stop();
        setTimeout(() => closeLgpdBtn.focus(), 50);
    }

    function closeLgpdModal() {
        if (!lgpdModal.classList.contains('active')) return;
        
        lgpdModal.classList.remove('active');
        lgpdModal.setAttribute('aria-hidden', 'true');
        
        if (lastActiveElement) {
            lastActiveElement.setAttribute('aria-expanded', 'false');
            lastActiveElement.focus();
        }
        
        if (typeof lenis !== 'undefined') lenis.start();
    }

    lgpdTriggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openLgpdModal(btn);
        });
    });

    if (closeLgpdBtn) {
        closeLgpdBtn.addEventListener('click', closeLgpdModal);
    }

    if (lgpdModal) {
        lgpdModal.addEventListener('click', (e) => {
            if (e.target === lgpdModal) {
                closeLgpdModal();
            }
        });

        lgpdModal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusableElements = lgpdModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lgpdModal && lgpdModal.classList.contains('active')) {
            closeLgpdModal();
        }
    });

    // Photo Upload Logic
    const photoInput = document.getElementById('volunteerPhoto');
    const photoPreviewImg = document.getElementById('photoPreviewImg');
    const photoPlaceholder = document.getElementById('photoPlaceholder');
    const photoUploadActions = document.getElementById('photoUploadActions');
    const photoErrorMsg = document.getElementById('photoErrorMsg');
    const photoUploadContainer = document.getElementById('photoUploadContainer');
    const btnChangePhoto = document.getElementById('btnChangePhoto');
    const btnRemovePhoto = document.getElementById('btnRemovePhoto');

    if (photoInput) {
        photoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            handleFile(file);
        });

        function handleFile(file) {
            photoErrorMsg.style.display = 'none';
            photoUploadContainer.classList.remove('has-error');

            if (!file) {
                resetPhoto();
                return;
            }

            const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                showPhotoError('Por favor, selecione uma imagem válida (JPG, PNG).');
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                showPhotoError('A imagem deve ter no máximo 2MB.');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                photoPreviewImg.src = event.target.result;
                photoPreviewImg.style.display = 'block';
                photoPlaceholder.style.display = 'none';
                
                void photoPreviewImg.offsetWidth; // force reflow
                photoPreviewImg.classList.add('loaded');
                
                photoUploadActions.style.display = 'flex';
                photoInput.style.display = 'none'; // hide to allow button clicks
                photoInput.removeAttribute('required'); // It's filled
                if (currentMode === 'pf') monitorProgress();
            };
            reader.readAsDataURL(file);
        }

        function showPhotoError(msg) {
            photoErrorMsg.textContent = msg;
            photoErrorMsg.style.display = 'block';
            photoUploadContainer.classList.add('has-error');
            resetPhoto();
        }

        function resetPhoto() {
            photoInput.value = '';
            photoPreviewImg.src = '';
            photoPreviewImg.style.display = 'none';
            photoPreviewImg.classList.remove('loaded');
            photoPlaceholder.style.display = 'flex';
            photoUploadActions.style.display = 'none';
            photoInput.style.display = 'block';
            photoInput.setAttribute('required', 'true');
            if (currentMode === 'pf') monitorProgress();
        }

        if (btnRemovePhoto) btnRemovePhoto.addEventListener('click', resetPhoto);
        
        if (btnChangePhoto) {
            btnChangePhoto.addEventListener('click', () => {
                photoInput.style.display = 'block';
                photoInput.click();
                photoInput.style.display = 'none';
            });
        }

        // Drag and Drop
        photoUploadContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            const wrapper = photoUploadContainer.querySelector('.photo-preview-wrapper');
            if(wrapper) {
                wrapper.style.borderColor = 'var(--primary-blue)';
                wrapper.style.background = 'rgba(30, 58, 138, 0.05)';
            }
        });

        photoUploadContainer.addEventListener('dragleave', (e) => {
            e.preventDefault();
            const wrapper = photoUploadContainer.querySelector('.photo-preview-wrapper');
            if(wrapper) {
                wrapper.style.borderColor = '';
                wrapper.style.background = '';
            }
        });

        photoUploadContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            const wrapper = photoUploadContainer.querySelector('.photo-preview-wrapper');
            if(wrapper) {
                wrapper.style.borderColor = '';
                wrapper.style.background = '';
            }
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                photoInput.files = e.dataTransfer.files;
                handleFile(e.dataTransfer.files[0]);
            }
        });
    }

    // --- COMBOBOX PROFISSAO JS ---
    const profInput = document.getElementById("profissao-input");
    const profListbox = document.getElementById("profissao-listbox");
    const profToggleBtn = document.querySelector(".combobox-toggle");
    const profContainer = document.querySelector(".profession-combobox");
    const profOutraGroup = document.getElementById("profissao-outra-group");
    const profOutraInput = document.getElementById("profissao-outra");
    
    if (profInput && profListbox) {
        let profissoesData = [];
        let isProfOpen = false;
        let profActiveIndex = -1;
        let profFilteredOptions = [];

        // Load Data
        fetch("profissoes.json")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) profissoesData = data;
            })
            .catch(err => console.error("Erro ao carregar profissoes.json", err));

        function normalizeText(text) {
            return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        }

        function renderProfOptions(options) {
            profListbox.innerHTML = '';
            if (options.length === 0) {
                const li = document.createElement("li");
                li.className = "no-results";
                li.textContent = "Nenhuma profissão encontrada";
                profListbox.appendChild(li);
            } else {
                options.forEach((opt, index) => {
                    const li = document.createElement("li");
                    li.setAttribute("role", "option");
                    li.setAttribute("id", `prof-opt-${index}`);
                    li.textContent = opt;
                    li.addEventListener("mousedown", (e) => {
                        e.preventDefault(); // Prevents input blur
                        selectProfOption(opt);
                    });
                    profListbox.appendChild(li);
                });
            }
        }

        function filterProfOptions(query) {
            const normQuery = normalizeText(query);
            let startsWith = [];
            let contains = [];

            profissoesData.forEach(prof => {
                const normProf = normalizeText(prof);
                if (normProf.startsWith(normQuery)) {
                    startsWith.push(prof);
                } else if (normProf.includes(normQuery)) {
                    contains.push(prof);
                }
            });
            
            let results = [...startsWith, ...contains];
            if (!results.includes("Outra")) {
                results.push("Outra");
            }
            
            profFilteredOptions = results;
            renderProfOptions(profFilteredOptions);
            profActiveIndex = -1;
        }

        function openProfDropdown() {
            isProfOpen = true;
            profListbox.style.display = "block";
            profInput.setAttribute("aria-expanded", "true");
            filterProfOptions(profInput.value);
            const card = profContainer.closest('.form-card');
            if (card) card.style.zIndex = "999";
        }

        function closeProfDropdown() {
            isProfOpen = false;
            profListbox.style.display = "none";
            profInput.setAttribute("aria-expanded", "false");
            profInput.removeAttribute("aria-activedescendant");
            profActiveIndex = -1;
            const card = profContainer.closest('.form-card');
            if (card) card.style.zIndex = "";
        }

        function selectProfOption(value) {
            profInput.value = value;
            profInput.dispatchEvent(new Event('change')); // trigger monitorProgress
            closeProfDropdown();
            handleProfOutraLogic(value);
        }

        function handleProfOutraLogic(value) {
            if (value === "Outra") {
                profOutraGroup.style.display = "block";
                profOutraInput.required = true;
                gsap.fromTo(profOutraGroup, {height: 0, opacity: 0}, {height: 'auto', opacity: 1, duration: 0.3});
            } else {
                if(profOutraGroup.style.display === "block") {
                    gsap.to(profOutraGroup, {height: 0, opacity: 0, duration: 0.3, onComplete: () => {
                        profOutraGroup.style.display = "none";
                        profOutraInput.required = false;
                        profOutraInput.value = '';
                        profOutraInput.dispatchEvent(new Event('change'));
                    }});
                }
            }
        }

        profInput.addEventListener("input", () => {
            openProfDropdown();
        });

        profInput.addEventListener("focus", () => {
            openProfDropdown();
        });

        profInput.addEventListener("blur", () => {
            const val = profInput.value.trim();
            if (val !== "") {
                const exactMatch = profissoesData.find(p => p.toLowerCase() === val.toLowerCase());
                if (exactMatch) {
                    profInput.value = exactMatch;
                    handleProfOutraLogic(exactMatch);
                } else if (val.toLowerCase() === "outra") {
                    profInput.value = "Outra";
                    handleProfOutraLogic("Outra");
                } else {
                    profInput.value = ""; 
                    handleProfOutraLogic("");
                }
                profInput.dispatchEvent(new Event('change'));
            } else {
                handleProfOutraLogic("");
            }
        });

        profToggleBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (isProfOpen) {
                closeProfDropdown();
            } else {
                profInput.focus();
                openProfDropdown();
            }
        });

        document.addEventListener("click", (e) => {
            if (!profContainer.contains(e.target)) {
                closeProfDropdown();
            }
        });

        profInput.addEventListener("keydown", (e) => {
            if (!isProfOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
                openProfDropdown();
                e.preventDefault();
                return;
            }

            if (!isProfOpen) return;

            const items = profListbox.querySelectorAll("li:not(.no-results)");
            if (items.length === 0) return;

            if (e.key === "ArrowDown") {
                e.preventDefault();
                profActiveIndex = (profActiveIndex + 1) % items.length;
                updateProfActiveItem(items);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                profActiveIndex = (profActiveIndex - 1 + items.length) % items.length;
                updateProfActiveItem(items);
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (profActiveIndex >= 0) {
                    selectProfOption(profFilteredOptions[profActiveIndex]);
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                closeProfDropdown();
            } else if (e.key === "Tab") {
                closeProfDropdown();
            }
        });

        function updateProfActiveItem(items) {
            items.forEach((item, index) => {
                if (index === profActiveIndex) {
                    item.setAttribute("aria-selected", "true");
                    profInput.setAttribute("aria-activedescendant", item.id);
                    item.scrollIntoView({ block: "nearest" });
                } else {
                    item.setAttribute("aria-selected", "false");
                    item.classList.remove("active");
                }
            });
        }
    }

    // --- COMBOBOX AREA ATUACAO (PJ) JS ---
    const atuacaoInput = document.getElementById("area_atuacao_pj");
    const atuacaoListbox = document.getElementById("atuacao-listbox");
    const atuacaoToggleBtn = document.querySelector(".atuacao-combobox .combobox-toggle");
    const atuacaoContainer = document.querySelector(".atuacao-combobox");
    const atuacaoOutraGroup = document.getElementById("area_atuacao_esp_container");
    const atuacaoOutraInput = document.getElementById("area_atuacao_especifica");
    
    if (atuacaoInput && atuacaoListbox) {
        let atuacoesData = [];
        let isAtuacaoOpen = false;
        let atuacaoActiveIndex = -1;
        let atuacaoFilteredOptions = [];

        // Fetch do JSON atuacao-cnae.json
        fetch("atuacao-cnae.json")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Normalization
                    atuacoesData = data.map(item => {
                        if (typeof item === "string") return item;
                        return item.label || item.descricao || item.value || item.codigo;
                    }).filter(Boolean);
                }
            })
            .catch(err => console.error("Erro ao carregar atuacao-cnae.json", err));

        function renderAtuacaoOptions(options) {
            atuacaoListbox.innerHTML = '';
            if (options.length === 0) {
                const li = document.createElement("li");
                li.className = "no-results";
                li.textContent = "Nenhuma área encontrada";
                atuacaoListbox.appendChild(li);
            } else {
                options.forEach((opt, index) => {
                    const li = document.createElement("li");
                    li.setAttribute("role", "option");
                    li.setAttribute("id", `atuacao-opt-${index}`);
                    li.textContent = opt;
                    li.addEventListener("mousedown", (e) => {
                        e.preventDefault(); 
                        selectAtuacaoOption(opt);
                    });
                    atuacaoListbox.appendChild(li);
                });
            }
        }

        function filterAtuacaoOptions(query) {
            const normQuery = normalizeText(query); // using existant normalizeText function from profissoes if available, but let's redefine locally for safety
            const localNormalizeText = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
            const q = localNormalizeText(query);

            let startsWith = [];
            let contains = [];

            atuacoesData.forEach(atuacao => {
                const normAtuacao = localNormalizeText(atuacao);
                if (normAtuacao.startsWith(q)) {
                    startsWith.push(atuacao);
                } else if (normAtuacao.includes(q)) {
                    contains.push(atuacao);
                }
            });
            
            let results = [...startsWith, ...contains];
            if (!results.includes("Outra")) {
                results.push("Outra");
            }
            
            atuacaoFilteredOptions = results;
            renderAtuacaoOptions(atuacaoFilteredOptions);
            atuacaoActiveIndex = -1;
        }

        function openAtuacaoDropdown() {
            isAtuacaoOpen = true;
            atuacaoListbox.style.display = "block";
            atuacaoInput.setAttribute("aria-expanded", "true");
            filterAtuacaoOptions(atuacaoInput.value);
            const card = atuacaoContainer.closest('.form-card');
            if (card) card.style.zIndex = "999";
        }

        function closeAtuacaoDropdown() {
            isAtuacaoOpen = false;
            atuacaoListbox.style.display = "none";
            atuacaoInput.setAttribute("aria-expanded", "false");
            atuacaoInput.removeAttribute("aria-activedescendant");
            atuacaoActiveIndex = -1;
            const card = atuacaoContainer.closest('.form-card');
            if (card) card.style.zIndex = "";
        }

        function selectAtuacaoOption(value) {
            atuacaoInput.value = value;
            atuacaoInput.dispatchEvent(new Event('change')); // trigger monitorProgress
            closeAtuacaoDropdown();
            handleAtuacaoOutraLogic(value);
        }

        function handleAtuacaoOutraLogic(value) {
            if (value === "Outra") {
                atuacaoOutraGroup.style.display = "block";
                atuacaoOutraInput.required = true;
                gsap.fromTo(atuacaoOutraGroup, {height: 0, opacity: 0}, {height: 'auto', opacity: 1, duration: 0.3});
            } else {
                if(atuacaoOutraGroup.style.display === "block") {
                    gsap.to(atuacaoOutraGroup, {height: 0, opacity: 0, duration: 0.3, onComplete: () => {
                        atuacaoOutraGroup.style.display = "none";
                        atuacaoOutraInput.required = false;
                        atuacaoOutraInput.value = '';
                    }});
                }
            }
        }

        atuacaoInput.addEventListener("input", () => {
            openAtuacaoDropdown();
        });

        atuacaoInput.addEventListener("focus", () => {
            openAtuacaoDropdown();
        });

        atuacaoInput.addEventListener("blur", () => {
            const val = atuacaoInput.value.trim();
            if (val !== "") {
                const exactMatch = atuacoesData.find(p => p.toLowerCase() === val.toLowerCase());
                if (exactMatch) {
                    atuacaoInput.value = exactMatch;
                    handleAtuacaoOutraLogic(exactMatch);
                } else if (val.toLowerCase() === "outra") {
                    atuacaoInput.value = "Outra";
                    handleAtuacaoOutraLogic("Outra");
                } else {
                    atuacaoInput.value = ""; 
                    handleAtuacaoOutraLogic("");
                }
                atuacaoInput.dispatchEvent(new Event('change'));
            } else {
                handleAtuacaoOutraLogic("");
            }
        });

        if (atuacaoToggleBtn) {
            atuacaoToggleBtn.addEventListener("click", (e) => {
                e.preventDefault();
                if (isAtuacaoOpen) {
                    closeAtuacaoDropdown();
                } else {
                    atuacaoInput.focus();
                    openAtuacaoDropdown();
                }
            });
        }

        document.addEventListener("click", (e) => {
            if (atuacaoContainer && !atuacaoContainer.contains(e.target)) {
                closeAtuacaoDropdown();
            }
        });

        atuacaoInput.addEventListener("keydown", (e) => {
            if (!isAtuacaoOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
                openAtuacaoDropdown();
                e.preventDefault();
                return;
            }

            if (!isAtuacaoOpen) return;

            const items = atuacaoListbox.querySelectorAll("li:not(.no-results)");
            if (items.length === 0) return;

            if (e.key === "ArrowDown") {
                e.preventDefault();
                atuacaoActiveIndex = (atuacaoActiveIndex + 1) % items.length;
                updateAtuacaoActiveItem(items);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                atuacaoActiveIndex = (atuacaoActiveIndex - 1 + items.length) % items.length;
                updateAtuacaoActiveItem(items);
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (atuacaoActiveIndex >= 0) {
                    selectAtuacaoOption(atuacaoFilteredOptions[atuacaoActiveIndex]);
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                closeAtuacaoDropdown();
            } else if (e.key === "Tab") {
                closeAtuacaoDropdown();
            }
        });

        function updateAtuacaoActiveItem(items) {
            items.forEach((item, index) => {
                if (index === atuacaoActiveIndex) {
                    item.setAttribute("aria-selected", "true");
                    atuacaoInput.setAttribute("aria-activedescendant", item.id);
                    item.scrollIntoView({ block: "nearest" });
                } else {
                    item.setAttribute("aria-selected", "false");
                    item.classList.remove("active");
                }
            });
        }
    }

});

// Submit Form (Simulation)
function submitForm() {
    const btn = document.getElementById('submitBtn');
    const loader = document.getElementById('btnLoader');
    
    // Disable btn and show loader
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '';
    loader.style.display = 'block';
    btn.appendChild(loader);

    // Simulating API Call
    setTimeout(() => {
        // Redirecionar para a página de sucesso
        window.location.href = "sucesso.html";
    }, 1500);
}
