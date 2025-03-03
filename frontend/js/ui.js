class UIManager {
    constructor() {
        this.textInput = null;
        this.startButton = null;
        this.stopButton = null;
        this.showGraphsButton = null;
        this.graphsContainer = null;
        this.profileContainer = null;
        // Pass 'placeholder' to use local placeholder data during development
        // Change to actual API endpoint when connecting to backend
        this.api = new KeystrokeAPI('placeholder'); 
        this.collector = new KeystrokeCollector();
        this.processor = new DataProcessor();
    }

    initialize() {
        // Initialize DOM elements
        this.textInput = document.getElementById('textInput');
        this.startButton = document.getElementById('startButton');
        this.stopButton = document.getElementById('stopButton');
        this.showGraphsButton = document.getElementById('showGraphsButton');
        this.graphsContainer = document.getElementById('graphsContainer');
        this.profileContainer = document.getElementById('profileContainer');

        // Initialize event listeners
        this.startButton.addEventListener('click', () => this.startRecording());
        this.stopButton.addEventListener('click', () => this.stopRecording());
        this.showGraphsButton.addEventListener('click', () => this.toggleGraphs());
        this.textInput.addEventListener('keydown', (e) => this.collector.handleKeyDown(e));
        this.textInput.addEventListener('keyup', (e) => this.collector.handleKeyUp(e));

        // Initialize charts
        this.processor.initializeCharts();

        // Display status message
        this.displayStatus('Ready to capture keystroke data. Click "Start Recording" to begin.');
    }

    startRecording() {
        this.collector.start();
        this.startButton.disabled = true;
        this.stopButton.disabled = false;
        this.textInput.disabled = false;
        this.textInput.value = '';
        this.textInput.focus();
        this.profileContainer.innerHTML = '';
        this.processor.clearCharts();
        this.displayStatus('Recording keystroke dynamics. Type naturally...');
    }

    async stopRecording() {
        const data = this.collector.stop();
        this.startButton.disabled = false;
        this.stopButton.disabled = true;
        this.textInput.disabled = true;
        this.displayStatus('Processing data...');

        // Update charts with raw timing data
        this.processor.updateCharts(data.timings);

        // Show the data in histogram format
        this.displayDataDistribution(data.timings);

        // Get user profile predictions
        try {
            const profile = await this.api.getUserProfile(data);
            this.displayProfile(profile);
            this.displayStatus('Analysis complete.');
        } catch (error) {
            console.error('Error getting user profile:', error);
            this.displayStatus('Error analyzing keystroke data. Please try again.');
        }
    }

    toggleGraphs() {
        const isVisible = this.graphsContainer.style.display !== 'none';
        if (isVisible) {
            this.graphsContainer.style.opacity = '0';
            setTimeout(() => {
                this.graphsContainer.style.display = 'none';
            }, 300); // Match the CSS transition duration
        } else {
            this.graphsContainer.style.display = 'block';
            // Force a reflow
            this.graphsContainer.offsetHeight;
            this.graphsContainer.style.opacity = '1';
        }
        this.showGraphsButton.textContent = isVisible ? 'Show Graphs' : 'Hide Graphs';
    }

    displayProfile(profile) {
        this.profileContainer.innerHTML = `
            <div class="profile-card">
                <h3>User Profile</h3>
                <div class="profile-grid">
                    <div class="profile-item">
                        <span class="label">Age Range:</span>
                        <span class="value">${profile.ageRange}</span>
                    </div>
                    <div class="profile-item">
                        <span class="label">Handedness:</span>
                        <span class="value">${profile.handedness}</span>
                    </div>
                    <div class="profile-item">
                        <span class="label">Typing Experience:</span>
                        <span class="value">${profile.typingExperience}</span>
                    </div>
                    <div class="profile-item">
                        <span class="label">Consistency:</span>
                        <span class="value">${profile.consistency}</span>
                    </div>
                </div>
            </div>
        `;
    }

    displayStatus(message) {
        const statusElement = document.createElement('div');
        statusElement.className = 'status-message';
        statusElement.textContent = message;
        
        const statusContainer = document.getElementById('statusContainer');
        if (statusContainer) {
            statusContainer.innerHTML = '';
            statusContainer.appendChild(statusElement);
        }
    }

    displayDataDistribution(timingData) {
        // Create a transformed version of the data for the model
        const transformedData = this.processor.transformToModelFormat(timingData);
        
        // For debugging - log the transformed data
        console.log("Transformed data:", transformedData);
        
        // Optionally, display a visual representation of the histogram
        // This would be useful for debugging or explaining the transformation
        const debugElement = document.getElementById('debugContainer');
        if (debugElement) {
            debugElement.innerHTML = `
                <div class="debug-card">
                    <h3>Data Transformation for ML Model</h3>
                    <p>Raw keystroke data has been transformed into the following histogram format:</p>
                    <pre>${JSON.stringify(transformedData, null, 2)}</pre>
                </div>
            `;
        }
    }
}

// Make it available globally
window.UIManager = UIManager;