document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const scanBtn = document.getElementById('scanBtn');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const filesList = document.getElementById('filesList');
    const submitBtn = document.getElementById('submitBtn');
    const resultArea = document.getElementById('resultArea');
    
    // Store uploaded files
    let uploadedFiles = [];
    
    // Event Listeners
    if (scanBtn) {
        scanBtn.addEventListener('click', () => {
            document.getElementById('upload').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Browse button click
    if (browseBtn) {
        browseBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event from bubbling up to uploadArea
            fileInput.click();
        });
    }
    
    // File selection
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelection);
    }
    
    // Drag and drop events
    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('active');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('active');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('active');
            
            const files = e.dataTransfer.files;
            handleFiles(files);
        });
        
        // Click anywhere on upload area to browse
        uploadArea.addEventListener('click', (e) => {
            // Only trigger if the click was directly on uploadArea and not on its children
            if (e.target === uploadArea) {
                fileInput.click();
            }
        });
    }
    
    // Submit button
    if (submitBtn) {
        submitBtn.addEventListener('click', handleSubmit);
    }
    
    // Functions
    function handleFileSelection() {
        const files = fileInput.files;
        handleFiles(files);
        fileInput.value = '';
    }
    
    function handleFiles(files) {
        const validFiles = Array.from(files).filter(file => file.name.endsWith('.apk'));
        
        if (validFiles.length === 0) {
            showNotification('Please select valid APK files.');
            return;
        }
        
        validFiles.forEach(file => {
            // Check if file is already in the list
            if (!uploadedFiles.some(f => f.name === file.name)) {
                uploadedFiles.push(file);
                addFileToList(file);
            }
            else
            {
                showNotification('You have already uploaded this file before');
                return;
            }
        });
        
        // Enable submit button if there are files
        updateSubmitButton();
    }
    
    function addFileToList(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.dataset.fileName = file.name;
        
        const fileSize = formatFileSize(file.size);
        
        fileItem.innerHTML = `
            <div class="file-info">
                <div class="file-icon">
                    <i class="fas fa-file-code"></i>
                </div>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-progress">
                        <div class="file-progress-bar"></div>
                    </div>
                </div>
            </div>
            <button class="delete-btn" title="Remove file">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        filesList.appendChild(fileItem);
        
        // Animate progress bar for visual feedback
        setTimeout(() => {
            const progressBar = fileItem.querySelector('.file-progress-bar');
            progressBar.style.width = '100%';
        }, 100);
        
        // Add event listener to delete button
        const deleteBtn = fileItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFile(file.name);
        });
    }
    
    function removeFile(fileName) {
        // Remove from array
        uploadedFiles = uploadedFiles.filter(file => file.name !== fileName);
        
        // Remove from DOM
        const fileItem = document.querySelector(`.file-item[data-file-name="${fileName}"]`);
        if (fileItem) {
            setTimeout(() => {
                filesList.removeChild(fileItem);
            }, 300);
        }
        
        // Update submit button state
        updateSubmitButton();
        fileInput.value = '';
        // Reset results area
        resultArea.style.display = 'none';
        resultArea.innerHTML = '';
    }
    
    function updateSubmitButton() {
        if (uploadedFiles.length > 0) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        } else {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
        }
    }
    
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }
    
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Add icon based on notification type
        let icon = '';
        switch(type) {
            case 'success':
                icon = '<i class="fas fa-check-circle" style="margin-right: 10px;"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle" style="margin-right: 10px;"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-times-circle" style="margin-right: 10px;"></i>';
                break;
            default: // info
                icon = '<i class="fas fa-info-circle" style="margin-right: 10px;"></i>';
        }
        
        notification.innerHTML = `${icon}${message}`;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }, 3000);
    }
    
    // Define API URL constant (currently empty for testing)
const API_URL = '';

function handleSubmit() {
    // Show loading state
    submitBtn.disabled = true;
    resultArea.style.display = 'block';
    resultArea.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <div style="margin-left: 15px;">Analyzing APK files...</div>
        </div>
    `;
    
    // Call the updated function to process files
    simulateApiResponse();
}

function simulateApiResponse() {
    if (!API_URL) {
        // Server is down or API URL not configured
        showServerError("The server is down at the moment. Please try again later.");
        return;
    }
    
    // Prepare form data with uploaded files
    const formData = new FormData();
    uploadedFiles.forEach(file => {
        formData.append('files', file);
    });
    
    // Setup timeout to handle long requests
    const timeoutDuration = 30000; // 30 seconds timeout
    let timeoutId = setTimeout(() => {
        showServerError("Request timed out. The server may be down at the moment.");
    }, timeoutDuration);
    
    // Make API request
    fetch(API_URL, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        clearTimeout(timeoutId); // Clear timeout as we got a response
        return response.json();
    })
    .then(data => {
        processApiResponse(data);
    })
    .catch(error => {
        clearTimeout(timeoutId); // Clear timeout as we got an error
        console.error('Error:', error);
        showServerError("Failed to connect to the server. Please try again later.");
    })
    .finally(() => {
        // Re-enable submit button
        submitBtn.disabled = false;
    });
}

function processApiResponse(response) {
    // Check for invalid response
    if (!response || response.status !== 200 || !response.results || response.results.length === 0) {
        const message = response && response.message ? response.message : "The server returned an invalid response.";
        showServerError(message);
        return;
    }
    
    // Valid response with results
    let resultsHTML = '<div class="results-container">';
    
    // Process each file result
    response.results.forEach(result => {
        const isThreat = result.class === "Ransomware";
        const threatProbability = (result.probability * 100).toFixed(1);
        
        resultsHTML += `
            <div class="file-result">
                <div class="file-result-header">
                    <div class="file-name">${result.fileName}</div>
                    <div class="file-probability">Confidence: ${threatProbability}%</div>
                </div>
                ${isThreat ? 
                    `<div class="result-threat result-appear">
                        <div class="result-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div>Ransomware Detected!</div>
                    </div>
                    <div class="threat-details">
                        This file contains potential malicious code. We recommend not installing this APK.
                    </div>` 
                    : 
                    `<div class="result-safe result-appear">
                        <div class="result-icon">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <div>No Threats Detected</div>
                    </div>
                    <div class="safe-details">
                        This file appears to be safe and free from ransomware.
                    </div>`
                }
            </div>
        `;
    });
    
    resultsHTML += '</div>';
    resultArea.innerHTML = resultsHTML;
}

function showServerError(message) {
    resultArea.innerHTML = `
        <div class="result-busy result-appear">
            <div class="result-icon">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <div>Internal Server Error</div>
        </div>
        <div style="margin-top: 15px; color: #ffc107;">
            ${message}
        </div>
    `;
    
    // Re-enable submit button
    submitBtn.disabled = false;
}
    
    // Animation for the circular statistics counters (stat-box)
    const statBoxes = document.querySelectorAll('.stat-box');
    const progressBars = document.querySelectorAll('.stat-box .progress-bar');

    // Calculate the circumference of the circle
    const radius = 45; // Same as in the SVG
    const circumference = 2 * Math.PI * radius;

    // Set initial dasharray for all progress bars
    progressBars.forEach(bar => {
        bar.style.strokeDasharray = circumference;
        bar.style.strokeDashoffset = circumference; // Initially full offset (no progress)
    });
    
    // MODIFIED: Create observer for each stat-box
    const statBoxObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Find the stat number element within this stat box
                const statNumber = entry.target.querySelector('.stat-number');
                const progressBar = entry.target.querySelector('.progress-bar');
                
                if (statNumber) {
                    const value = parseFloat(statNumber.dataset.value);
                    const maxValue = parseFloat(statNumber.dataset.maxValue || 100);
                    
                    // Reset values before animation
                    statNumber.textContent = '0.00';
                    if (progressBar) {
                        progressBar.style.strokeDashoffset = circumference;
                    }
                    
                    // Animate both counter and circular progress
                    animateDecimalValue(statNumber, 0, value, 1500, progressBar, maxValue);
                }
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe each stat-box
    statBoxes.forEach(box => {
        statBoxObserver.observe(box);
    });

    // Animation function for decimal values with circular progress
    function animateDecimalValue(element, start, end, duration, progressBar, maxValue) {
        let startTimestamp = null;
        
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Calculate current value based on progress
            const currentValue = progress * (end - start) + start;
            
            // Update counter text with decimal places
            element.textContent = currentValue.toFixed(2);
            
            // Update circular progress - use the same progress value
            if (progressBar) {
                // Calculate progress proportion (from 0 to 1) for the progress bar
                const dashoffset = circumference - (circumference * progress * (end / maxValue));
                progressBar.style.strokeDashoffset = dashoffset;
            }
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        
        window.requestAnimationFrame(step);
    }
    
    // MODIFIED: Observer for stat-box-1 elements (whole numbers only)
    const statBox1s = document.querySelectorAll('.stat-box-1');
    
    // Set up the Intersection Observer for stat-box-1 elements
    const statBox1Observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Find the stat number element within this stat box
                const statNumber = entry.target.querySelector('.stat-number');
                if (statNumber) {
                    // Reset counter to 0 before starting animation
                    statNumber.textContent = '0';
                    
                    const value = parseInt(statNumber.dataset.value);
                    // Start the animation from 0 to the target value
                    animateWholeValue(statNumber, 0, value, 1500);
                }
            }
        });
    }, { 
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all stat-box-1 elements
    statBox1s.forEach(box => {
        statBox1Observer.observe(box);
    });

    // Animation function for whole numbers (no decimals)
    function animateWholeValue(element, start, end, duration) {
        let startTimestamp = null;
        
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Calculate current value as whole number
            const currentValue = Math.floor(progress * (end - start) + start);
            
            // Update counter text with whole number (no decimals)
            element.textContent = currentValue;
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        
        window.requestAnimationFrame(step);
    }
    
    // Add a smooth scroll for all internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});