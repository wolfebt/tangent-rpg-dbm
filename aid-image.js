// Wolfe.BT@TangentLLC
document.addEventListener('DOMContentLoaded', () => {
    // Logic for visual-aid.html
    if (document.title.includes("Visual AId")) {
        let userApiKey_va = '';
        const globalState_va = {
            story: {
                storyboardVisualSeed: '',
                storyboardPanelPrompts: [],
                storyboardArtStyle: 'Painting',
                storyboardSubstyle: ''
            },
            character: { artStyle: 'Painting', substyle: '', pose: 'Close Up' },
            scene: { artStyle: 'Painting', substyle: '' },
            setting: { artStyle: 'Painting', substyle: '' }
        };

        const pathSettingsModal_va = document.getElementById('path-settings-modal');
        const pathModalTitle_va = document.getElementById('path-modal-title');
        const pathModalContent_va = document.getElementById('path-modal-content');
        const pathModalCustomInputContainer_va = document.getElementById('path-modal-custom-input-container');
        const pathModalCustomLabel_va = document.getElementById('path-modal-custom-label');
        const pathModalCustomInput_va = document.getElementById('path-modal-custom-input');
        let pathModalCustomSaveBtn_va = document.getElementById('path-modal-custom-save-btn');
        const characterPathDisplay_va = document.getElementById('character-path-display');
        const scenePathDisplay_va = document.getElementById('scene-path-display');
        const settingPathDisplay_va = document.getElementById('setting-path-display');
        
        const PATH_OPTIONS_VA = {
            'character-art-style': { title: 'Art Style', options: { 'Styles': ['Sketch', 'Painting', 'Anime', 'Photorealistic', 'Comic Book', 'Cinematic'] }, stateKey: 'artStyle', stateObject: 'character' },
            'character-substyle-sketch': { title: 'Sketch Substyle', options: { 'Substyles': ['Line Drawing', 'Doodling', 'Cartoon', 'Pointillism', 'Architectural'] }, stateKey: 'substyle', stateObject: 'character' },
            'character-substyle-painting': { title: 'Painting Substyle', options: { 'Substyles': ['Realism', 'Impressionism', 'Expressionism', 'Abstract', 'Surrealism', 'Pop Art', 'No Outline'] }, stateKey: 'substyle', stateObject: 'character' },
            'character-substyle-anime': { title: 'Anime Substyle', options: { 'Substyles': ['Shōjo', 'Shōnen', 'Chibi', 'Seinen', 'Kodomomuke'] }, stateKey: 'substyle', stateObject: 'character' },
            'character-substyle-photorealistic': { title: 'Photorealistic Substyle', options: { 'Substyles': ["Hyperrealism", "Trompe-l'œil"] }, stateKey: 'substyle', stateObject: 'character' },
            'character-substyle-comic-book': { title: 'Comic Book Substyle', options: { 'Substyles': ['Golden Age (1930s-1950s)', 'Silver Age (1950s-1970s)', 'Bronze Age (1970s-1985)', 'Modern Age (1985-Present)', 'Manga Style'] }, stateKey: 'substyle', stateObject: 'character' },
            'character-substyle-cinematic': { title: 'Cinematic Substyle', options: { 'Substyles': ['Film Noir', 'German Expressionism', 'New Wave', 'Italian Neorealism', 'Hollywood Golden Age', 'Modern'] }, stateKey: 'substyle', stateObject: 'character' },
            'character-pose': { title: 'Pose', options: { 'Portrait': ['Close Up'], 'Full Body': ['Modeling Pose', 'Action Pose', 'In Scene'], 'Reference': ['Concept Sheet'], 'Custom': ['Other...'] }, stateKey: 'pose', stateObject: 'character' },
            'scene-art-style': { title: 'Art Style', options: { 'Styles': ['Sketch', 'Painting', 'Anime', 'Photorealistic', 'Comic Book', 'Cinematic'] }, stateKey: 'artStyle', stateObject: 'scene' },
            'scene-substyle-sketch': { title: 'Sketch Substyle', options: { 'Substyles': ['Line Drawing', 'Doodling', 'Cartoon', 'Pointillism', 'Architectural'] }, stateKey: 'substyle', stateObject: 'scene' },
            'scene-substyle-painting': { title: 'Painting Substyle', options: { 'Substyles': ['Realism', 'Impressionism', 'Expressionism', 'Abstract', 'Surrealism', 'Pop Art', 'No Outline'] }, stateKey: 'substyle', stateObject: 'scene' },
            'scene-substyle-anime': { title: 'Anime Substyle', options: { 'Substyles': ['Shōjo', 'Shōnen', 'Chibi', 'Seinen', 'Kodomomuke'] }, stateKey: 'substyle', stateObject: 'scene' },
            'scene-substyle-photorealistic': { title: 'Photorealistic Substyle', options: { 'Substyles': ["Hyperrealism", "Trompe-l'œil"] }, stateKey: 'substyle', stateObject: 'scene' },
            'scene-substyle-comic-book': { title: 'Comic Book Substyle', options: { 'Substyles': ['Golden Age (1930s-1950s)', 'Silver Age (1950s-1970s)', 'Bronze Age (1970s-1985)', 'Modern Age (1985-Present)', 'Manga Style'] }, stateKey: 'substyle', stateObject: 'scene' },
            'scene-substyle-cinematic': { title: 'Cinematic Substyle', options: { 'Substyles': ['Film Noir', 'German Expressionism', 'New Wave', 'Italian Neorealism', 'Hollywood Golden Age', 'Modern'] }, stateKey: 'substyle', stateObject: 'scene' },
            'setting-art-style': { title: 'Art Style', options: { 'Styles': ['Sketch', 'Painting', 'Anime', 'Photorealistic', 'Comic Book', 'Cinematic'] }, stateKey: 'artStyle', stateObject: 'setting' },
            'setting-substyle-sketch': { title: 'Sketch Substyle', options: { 'Substyles': ['Line Drawing', 'Doodling', 'Cartoon', 'Pointillism', 'Architectural'] }, stateKey: 'substyle', stateObject: 'setting' },
            'setting-substyle-painting': { title: 'Painting Substyle', options: { 'Substyles': ['Realism', 'Impressionism', 'Expressionism', 'Abstract', 'Surrealism', 'Pop Art', 'No Outline'] }, stateKey: 'substyle', stateObject: 'setting' },
            'setting-substyle-anime': { title: 'Anime Substyle', options: { 'Substyles': ['Shōjo', 'Shōnen', 'Chibi', 'Seinen', 'Kodomomuke'] }, stateKey: 'substyle', stateObject: 'setting' },
            'setting-substyle-photorealistic': { title: 'Photorealistic Substyle', options: { 'Substyles': ["Hyperrealism", "Trompe-l'œil"] }, stateKey: 'substyle', stateObject: 'setting' },
            'setting-substyle-comic-book': { title: 'Comic Book Substyle', options: { 'Substyles': ['Golden Age (1930s-1950s)', 'Silver Age (1950s-1970s)', 'Bronze Age (1970s-1985)', 'Modern Age (1985-Present)', 'Manga Style'] }, stateKey: 'substyle', stateObject: 'setting' },
            'setting-substyle-cinematic': { title: 'Cinematic Substyle', options: { 'Substyles': ['Film Noir', 'German Expressionism', 'New Wave', 'Italian Neorealism', 'Hollywood Golden Age', 'Modern'] }, stateKey: 'substyle', stateObject: 'setting' },
            'storyboard-art-style': { title: 'Art Style', options: { 'Styles': ['Sketch', 'Painting', 'Anime', 'Photorealistic', 'Comic Book', 'Cinematic'] }, stateKey: 'storyboardArtStyle', stateObject: 'story' },
            'storyboard-substyle-sketch': { title: 'Sketch Substyle', options: { 'Substyles': ['Line Drawing', 'Doodling', 'Cartoon', 'Pointillism', 'Architectural'] }, stateKey: 'storyboardSubstyle', stateObject: 'story' },
            'storyboard-substyle-painting': { title: 'Painting Substyle', options: { 'Substyles': ['Realism', 'Impressionism', 'Expressionism', 'Abstract', 'Surrealism', 'Pop Art', 'No Outline'] }, stateKey: 'storyboardSubstyle', stateObject: 'story' },
            'storyboard-substyle-anime': { title: 'Anime Substyle', options: { 'Substyles': ['Shōjo', 'Shōnen', 'Chibi', 'Seinen', 'Kodomomuke'] }, stateKey: 'storyboardSubstyle', stateObject: 'story' },
            'storyboard-substyle-photorealistic': { title: 'Photorealistic Substyle', options: { 'Substyles': ["Hyperrealism", "Trompe-l'œil"] }, stateKey: 'storyboardSubstyle', stateObject: 'story' },
            'storyboard-substyle-comic-book': { title: 'Comic Book Substyle', options: { 'Substyles': ['Golden Age (1930s-1950s)', 'Silver Age (1950s-1970s)', 'Bronze Age (1970s-1985)', 'Modern Age (1985-Present)', 'Manga Style'] }, stateKey: 'storyboardSubstyle', stateObject: 'story' },
            'storyboard-substyle-cinematic': { title: 'Cinematic Substyle', options: { 'Substyles': ['Film Noir', 'German Expressionism', 'New Wave', 'Italian Neorealism', 'Hollywood Golden Age', 'Modern'] }, stateKey: 'storyboardSubstyle', stateObject: 'story' }
        };

        const createDisplayGem_va = (label, value, setting) => {
            const hasValue = !!value;
            const gemClass = `path-gem ${hasValue ? 'has-value' : ''}`;
            const gemContent = `<span class="path-gem-label">${label}:</span><span class="path-gem-value">${value || ''}</span>`;
            return `<button class="${gemClass}" data-setting="${setting}">${gemContent}</button>`;
        };

        function updateAllPathDisplays_va() {
            updateCharacterPathDisplay_va();
            updateScenePathDisplay_va();
            updateSettingPathDisplay_va();
            updateStoryboardStyleGems_va();
        }

        function updateCharacterPathDisplay_va() {
            characterPathDisplay_va.innerHTML = createDisplayGem_va('Art Style', globalState_va.character.artStyle, 'character-art-style');
            const mainStyle = globalState_va.character.artStyle.toLowerCase().replace(/\s+/g, '-');
            const substyleSetting = `character-substyle-${mainStyle}`;
            if (PATH_OPTIONS_VA[substyleSetting]) {
                characterPathDisplay_va.innerHTML += createDisplayGem_va(PATH_OPTIONS_VA[substyleSetting].title, globalState_va.character.substyle, substyleSetting);
            }
            characterPathDisplay_va.innerHTML += createDisplayGem_va('Pose', globalState_va.character.pose, 'character-pose');
        }

        function updateScenePathDisplay_va() {
            scenePathDisplay_va.innerHTML = createDisplayGem_va('Art Style', globalState_va.scene.artStyle, 'scene-art-style');
            const mainStyle = globalState_va.scene.artStyle.toLowerCase().replace(/\s+/g, '-');
            const substyleSetting = `scene-substyle-${mainStyle}`;
            if (PATH_OPTIONS_VA[substyleSetting]) {
                scenePathDisplay_va.innerHTML += createDisplayGem_va(PATH_OPTIONS_VA[substyleSetting].title, globalState_va.scene.substyle, substyleSetting);
            }
        }

        function updateSettingPathDisplay_va() {
            settingPathDisplay_va.innerHTML = createDisplayGem_va('Art Style', globalState_va.setting.artStyle, 'setting-art-style');
            const mainStyle = globalState_va.setting.artStyle.toLowerCase().replace(/\s+/g, '-');
            const substyleSetting = `setting-substyle-${mainStyle}`;
            if (PATH_OPTIONS_VA[substyleSetting]) {
                settingPathDisplay_va.innerHTML += createDisplayGem_va(PATH_OPTIONS_VA[substyleSetting].title, globalState_va.setting.substyle, substyleSetting);
            }
        }
        
        function updateStoryboardStyleGems_va() {
            const container = document.getElementById('storyboard-style-gems-container');
            container.innerHTML = createDisplayGem_va('Art Style', globalState_va.story.storyboardArtStyle, 'storyboard-art-style');
            const mainStyle = globalState_va.story.storyboardArtStyle.toLowerCase().replace(/\s+/g, '-');
            const substyleSetting = `storyboard-substyle-${mainStyle}`;
            if (PATH_OPTIONS_VA[substyleSetting]) {
                container.innerHTML += createDisplayGem_va(PATH_OPTIONS_VA[substyleSetting].title, globalState_va.story.storyboardSubstyle, substyleSetting);
            }
        }

        function handleOptionSelection_va(setting, option) {
            const config = PATH_OPTIONS_VA[setting];
            const stateObj = globalState_va[config.stateObject];

            if (setting.endsWith('-art-style') && stateObj[config.stateKey] !== option) {
                 if (config.stateObject === 'story') {
                    globalState_va.story.storyboardSubstyle = '';
                } else {
                    globalState_va[config.stateObject].substyle = '';
                }
            }

            if (option === 'Other...') {
                pathModalCustomInputContainer_va.classList.remove('hidden');
                pathModalCustomLabel_va.textContent = `Enter custom ${config.title.toLowerCase()}:`;
                pathModalCustomInput_va.value = '';
                pathModalCustomInput_va.focus();
                const newSaveBtn = pathModalCustomSaveBtn_va.cloneNode(true);
                pathModalCustomSaveBtn_va.parentNode.replaceChild(newSaveBtn, pathModalCustomSaveBtn_va);
                pathModalCustomSaveBtn_va = newSaveBtn;
                pathModalCustomSaveBtn_va.onclick = () => {
                    const customValue = pathModalCustomInput_va.value.trim();
                    if (customValue) {
                        stateObj[config.stateKey] = customValue;
                        closePathModal_va();
                    }
                };
            } else {
                stateObj[config.stateKey] = option;
                closePathModal_va();
            }
        }

        function openPathModal_va(setting) {
            pathModalContent_va.innerHTML = '';
            pathModalCustomInputContainer_va.classList.add('hidden');
            const settingConfig = PATH_OPTIONS_VA[setting];
            if (!settingConfig) return;

            const stateObject = globalState_va[settingConfig.stateObject];
            pathModalTitle_va.textContent = `Select ${settingConfig.title}`;

            for (const groupName in settingConfig.options) {
                const groupContainer = document.createElement('div');
                const groupHeader = document.createElement('h3');
                groupHeader.className = 'w-full text-sm font-semibold text-gray-400 mt-4 first:mt-0 mb-2';
                groupHeader.textContent = groupName;
                groupContainer.appendChild(groupHeader);
                
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'flex flex-wrap gap-2';
                groupContainer.appendChild(buttonContainer);

                settingConfig.options[groupName].forEach(option => {
                    const button = document.createElement('button');
                    button.className = 'py-2 px-3 rounded-md font-semibold btn-secondary text-sm';
                    const isCustom = !Object.values(settingConfig.options).flat().includes(stateObject[settingConfig.stateKey]);

                    if (stateObject[settingConfig.stateKey] === option || (option === 'Other...' && isCustom)) {
                        button.classList.replace('btn-secondary', 'btn-primary');
                    }
                    button.textContent = option;
                    button.addEventListener('click', () => handleOptionSelection_va(setting, option));
                    buttonContainer.appendChild(button);
                });
                pathModalContent_va.appendChild(groupContainer);
            }
            pathSettingsModal_va.classList.remove('hidden');
            pathSettingsModal_va.classList.add('flex');
            setTimeout(() => pathSettingsModal_va.style.opacity = 1, 10);
        }

        function closePathModal_va() {
            pathSettingsModal_va.style.opacity = 0;
            setTimeout(() => { 
                pathSettingsModal_va.classList.add('hidden'); 
                pathSettingsModal_va.classList.remove('flex');
                pathModalCustomInputContainer_va.classList.add('hidden');
            }, 250);
            updateAllPathDisplays_va();
        }

        function showStatus_va(message, isError = false) {
            const statusMessage = document.getElementById('status-message');
            statusMessage.textContent = message;
            statusMessage.style.color = isError ? '#ef4444' : '#9ca3af';
            statusMessage.style.opacity = '1';
            setTimeout(() => { statusMessage.style.opacity = '0'; }, 3000);
        }
        
        async function callGeminiAPI_va(prompt, loaderElement) {
            if (loaderElement) loaderElement.classList.remove('hidden');
            try {
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${userApiKey_va}`;
                const payload = { contents: [{ parts: [{ text: prompt }] }] };
                const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (response.ok) {
                    const result = await response.json();
                    return result.candidates?.[0]?.content?.parts?.[0]?.text;
                }
                const errorData = await response.json().catch(() => ({}));
                if (errorData.error && errorData.error.message.includes("API key not valid")) {
                    showStatus_va("Error: API Key is not valid. Please check settings.", true);
                    openModal_va('settings');
                }
                throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
            } catch (e) {
                console.error(e);
                return `Error: ${e.message}`;
            } finally {
                if(loaderElement) loaderElement.classList.add('hidden');
            }
        }


        async function callImagenAPI_va(positivePrompt, negativePrompt) {
            if (!userApiKey_va) {
                showStatus_va("API Key is missing for image generation.", true);
                openModal_va('settings');
                return null;
            }
            try {
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${userApiKey_va}`;
                const payload = {
                    instances: [{ prompt: positivePrompt, negativePrompt: negativePrompt }],
                    parameters: { "sampleCount": 1 }
                };
                const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                if (result.predictions?.[0]?.bytesBase64Encoded) {
                    return `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
                }
                throw new Error('API returned a valid response but no image data was found.');
            } catch(e) {
                console.error("Imagen API Error:", e);
                showStatus_va(`Image Gen Error: ${e.message}`, true);
                return null;
            }
        }
        
        function sanitizeFilename_va(name) { return (name || 'untitled').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }

        const settingsModal_va = document.getElementById('settings-modal');
        const apiKeyInput_va = document.getElementById('api-key-input');
        
        function openModal_va(type) {
            const modal = settingsModal_va;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            setTimeout(() => modal.style.opacity = 1, 10);
        }

        function closeModal_va(type) {
            const modal = settingsModal_va;
            modal.style.opacity = 0;
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }, 250);
        }

        function saveApiKey_va() {
            const key = apiKeyInput_va.value.trim();
            localStorage.setItem('writerAIdApiKey', key);
            userApiKey_va = key;
            showStatus_va(key ? "API Key saved." : "API Key removed.");
            closeModal_va('settings');
        }

        function loadApiKey_va() {
            let key = localStorage.getItem('writerAIdApiKey');
            if (!key) key = localStorage.getItem('geminiApiKey');
            if (!key) key = localStorage.getItem('googleApiKey');
            userApiKey_va = key || '';
            apiKeyInput_va.value = userApiKey_va;
            if (key) localStorage.setItem('writerAIdApiKey', key);
        }

        const tabButtons_va = document.querySelectorAll('.main-tab-btn');
        const tabContents_va = document.querySelectorAll('.tab-content');
        tabButtons_va.forEach(button => {
            button.addEventListener('click', () => {
                const targetTabId = button.dataset.tab;
                tabButtons_va.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                tabContents_va.forEach(content => content.classList.toggle('active', content.id === targetTabId));
            });
        });

        function setupImageGenerator_va(toolPrefix, formId, generateBtnId, imageGuidanceId, imageContainerId, spinnerId, imgId, placeholderId, downloadBtnId) {
            const generateBtn = document.getElementById(generateBtnId);
            const spinner = document.getElementById(spinnerId);
            const imgEl = document.getElementById(imgId);
            const placeholder = document.getElementById(placeholderId);
            const downloadBtn = document.getElementById(downloadBtnId);
            
            generateBtn.addEventListener('click', async () => {
                if (!userApiKey_va) { showStatus_va("API Key is missing. Please add it in Settings.", true); openModal_va('settings'); return; }
                
                generateBtn.disabled = true;
                generateBtn.textContent = 'Generating...';
                spinner.classList.remove('hidden');
                placeholder.style.display = 'none';
                imgEl.style.display = 'none';
                downloadBtn.style.display = 'none';

                try {
                    const attributes = {};
                    document.querySelectorAll(`#${formId} .tool-input`).forEach(input => {
                        attributes[input.dataset.fieldName] = input.value;
                    });
                    
                    const stateKey = toolPrefix.replace(/-/g, '');
                    const style = globalState_va[stateKey].artStyle;
                    const substyle = globalState_va[stateKey].substyle;
                    const imageGuidance = document.getElementById(imageGuidanceId).value.trim();
                    let posePromptPrefix = '';
                    let corePrompt = '';
                    
                    if (toolPrefix === 'character') {
                         const pose = globalState_va.character.pose;
                         corePrompt = `a ${attributes.gender || 'character'}. Build: ${attributes.build}. Hair: ${attributes.hairColor}. Eyes: ${attributes.eyeColor}. Details: ${attributes.details}. Clothing: ${attributes.clothing}. Expression: ${attributes.expression}.`;
                         switch (pose) {
                             case 'Concept Sheet': posePromptPrefix = 'Character concept sheet, multiple views, full body, detailed face, clean background.'; break;
                             case 'In Scene': posePromptPrefix = `Full body shot in a dynamic scene.`; corePrompt += ` Setting: ${attributes.background}.`; break;
                             case 'Action Pose': posePromptPrefix = `Dynamic action pose.`; corePrompt += ` Setting: ${attributes.background}.`; break;
                             case 'Modeling Pose': posePromptPrefix = `Full body, standing modeling pose.`; break;
                             default: posePromptPrefix = !['Close Up'].includes(pose) ? `${pose} of a` : 'Close up portrait from the chest up.'; break;
                         }
                    } else if (toolPrefix === 'scene') {
                        corePrompt = `A wide-angle shot of a ${attributes.name || 'scene'}. Description: ${attributes.exterior}. Style: ${attributes.architectural_style}. Environment: ${attributes.time_of_day}, ${attributes.weather}. Details: ${attributes.other_details}`;
                    } else if (toolPrefix === 'setting') {
                         corePrompt = `A wide-angle shot of a ${attributes.name || 'setting'}. Style: ${attributes.architectural_style}. Environment: ${attributes.time_of_day}, ${attributes.weather_vis}. Details: ${attributes.other_details}`;
                    }
                    
                    const positivePrompt = `${posePromptPrefix} ${corePrompt.replace(/\s+/g, ' ').trim()}, ${substyle}, ${style} style, ${imageGuidance}`;
                    const negativePrompt = attributes[`negative_prompts_${toolPrefix}`] || 'blurry, low quality, text, watermark';
                    
                    const imageUrl = await callImagenAPI_va(positivePrompt, negativePrompt);
                    if (imageUrl) {
                        imgEl.src = imageUrl;
                        imgEl.style.display = 'block';
                        downloadBtn.style.display = 'block';
                    } else {
                        placeholder.innerHTML = `<span class="text-red-400">Image Error</span>`;
                        placeholder.style.display = 'block';
                    }
                } catch (error) {
                    showStatus_va(`Image Gen Error: ${error.message}`, true);
                    placeholder.innerHTML = `<span class="text-red-400">Image Error</span>`;
                    placeholder.style.display = 'block';
                } finally {
                    spinner.classList.add('hidden');
                    generateBtn.disabled = false;
                    generateBtn.textContent = 'Generate Image';
                }
            });

            downloadBtn.addEventListener('click', () => {
                const name = document.getElementById(`${toolPrefix}-name`)?.value || toolPrefix;
                const filename = `${sanitizeFilename_va(name)}.${toolPrefix.substring(0,4)}.png`;
                const a = document.createElement('a');
                a.href = imgEl.src;
                a.download = filename;
                a.click();
            });
        }
        
        async function handleStoryboardGeneration_va() {
            const description = document.getElementById('storyboard-description').value.trim();
            if (!description) { showStatus_va("Please enter a scene description.", true); return; }
            
            const numPanels = parseInt(document.getElementById('storyboard-panels').value, 10);
            const style = globalState_va.story.storyboardArtStyle;
            const substyle = globalState_va.story.storyboardSubstyle;
            const secondaryGuidance = document.getElementById('storyboard-secondary-guidance').value.trim();
            const loader = document.getElementById('storyboard-loader');
            const output = document.getElementById('storyboard-output');
            const generateBtn = document.getElementById('generate-storyboard-btn');
            const saveContainer = document.getElementById('storyboard-save-container');

            loader.classList.remove('hidden');
            output.innerHTML = '';
            generateBtn.disabled = true;
            saveContainer.classList.add('hidden');
            
            const seedPrompt = `Create a concise, comma-separated list of visual keywords for an AI image generator based on this scene: "${description}". Include this guidance: "${secondaryGuidance}". Output only the keywords.`;
            globalState_va.story.storyboardVisualSeed = await callGeminiAPI_va(seedPrompt);
            
            const panelPrompt = `As a film director, break this scene into ${numPanels} storyboard panels: "${description}". For each panel, provide only a concise visual description for an AI image generator. Separate each description with '---'.`;
            const panelDescriptionsText = await callGeminiAPI_va(panelPrompt);
            
            if (!panelDescriptionsText || panelDescriptionsText.startsWith("Error:")) {
                showStatus_va(panelDescriptionsText || "Failed to generate panel descriptions.", true);
                loader.classList.add('hidden');
                generateBtn.disabled = false;
                return;
            }
            
            globalState_va.story.storyboardPanelPrompts = panelDescriptionsText.split('---').map(p => p.trim()).filter(Boolean);
            const imagePromises = globalState_va.story.storyboardPanelPrompts.map(prompt => {
                const fullPrompt = `${globalState_va.story.storyboardVisualSeed}, ${prompt}, ${substyle}, ${style} style`;
                return callImagenAPI_va(fullPrompt, "text, watermark, signature, ugly, deformed, blurry");
            });
            const generatedImages = await Promise.all(imagePromises);
            
            loader.classList.add('hidden');
            generateBtn.disabled = false;

            generatedImages.forEach((imageUrl, index) => {
                const panelDiv = document.createElement('div');
                panelDiv.className = 'storyboard-panel relative';
                panelDiv.dataset.index = index;
                panelDiv.innerHTML = `
                    <div class="aspect-video bg-gray-900 flex items-center justify-center">
                        ${imageUrl ? `<img src="${imageUrl}" class="w-full h-full object-cover">` : `<div class="p-4 text-red-400">Failed.</div>`}
                    </div>
                    <input type="checkbox" class="storyboard-checkbox absolute top-2 right-2 h-6 w-6 rounded text-blue-500 bg-gray-900/50 border-gray-500 focus:ring-blue-500">
                    <div class="p-3 text-xs text-gray-400">
                        <p>${index + 1}. ${globalState_va.story.storyboardPanelPrompts[index] || ''}</p>
                    </div>`;
                output.appendChild(panelDiv);
            });

            if (generatedImages.some(img => img)) {
                saveContainer.classList.remove('hidden');
            }
        }
        
        async function handleStoryboardReiteration_va() {
            const selectedCheckboxes = document.querySelectorAll('#storyboard-output .storyboard-checkbox:checked');
            if (selectedCheckboxes.length === 0) { showStatus_va('Please select at least one image to reiterate.', true); return; }

            const reiterateBtn = document.getElementById('reiterate-storyboard-btn');
            reiterateBtn.disabled = true;
            reiterateBtn.textContent = 'Reiterating...';

            const style = globalState_va.story.storyboardArtStyle;
            const substyle = globalState_va.story.storyboardSubstyle;
            
            const reiterationPromises = Array.from(selectedCheckboxes).map(checkbox => {
                const panelDiv = checkbox.closest('.storyboard-panel');
                const panelIndex = parseInt(panelDiv.dataset.index, 10);
                const originalPrompt = globalState_va.story.storyboardPanelPrompts[panelIndex];
                
                panelDiv.querySelector('.aspect-video').innerHTML = `<div class="panel-loader loader" style="margin: auto;"></div>`;
                const newPrompt = `Reiterate and refine this image, maintaining consistency with: "${globalState_va.story.storyboardVisualSeed}". Shot: "${originalPrompt}". Style: "${substyle}, ${style}".`;
                
                return callImagenAPI_va(newPrompt, "text, watermark, signature, ugly, deformed, blurry")
                    .then(imageUrl => ({ panelDiv, imageUrl, checkbox }));
            });

            const results = await Promise.all(reiterationPromises);
            results.forEach(({ panelDiv, imageUrl, checkbox }) => {
                const imgContainer = panelDiv.querySelector('.aspect-video');
                imgContainer.innerHTML = imageUrl ? `<img src="${imageUrl}" class="w-full h-full object-cover">` : `<div class="p-4 text-red-400">Reiteration Failed.</div>`;
                checkbox.checked = false;
            });

            reiterateBtn.disabled = false;
            reiterateBtn.textContent = 'Reiterate Selected Images';
        }


        // APP INITIALIZATION for visual-aid
        loadApiKey_va();
        updateAllPathDisplays_va();
        setupImageGenerator_va('character', 'character-image-tool', 'generate-image-btn-char', 'char-image-guidance', 'image-container-char', 'loading-spinner-image-char', 'generated-image-char', 'image-placeholder-char', 'download-image-btn-char');
        setupImageGenerator_va('scene', 'scene-image-tool', 'generate-image-btn-scene', 'scene-image-guidance', 'image-container-scene', 'loading-spinner-image-scene', 'generated-image-scene', 'image-placeholder-scene', 'download-image-btn-scene');
        setupImageGenerator_va('setting', 'setting-image-tool', 'generate-image-btn-setting', 'setting-image-guidance', 'image-container-setting', 'loading-spinner-image-setting', 'generated-image-setting', 'image-placeholder-setting', 'download-image-btn-setting');
        document.getElementById('generate-storyboard-btn').addEventListener('click', handleStoryboardGeneration_va);
        document.getElementById('reiterate-storyboard-btn').addEventListener('click', handleStoryboardReiteration_va);
        document.getElementById('save-storyboard-btn').addEventListener('click', () => {
            document.querySelectorAll('#storyboard-output .storyboard-checkbox:checked').forEach((checkbox, index) => {
                const img = checkbox.closest('.storyboard-panel').querySelector('img');
                if (img && img.src) {
                    const a = document.createElement('a');
                    a.href = img.src;
                    a.download = `storyboard-panel-${index + 1}.png`;
                    a.click();
                }
            });
        });

        document.getElementById('settings-btn').addEventListener('click', () => openModal_va('settings'));
        document.getElementById('close-settings-modal-btn').addEventListener('click', () => closeModal_va('settings'));
        settingsModal_va.addEventListener('click', (e) => { if (e.target === settingsModal_va) closeModal_va('settings'); });
        document.getElementById('save-api-key-btn').addEventListener('click', saveApiKey_va);
        pathSettingsModal_va.addEventListener('click', (e) => { if (e.target === pathSettingsModal_va) closePathModal_va(); });
        document.body.addEventListener('click', (e) => {
            const gemButton = e.target.closest('.path-gem');
            if (gemButton) openPathModal_va(gemButton.dataset.setting);
        });
    }
});


