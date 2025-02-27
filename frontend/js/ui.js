// ui.js

class UIManager {
    constructor() {
        this.resultsContainer = null;
        this.inputArea = null;
        this.visualizationContainer = null;
        this.isRecording = false;
        this.onStartCallback = null;
        this.onStopCallback = null;
    }

    initialize(containerId, onStart, onStop) {
        this.onStartCallback = onStart;
        this.onStopCallback = onStop;
        
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error('Container element not found');
        }

        this.setupUI(container);
        this.attachEventListeners();
    }

    setupUI(container) {
        container.innerHTML = `
            <div class="keystroke-input-container">
                <div class="consent-section" id="consentSection">
                    <h3>Data Collection Consent</h3>
                    <p>We collect keystroke timing data to analyze typing patterns. 
                       This data will be used to understand typing behavior.</p>
                    <button id="consentButton" class="primary-button">I Agree</button>
                </div>
                
                <div class="input-section" id="inputSection" style="display: none;">
                    <div class="controls">
                        <button id="startButton" class="primary-button">Start Recording</button>
                        <button id="stopButton" class="secondary-button" disabled>Stop Recording</button>
                        <button id="showVisualization" class="secondary-button">Show Analytics</button>
                    </div>
                    
                    <textarea 
                        id="textInput" 
                        placeholder="Start typing here..." 
                        disabled
                    ></textarea>
                    
                    <div class="status" id="statusDisplay">
                        <span class="status-indicator"></span>
                        Not recording
                    </div>
                </div>
                
                <div class="results-section" id="resultsSection"></div>
                
                <div class="visualization-section" id="visualizationSection" style="display: none;">
                    <div class="timing-metrics">
                        <h4>Typing Metrics</h4>
                        <div id="metricsDisplay"></div>
                    </div>
                    <div class="timing-charts">
                        <div id="ppChart" class="chart"></div>
                        <div id="rrChart" class="chart"></div>
                        <div id="prChart" class="chart"></div>
                        <div id="rpChart" class="chart"></div>
                    </div>
                </div>
            </div>
        `;

        this.inputArea = document.getElementById('textInput');
        this.resultsContainer = document.getElementById('resultsSection');
        this.visualizationContainer = document.getElementById('visualizationSection');
        this.statusDisplay = document.getElementById('statusDisplay');
    }

    attachEventListeners() {
        document.getElementById('consentButton')?.addEventListener('click', () => this.handleConsent());
        document.getElementById('startButton')?.addEventListener('click', () => this.handleStart());
        document.getElementById('stopButton')?.addEventListener('click', () => this.handleStop());
        document.getElementById('showVisualization')?.addEventListener('click', () => this.toggleVisualization());
        
        this.inputArea?.addEventListener('input', (e) => this.handleInput(e));
    }

    handleConsent() {
        document.getElementById('consentSection').style.display = 'none';
        document.getElementById('inputSection').style.display = 'block';
        this.enableInput();
    }

    handleStart() {
        this.isRecording = true;
        this.updateUIState();
        this.onStartCallback?.();
    }

    handleStop() {
        this.isRecording = false;
        this.updateUIState();
        this.onStopCallback?.();
    }

    handleInput(event) {
        if (!this.isRecording) return;
        // Input handling can be implemented by caller
    }

    enableInput() {
        this.inputArea.disabled = false;
        document.getElementById('startButton').disabled = false;
    }

    updateUIState() {
        const startButton = document.getElementById('startButton');
        const stopButton = document.getElementById('stopButton');
        const textInput = document.getElementById('textInput');
        
        startButton.disabled = this.isRecording;
        stopButton.disabled = !this.isRecording;
        textInput.disabled = !this.isRecording;
        
        this.statusDisplay.innerHTML = `
            <span class="status-indicator ${this.isRecording ? 'recording' : ''}"></span>
            ${this.isRecording ? 'Recording...' : 'Not recording'}
        `;
    }

    toggleVisualization() {
        const isVisible = this.visualizationContainer.style.display !== 'none';
        this.visualizationContainer.style.display = isVisible ? 'none' : 'block';
        document.getElementById('showVisualization').textContent = 
            isVisible ? 'Show Analytics' : 'Hide Analytics';
    }

    displayResults(results) {
        this.resultsContainer.innerHTML = `
            <div class="results-card">
                <h4>Analysis Results</h4>
                <div class="metrics">
                    <p>Typing Speed: ${results.speed} CPM</p>
                    <p>Consistency: ${results.consistency}%</p>
                    <p>Accuracy: ${results.accuracy}%</p>
                </div>
                ${results.predictions ? `
                    <div class="predictions">
                        <p>Predicted Age Range: ${results.predictions.age}</p>
                        <p>Handedness: ${results.predictions.handedness}</p>
                        <p>Education Level: ${results.predictions.education}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    updateMetrics(metrics) {
        document.getElementById('metricsDisplay').innerHTML = `
            <div class="metrics-grid">
                <div class="metric">
                    <label>Average Press Time:</label>
                    <span>${metrics.avgPressTime.toFixed(2)}ms</span>
                </div>
                <div class="metric">
                    <label>Typing Speed:</label>
                    <span>${metrics.typingSpeed.toFixed(2)} CPM</span>
                </div>
                <div class="metric">
                    <label>Consistency:</label>
                    <span>${(metrics.consistency * 100).toFixed(1)}%</span>
                </div>
            </div>
        `;
    }

    clearInput() {
        this.inputArea.value = '';
    }

    getInputText() {
        return this.inputArea.value;
    }
}

export default UIManager;