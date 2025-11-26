// Animaciones generales
const animateOnScroll = () => {
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Animar elementos
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });
};

// Scroll suave hasta la sección de precios
function scrollToPlans() {
    const pricingSection = document.querySelector('.pricing');
    if (pricingSection) {
        pricingSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Animaciones de carga inicial
document.addEventListener('DOMContentLoaded', () => {
    // Animación de scroll
    const backToTopButton = document.querySelector('.back-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Animación del logo
    const logo = document.querySelector('.logo img');
    if (logo) {
        logo.style.opacity = '0';
        logo.style.transform = 'scale(0.8)';
        setTimeout(() => {
            logo.style.opacity = '1';
            logo.style.transform = 'scale(1)';
        }, 100);
    }

    // Animación de texto en hero
    const heroText = document.querySelector('.hero-content');
    if (heroText) {
        heroText.style.opacity = '0';
        heroText.style.transform = 'translateY(50px)';
        setTimeout(() => {
            heroText.style.opacity = '1';
            heroText.style.transform = 'translateY(0)';
        }, 300);
    }

    // Animación de botones
    const buttons = document.querySelectorAll('.hero-buttons button');
    buttons.forEach((button, index) => {
        button.style.opacity = '0';
        button.style.transform = 'translateY(50px)';
        setTimeout(() => {
            button.style.opacity = '1';
            button.style.transform = 'translateY(0)';
        }, 500 + (index * 200));
    });
});

// Animaciones de scroll
document.addEventListener('scroll', () => {
    // Animación de secciones
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (sectionTop < windowHeight * 0.8) {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }
    });
});

// Animaciones de interacción
const addHoverAnimations = () => {
    // Animación de botones
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.05) rotate(2deg)';
            button.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = 'none';
        });
    });

    // Animación de imágenes
    const images = document.querySelectorAll('.diagram-image, .api-image, .plans-image, .trust-image');
    images.forEach(image => {
        image.addEventListener('mouseenter', () => {
            image.style.transform = 'scale(1.05) rotate(2deg)';
            image.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
        });
        image.addEventListener('mouseleave', () => {
            image.style.transform = 'scale(1)';
            image.style.boxShadow = 'none';
        });
    });
};

// Formulario de contacto
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Animación de envío
        const submitButton = contactForm.querySelector('button[type="submit"]');
        submitButton.style.transform = 'scale(0.9)';
        submitButton.style.opacity = '0.7';
        setTimeout(() => {
            submitButton.style.transform = 'scale(1)';
            submitButton.style.opacity = '1';
            // Aquí irá la lógica para enviar el formulario
            alert('Formulario enviado con éxito!');
            contactForm.reset();
        }, 500);
    });
}

// Inicializar todas las animaciones
animateOnScroll();
addHoverAnimations();
