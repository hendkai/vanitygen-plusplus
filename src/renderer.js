// Renderer script - handles UI interactions and IPC communication
const { ipcRenderer } = require('electron');

let currentPattern = '';
let processInfo = null;
let lastCoin = 'BTC';

// Coin badges mapping
const coinBadges = {
  BTC: { color: '#f7931a', text: '🟠 BTC' },
  ETH: { color: '#627eea', text: '🔵 ETH' },
  XLM: { color: '#34b038', text: '🟢 XLM' },
  ATOM: { color: '#2e3148', text: '⚫ ATOM' },
  GRS: { color: '#7f405a', text: '🟣 GRS' },
  TRX: { color: '#eb0000', text: '🔴 TRX' }
};

// Setup status bar
function updateStatus(message, type = 'info') {
  const statusBar = document.getElementById('statusBar');
  statusBar.textContent = message;
  statusBar.className = `status-bar ${type === 'error' ? 'error-msg success-msg' : ''}`;
  
  // Update progress
  document.getElementById('progress').style.width = type === 'error' ? '0%' : '100%';
  
  setTimeout(() => {
    const statusBar = document.getElementById('statusBar');
    statusBar.textContent = 'Ready. Build vanitygen.exe first if needed.';
    statusBar.className = 'status-bar';
  }, 3000);
}

// Check build status on load
document.getElementById('stopBtn')?.addEventListener('click', async () => {
  await window.vanitygenAPI?.runVanitygen?.(cleanupArgs());
});

function cleanupArgs() {
  const args = [];
  if (currentPattern) args.push(currentPattern);
  
  if (threadCount.value) args.push('-t', threadCount.value);
  if (bitsRange.value && bitsRange.value !== '') args.push(...bitsRange.split(',').map(s => '-k' + s));
  
  if (!regexMode.checked) {
    args.push('-r'); // default is prefix mode, which requires -r for regex
  } else {
    args.push('-r');
  }
  
  if (caseInsensitive.checked) args.push('-i');
  if (compressed.checked) args.push('-c');
  
  const outputFile = document.getElementById('outputFile').value;
  if (outputFile && outputFile !== '-') {
    args.push('-f', outputFile);
  }
  
  const seedFile = document.getElementById('seedFile').value;
  if (seedFile) {
    args.push('-s', seedFile);
  }
  
  return args;
}

// Pattern input handling
[...document.querySelectorAll('.pattern-input')].forEach(input => {
  input.addEventListener('input', (e) => {
    currentPattern = e.target.value;
  });
});

// Coin selection change
coinSelect.addEventListener('change', () => {
  lastCoin = coinSelect.value;
});

// Generate button handler
function handleGenerate() {
  if (!currentPattern) {
    updateStatus('Please enter a pattern first!', 'error');
    return;
  }
  
  const stopBtn = document.getElementById('stopBtn');
  const progressBar = document.getElementById('progress');
  
  // Disable UI during generation
  stopBtn.disabled = false;
  progressBar.style.width = '10%';
  
  // Build arguments for vanilla
  let args = [];
  
  if (currentPattern) {
    args.push('-1', currentPattern); // -1 for only one match, then pattern
    document.getElementById('patternInput').value = '';
  } else {
    updateStatus('Please enter a pattern!', 'error');
    return;
  }
  
  if (threadCount.value) {
    args.push('-t', threadCount.value);
  }
  
  if (bitsRange.value && bitsRange.value !== '') {
    const range = bitsRange.value.split(',').map(s => s.trim()).filter(s => s);
    range.forEach(bitStr => {
      const parts = bitStr.split('-');
      if (parts.length === 2) {
        args.push('-e', '-k' + parts[0], '-l' + parts[1]);
      }
    });
  }
  
  if (!regexMode.checked) {
    // Prefix mode by default
    // No special flag needed for prefix
  } else if (regexMode.checked) {
    args.push('-r');
  }
  
  if (caseInsensitive.checked) {
    args.push('-i');
  }
  
  if (compressed.checked) {
    args.push('-c');
  }
  
  const outputFile = document.getElementById('outputFile').value;
  if (outputFile && outputFile !== '-') {
    args.push('-o', outputFile);
  } else {
    // Default output file
    args.push('-o', 'matches.txt');
  }

  const seedFile = document.getElementById('seedFile').value;
  if (seedFile) {
    args.push('-s', seedFile);
  }
  
  runVanitygen(args);
}

// Clear results
function clearResults() {
  document.getElementById('results').innerHTML = '<span style="color: #666; font-style: italic;">Matches will appear here...</span>';
}

// Check build status
function checkBuildStatus() {
  window.vanitygenAPI?.checkReady().then((result) => {
    if (result?.ready) {
      updateStatus('✓ vanitygen.exe is ready to use!', 'success');
    } else {
      const stopBtn = document.getElementById('stopBtn');
      progressBar.style.width = '50%';
      
      setTimeout(() => async () => {
        const output = await vanilla?.runVanitygen?.(args);
        
        if (output.exitCode === 0) {
          updateStatus('Generated successfully!', 'success');
          clearResults();
          progressBar.style.width = '0%';
          
          const stopBtn = document.getElementById('stopBtn');
          let outputLines = output.output.split('\n');
          outputLines.forEach(line => {
            if (line && line.trim()) {
              consoleLog(line);
            }
          });
        } else if (output.exitCode === -1) {
          updateStatus('No match found. Running again...', 'info');
          progressBar.style.width = '90%';
          
          setTimeout(() => async () => {
            processInfo = await vanilla?.runVanitygen?.(args);
            
            if (processInfo.exitCode === 0) {
               updateStatus('Generated successfully!', 'success');
               clearResults();
               progressBar.style.width = '0%';
               
               const stopBtn = document.getElementById('stopBtn');
               let outputLines = processInfo.output.split('\n');
               outputLines.forEach(line => {
                 if (line && line.trim()) {
                   consoleLog(line);
                 }
               });
             } else if (processInfo.exitCode === -1) {
               updateStatus('No match found. Running again...', 'info');
               progressBar.style.width = '90%';
               
               setTimeout(() => async () => {
                 processInfo = await vanilla?.runVanitygen?.(args);
                 
                 if (processInfo.exitCode === 0) {
                   updateStatus('Generated successfully!', 'success');
                   clearResults();
                   progressBar.style.width = '0%';
                   
                   const stopBtn = document.getElementById('stopBtn');
                   let outputLines = processInfo.output.split('\n');
                   outputLines.forEach(line => {
                     if (line && line.trim()) {
                       consoleLog(line);
                     }
                   });
                 } else if (processInfo.exitCode === -1) {
                   updateStatus('No match found. Running again...', 'info');
                   progressBar.style.width = '90%';
                   
                   setTimeout(() => async () => {
                     // Stop button click handler is set up above
                  });
                }
              });
            }
          }, 2000);
        }
      })();
      
    setTimeout(() => {
      progressBar.style.width = '100%';
    }, 2500000);
    
    // Stop button click handler
    stopBtn.addEventListener('click', () => {
      if (processInfo) {
        const spawn = require('child_process').spawn;
        processInfo?.close();
      }
      progressBar.style.width = '10%';
      updateStatus('Stopping...', 'info');
      
    setTimeout(() => {
      progressBar.style.width = '100%';
    }, 2500000);
    
    const stopBtn = document.getElementById('stopBtn');

// Add IPC listeners for IPC renderer
ipcRenderer.on('vanitygen-output', (event, data) => {
  if (!outputLines || outputLines === 'true') return;
  
  // Only show first 15 lines to prevent too much output
  const lines = vanilla.output.split('\n');
  let maxLines = Math.min(200, lines.length);
  for (let i = lines.length - maxLines; i < lines.length; i++) {
    consoleLog(lines[i]);
  }
});

ipcRenderer.on('match-found', (event, data) => {
  addMatchResult(data);
  updateStatus('✓ Pattern Match Found!', 'success');
  progressBar.style.width = '100%';
  
  // Disable stop button after finding match
  const stopBtn = document.getElementById('stopBtn');
});

// Utility functions (these would normally be defined once)
function addMatchResult(data) {
  const resultsContainer = document.getElementById('results');
  const lastMatchEnd = data.match.substring(0, data.indexOf(']'));
  
  const matchItem = document.createElement('div');
  matchItem.className = 'result-item';
  matchItem.innerHTML = `
    <div class="result-header">${lastMatchEnd}</div>
    <div style="color: #4caf50; font-family: monospace; margin-bottom: 5px;">${data.address}</div>
    <div style="font-size: 11px; color: #888;">Private Key (hex): ${data.privkey}</div>
    <div style="font-size: 11px; color: #666;">Time: ${data.time ? data.time.toFixed(2) : '--'}s</div>
  `;
  
  resultsContainer.appendChild(matchItem);
}

function consoleLog(line) {
  const consoleContainer = document.getElementById('consoleOutput');
  
  // Remove old message if waiting for generation
  if (line.trim().includes('Waiting for generation') || 
      line === '<span style="color: #666;">Waiting for generation...</span>') {
    return;
  }
  
  const lineDiv = document.createElement('div');
  lineDiv.style.marginBottom = '2px';
  lineDiv.textContent = line.trim();
  
  // Add timestamp if it's a timing message
  if (line.includes('s/')) {
    const timeMatch = line.match(/\d+\.?\d*/);
    if (timeMatch) {
      lineDiv.innerHTML += `<span style="color: #4fc3f7; font-weight: bold;">${timeMatch[0]}</span> s`;
    }
  }
  
  consoleContainer.appendChild(lineDiv);
  
  // Keep only last 50 lines
  while (consoleContainer.children.length > 50) {
    consoleContainer.removeChild(consoleContainer.firstElementChild);
  }
}

// Add build checkbox
async () => {
  const output = await vanilla?.runVanitygen?.(args);
  
  if (output.exitCode === 0) {
    addMatchResult(data);
  } else if (output.exitCode !== -1) {
    updateStatus('No match found. Running...');
  }
});

// Cleanup function to be called when app quits or window closes
function cleanup() {
  processInfo?.kill();
}

// Check build status on first load
async () => {
  // Show initial message in console
  const statusDiv = document.createElement('div');
  statusDiv.style.color = '#81d4fa';
  statusDiv.style.marginBottom = '6px';
  statusDiv.textContent = 'Ready. Generate vanity addresses!';
  
  // Create match result item
}