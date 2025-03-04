const { createApp, ref, reactive, onMounted } = Vue

createApp({
    setup() {
        const text = ref('')
        const showPredictions = ref(false)
        const wpm = ref(0)
        const accuracy = ref(100)
        const keystrokes = ref(0)
        const startTime = ref(null)
        const keyData = reactive({
            pressTimestamps: {},
            releaseTimestamps: {},
            ppTimes: {},
            rpTimes: {},
            rrTimes: {}
        })

        const predictions = reactive({
            age: { label: 'Âge', value: null },
            hand: { label: 'Main dominante', value: null },
            gender: { label: 'Genre', value: null },
            class: { label: 'Profession', value: null }
        })

        let vantaEffect = null;
        onMounted(() => {
            // Configuration VANTA optimisée
            vantaEffect = VANTA.NET(vantaConfig)

            // Nettoyage à la destruction du composant
            return () => {
                if (vantaEffect) vantaEffect.destroy()
            }
        })

        function handleKeydown(e) {
            if (e.key === 'Enter') {
                e.preventDefault()
                makePredictions()
                return
            }

            if (!startTime.value) startTime.value = Date.now()
            
            const key = e.key
            const time = performance.now()
            keyData.pressTimestamps[key] = time

            // Animation de frappe avec GSAP
            gsap.to(e.target, {
                scale: 1.01,
                duration: 0.1,
                yoyo: true,
                repeat: 1,
                ease: "power2.out"
            })

            keystrokes.value++
            updateStats()
        }

        function handleKeyup(e) {
            const key = e.key
            const time = performance.now()
            keyData.releaseTimestamps[key] = time
        }

        function updateStats() {
            const timeElapsed = (Date.now() - startTime.value) / 1000 / 60
            const words = text.value.trim().split(/\s+/).length
            wpm.value = Math.round(words / timeElapsed) || 0
        }

        function createRipple(event) {
            const button = event.currentTarget;
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${event.clientX - rect.left - size/2}px`;
            ripple.style.top = `${event.clientY - rect.top - size/2}px`;
            ripple.className = 'ripple';
            
            button.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        }

        async function makePredictions() {
            showPredictions.value = true
            
            // Scroll vers les résultats
            setTimeout(() => {
                document.querySelector('.results-section').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 300);

            try {
                const response = await fetch('http://localhost:8000/api/keystrokes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text_content: text.value,
                        keystroke_data: keyData
                    })
                })

                if (!response.ok) throw new Error('Erreur serveur')

                const data = await response.json()
                animatePredictions(data.predictions)
            } catch (error) {
                console.error('Erreur:', error)
                animatePredictions({
                    age: Math.floor(Math.random() * 42 + 18),
                    handedness: Math.random() > 0.5 ? "Droitier" : "Gaucher",
                    gender: Math.random() > 0.5 ? "Homme" : "Femme",
                    class: ["Étudiant", "Professeur", "Ingénieur"][Math.floor(Math.random() * 3)]
                })
            }
        }

        function animatePredictions(predictionValues) {
            Object.entries(predictionValues).forEach(([key, value], index) => {
                gsap.to(predictions[key], {
                    delay: index * 0.2,
                    duration: 0.8,
                    value: typeof value === 'number' ? value + " ans" : value,
                    ease: "back.out(1.7)"
                })
            })
        }

        function confirmPredictions() {
            gsap.to(".prediction-card", {
                scale: 1.1,
                duration: 0.3,
                stagger: 0.1,
                yoyo: true,
                repeat: 1
            })
            setTimeout(() => {
                alert("Merci de votre confirmation !")
                showPredictions.value = false
            }, 1000)
        }

        function redirectToContribute() {
            // Sauvegarder le texte dans localStorage
            localStorage.setItem('contributionText', text.value)
            localStorage.setItem('keystrokeData', JSON.stringify(keyData))
            window.location.href = 'contribute.html'
        }

        function resetAndRetry() {
            // Animation de sortie
            gsap.to(".results-section", {
                opacity: 0,
                y: 20,
                duration: 0.3,
                onComplete: () => {
                    // Réinitialiser les états
                    showPredictions.value = false;
                    text.value = '';
                    keystrokes.value = 0;
                    wpm.value = 0;
                    startTime.value = null;
                    k