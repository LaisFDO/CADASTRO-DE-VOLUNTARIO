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
            }});
        }
    }
}

// Animações
window.addEventListener("DOMContentLoaded", () => {
    
    // Animar Hero Inicial
    const tl = gsap.timeline();
    tl.fromTo(".hero-bg", {scale: 1.2}, {scale: 1, duration: 2, ease: "power2.out"})
      .fromTo(".hero-title", {y: 40, opacity: 0}, {y: 0, opacity: 1, duration: 1, ease: "power3.out"}, "-=1.5")
      .fromTo(".hero-subtitle", {y: 20, opacity: 0}, {y: 0, opacity: 1, duration: 0.8}, "-=1")
      .fromTo(".cta-button", {y: 20, opacity: 0}, {y: 0, opacity: 1, duration: 0.8}, "-=0.8");

    // Click CTA Button - Scroll To Form
    document.getElementById("ctaBtn").addEventListener("click", () => {
        lenis.scrollTo("#formSection", {offset: -50});
    });

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
    const formInputs = document.querySelectorAll('#volunteerForm input[required], #volunteerForm select[required], #volunteerForm textarea[required]');
    const totalRequired = formInputs.length;
    
    function monitorProgress() {
        let filled = 0;
        document.querySelectorAll('#volunteerForm input[required], #volunteerForm select[required], #volunteerForm textarea[required]').forEach(input => {
            if(input.type === 'radio' || input.type === 'checkbox') {
                const name = input.name;
                if(document.querySelector(`input[name="${name}"]:checked`)) {
                    filled++;
                }
            } else if (input.value.trim() !== '') {
                filled++;
            }
        });
        
        // Tratar grupos de radio botões e contagem (simplificação rápida)
        // Isso apenas dá feedback visual se o formulário parece estar preenchido
        const completionText = document.getElementById("completionText");
        if(filled > 15) { 
            completionText.textContent = "Quase lá, revise seus dados.";
            completionText.style.color = "var(--primary-blue)";
        } else {
            completionText.textContent = "Preencha os campos para concluir";
            completionText.style.color = "var(--text-secondary)";
        }
    }
    
    document.getElementById('volunteerForm').addEventListener('change', monitorProgress);
    document.getElementById('volunteerForm').addEventListener('keyup', monitorProgress);

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
