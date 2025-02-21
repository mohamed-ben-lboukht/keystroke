class UIManager {
    constructor() {
        this.textInput = null;
        this.startButton = null;
        this.stopButton = null;
        this.statusDisplay = null;
        this.resultsDiv = null;
    }

    initialize() {
        this.textInput = document.getElementById('textInput');
        this.startButton = document.getElementById('startButton');
        this.stopButton = document.getElementById('stopButton');
        this.statusDisplay = document.getElementById('statusDisplay');
        this.resultsDiv = document.getElementById('results');
    }

    handleConsent() {
        document.getElementById('consentSection').style.display = 'none';
        document.getElementById('inputSection').style.display = 'block';
        this.textInput.disabled = false;
        this.startButton.disabled = false;
    }

    startRecording() {
        this.startButton.disabled = true;
        this.stopButton.disabled = false;
        this.textInput.disabled = false;
        this.statusDisplay.innerHTML = 'Recording...';
        this.resultsDiv.innerHTML = '';
    }

    stopRecording() {
        this.startButton.disabled = false;
        this.stopButton.disabled = true;
        this.textInput.disabled = true;
        this.statusDisplay.innerHTML = 'Not recording';
    }

    displayResults(data) {
        const text = this.textInput.value;
        const averages = data.metadata.averages;
        
        const html = `
            <h3>Results:</h3>
            <p>Text length: ${text.length} characters</p>
            <p>Average press-to-press time: ${averages.pp.toFixed(2)}ms</p>
            <p>Average release-to-release time: ${averages.rr.toFixed(2)}ms</p>
            <p>Average press-to-release time: ${averages.pr.toFixed(2)}ms</p>
            <p>Average release-to-press time: ${averages.rp.toFixed(2)}ms</p>
            <p>Number of keystrokes: ${data.metadata.totalKeystrokes}</p>
        `;

        this.resultsDiv.innerHTML = html;
    }

    getInputText() {
        return this.textInput.value;
    }
}

// Make it globally available
window.UIManager = UIManager;