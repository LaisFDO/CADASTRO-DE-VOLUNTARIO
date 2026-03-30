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
function toggleBloodType(isDonor) {
    const container = document.getElementById('bloodTypeContainer');
    const select = document.getElementById('tipo_sanguineo');
    if (isDonor) {
        container.style.display = 'block';
        select.required = true;
        gsap.fromTo(container, {height: 0, opacity: 0}, {height: 'auto', opacity: 1, duration: 0.3});
    } else {
        gsap.to(container, {height: 0, opacity: 0, duration: 0.3, onComplete: () => {
            container.style.display = 'none';
            select.required = false;
            select.value = "";
        }});
    }
}

function toggleCNH(hasCNH) {
    const container = document.getElementById('cnhContainer');
    const cat = document.getElementById('categoria_cnh');
    const num = document.getElementById('numero_cnh');
    
    if (hasCNH) {
        container.style.display = 'grid';
        cat.required = true;
        num.required = true;
        gsap.fromTo(container, {height: 0, opacity: 0}, {height: 'auto', opacity: 1, duration: 0.3});
    } else {
        gsap.to(container, {height: 0, opacity: 0, duration: 0.3, onComplete: () => {
            container.style.display = 'none';
            cat.required = false;
            num.required = false;
            cat.value = "";
            num.value = "";
        }});
    }
}

function toggleFormacaoExtra(value) {
    const container = document.getElementById('formacaoEspecificaContainer');
    const input = document.getElementById('formacao_especifica');
    if (value === 'outros') {
        container.style.display = 'block';
        input.required = true;
        gsap.fromTo(container, {height: 0, opacity: 0}, {height: 'auto', opacity: 1, duration: 0.3});
    } else {
        if(container.style.display === 'block') {
            gsap.to(container, {height: 0, opacity: 0, duration: 0.3, onComplete: () => {
                container.style.display = 'none';
                input.required = false;
                input.value = '';
            }});
        }
    }
}

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
