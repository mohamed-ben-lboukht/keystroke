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

            // Get the textarea element
            const textarea = document.querySelector('textarea');
            if (textarea) {
                // Start recording when textarea is focused
                textarea.addEventListener('focus', () => {
                    console.log('Starting keystroke collection...');
                    keystrokeCollector.start();
                });

                // Stop recording when textarea is blurred
                textarea.addEventListener('blur', () => {
                    console.log('Stopping keystroke collection...');
                    keystrokeCollector.stop();
                });
            }

            // Nettoyage à la destruction du composant
            return () => {
                if (vantaEffect) vantaEffect.destroy()
            }
        })

        // Initialize keystroke collector and processor
        const keystrokeCollector = new KeystrokeCollector();
        const keystrokeProcessor = new KeystrokeProcessor(true); // Enable debug mode

        function handleKeydown(e) {
            if (!startTime.value) startTime.value = Date.now()
            
            if (e.key === 'Enter') {
                e.preventDefault()
                console.log('Enter key pressed, making predictions...');
                makePredictions()
                return
            }

            // Process keystroke data
            keystrokeCollector.handleKeyDown(e);

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
            // Process keystroke data
            keystrokeCollector.handleKeyUp(e);

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
            console.log('Making predictions...');
            showPredictions.value = true
            
            try {
                // Get the timing data from collector
                const timingData = keystrokeCollector.getTimingData();
                console.log('Timing data:', timingData);
                
                // Process the timing data with visualization
                const processedData = keystrokeProcessor.processTimingData(timingData.timings);
                console.log('Processed data:', processedData);
                
                // Prepare the data for API
                const data = {
                    text_content: text.value,
                    timing_data: processedData,
                    user_info: {}
                };

                // For now, just use mock predictions for testing
                console.log('Using mock predictions for testing');
                animatePredictions({
                    age: Math.floor(Math.random() * 42 + 18),
                    handedness: Math.random() > 0.5 ? "Droitier" : "Gaucher",
                    gender: Math.random() > 0.5 ? "Homme" : "Femme",
                    class: ["Étudiant", "Professeur", "Ingénieur"][Math.floor(Math.random() * 3)]
                });
            } catch (error) {
                console.error('Error making predictions:', error);
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
                    Object.keys(keyData).forEach(key => {
                        if (typeof keyData[key] === 'object') {
                            keyData[key] = {};
                        }
                    });
                }
            });
        }

        // Function to display results
        function displayResults(predictions) {
            const resultsDiv = document.getElementById('results');
            if (resultsDiv) {
                resultsDiv.innerHTML = `
                    <h3>Predictions:</h3>
                    <p>Age: ${predictions.age}</p>
                    <p>Handedness: ${predictions.handedness}</p>
                    <p>Gender: ${predictions.gender}</p>
                    <p>Class: ${predictions.class}</p>
                `;
            }
        }

        return {
            text,
            showPredictions,
            wpm,
            accuracy,
            keystrokes,
            predictions,
            handleKeydown,
            handleKeyup,
            makePredictions,
            confirmPredictions,
            redirectToContribute,
            resetAndRetry,
            createRipple
        }
    }
}).mount('#app')

// Add form submit listener
const form = document.querySelector('form');
if (form) {
    form.addEventListener('submit', handleSubmit);
}

// Optional: Add a clear button
const clearButton = document.getElementById('clear-button');
if (clearButton) {
    clearButton.addEventListener('click', () => {
        if (textarea) {
            textarea.value = '';
        }
        keystrokeCollector.resetData();
    });
}