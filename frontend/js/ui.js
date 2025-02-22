class UIManager {
    constructor() {
        this.textInput = null;
        this.startButton = null;
        this.stopButton = null;
        this.showGraphsButton = null;
        this.graphsContainer = null;
        this.profileContainer = null;
        this.api = new KeystrokeAPI();
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
    }

    async stopRecording() {
        const data = this.collector.stop();
        this.startButton.disabled = false;
        this.stopButton.disabled = true;
        this.textInput.disabled = true;

        // Update charts
        this.processor.updateCharts(data.timings);

        // Get user profile
        try {
            const profile = await this.api.getUserProfile(data);
            this.displayProfile(profile);
        } catch (error) {
            console.error('Error getting user profile:', error);
        }
    }

    toggleGraphs() {
        const isVisible = this.graphsContainer.style.display !== 'none';
        this.graphsContainer.style.display = isVisible ? 'none' : 'block';
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
}

// Make it available globally
window.UIManager = UIManager;