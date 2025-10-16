// Wolfe.BT@TangentLLC
document.addEventListener('DOMContentLoaded', () => {
    if (document.title.includes("Writer AId")) {
        let userApiKey = '';
        const globalState = {
            projectTitle: 'Untitled Project',
            story: {
                brainstormConcept: '',
                storyOutline: '',
                storyTreatment: '',
                storyboardVisualSeed: '',
                storyboardPanelPrompts: [],
                storyboardArtStyle: 'Painting',
                storyboardSubstyle: '',
                brainstormType: '',
                outlineStructure: '',
                writingFormat: '',
                targetAudience: '',
                writingStyle: '',
                plot: '',
                conflict: '',
                theme: '',
                pointOfView: '',
                tone: '',
                symbolism: ''
            },
            character: {
                artStyle: 'Painting',
                substyle: '',
                pose: 'Close Up'
            },
            scene: {
                artStyle: 'Painting',
                substyle: ''
            },
            setting: {
                artStyle: 'Painting',
                substyle: ''
            },
            assets: {
                story: [],
                character: [],
                scene: [],
                setting: [],
            }
        };

        const assetContainers = {
            story: document.getElementById('asset-container'),
            character: document.getElementById('asset-container-char'),
            scene: document.getElementById('asset-container-scene'),
            setting: document.getElementById('asset-container-setting')
        };
        const pathSettingsModal = document.getElementById('path-settings-modal');
        const pathModalTitle = document.getElementById('path-modal-title');
        const pathModalContent = document.getElementById('path-modal-content');
        const pathModalCustomInputContainer = document.getElementById('path-modal-custom-input-container');
        const pathModalCustomLabel = document.getElementById('path-modal-custom-label');
        const pathModalCustomInput = document.getElementById('path-modal-custom-input');
        let pathModalCustomSaveBtn = document.getElementById('path-modal-custom-save-btn');
        const characterPathDisplay = document.getElementById('character-path-display');
        const scenePathDisplay = document.getElementById('scene-path-display');
        const settingPathDisplay = document.getElementById('setting-path-display');
        const projectTitleEl = document.getElementById('project-title');
        const mainEditor = document.getElementById('main-editor');
        const chosenIdeaDisplay = document.getElementById('chosen-idea-display');
        const outlineOutput = document.getElementById('outline-output');
        const chosenOutlineDisplay = document.getElementById('chosen-outline-display');
        const treatmentOutput = document.getElementById('treatment-output');
        const writeTreatmentReference = document.getElementById('write-treatment-reference');
        const ideasOutput = document.getElementById('ideas-output');
        const storyboardOutput = document.getElementById('storyboard-output');
        const jsonFileInput = document.getElementById('json-file-input');
        const optionalGemsContainer = document.getElementById('optional-gems-container');
        const formGuidanceGemsContainer = document.getElementById('form-guidance-gems-container');

        const assetPreviewModal = document.getElementById('asset-preview-modal');
        const assetModalTitle = document.getElementById('asset-modal-title');
        const assetModalContent = document.getElementById('asset-modal-content');
        let assetModalNotes = document.getElementById('asset-modal-notes');
        let assetModalIncludeCheckbox = document.getElementById('asset-modal-include-checkbox');
        let assetModalDeleteBtn = document.getElementById('asset-modal-delete-btn');
        const closeAssetModalBtn = document.getElementById('close-asset-modal-btn');

        const PATH_OPTIONS = {
            'brainstorm-type': { title: 'Brainstorming', options: { 'Story Writing': ['Story Ideas', 'Characters', 'Settings', 'Plot Twists', 'Story Hooks'], 'General Purpose': ['Design Concept', 'Shopping List', 'Travel Ideas'], 'Custom': ['Other...'] }, stateKey: 'brainstormType', stateObject: 'story' },
            'target-audience': { title: 'Target Audience', options: { 'Youth': ['Children', 'Teen', 'Young Adult'], 'Adult': ['Mature', 'Graphic'], 'Technical': ['Academic'], 'Custom': ['Other...'] }, stateKey: 'targetAudience', stateObject: 'story' },
            'outline-structure': { title: 'Outline Structure', options: { 'Classic Structures': ['Three-Act Structure', "The Hero's Journey", 'Five-Act Structure'], 'Novel Writing': ['Save the Cat Beat Sheet', 'Snowflake Method', 'Fichtean Curve'], 'Custom': ['Other...'] }, stateKey: 'outlineStructure', stateObject: 'story' },
            'treatment-format': { title: 'Treatment Format', options: { 'Prose & Narrative': ['Novel / Book Chapter', 'Short Story', 'Flash Fiction'], 'Scripts & Performance': ['Screenplay Scene', 'Dialogue Only', 'Stage Play Scene', 'Comic Book Script'], 'Custom': ['Other...'] }, stateKey: 'writingFormat', stateObject: 'story' },
            'writing-style': {
                title: 'Writing Style',
                options: {
                    'Common Tones': ['Professional', 'Casual', 'Humorous', 'Formal', 'Serious'],
                    'Literary Styles': ['Poetic', 'Minimalist', 'Journalistic', 'Satirical', 'Gritty / Noir'],
                    'Genre Styles': ['Epic Fantasy', 'Hard Sci-Fi', 'Cozy Mystery', 'Young Adult Dystopian'],
                    'Custom': ['Other...']
                },
                stateKey: 'writingStyle',
                stateObject: 'story'
            },
            'character-art-style': { title: 'Art Style', options: { 'Styles': ['Sketch', 'Painting', 'Anime', 'Photorealistic', 'Comic Book', 'Cinematic'] }, stateKey: 'artStyle', stateObject: 'character' },
            'character-substyle-sketch': { title: 'Sketch Substyle', options: { 'Substyles': ['Line Drawing', 'Doodling', 'Cartoon', 'Pointillism', 'Architectural'] }, stateKey: 'substyle', stateObject: 'character' },
            'character-substyle-painting': { title: 'Painting Substyle', options: { 'Substyles': ['Realism', 'Impressionism', 'Expressionism', 'Abstract', 'Surrealism', 'Pop Art', 'No Outline'] }, stateKey: 'substyle', stateObject: 'character' },
            'character-substyle-anime': { title: 'Anime Substyle', options: { 'Substyles': ['Shōjo', 'Shōnen', 'Chibi', 'Seinen', 'Kodomomuke'] }, stateKey: 'substyle', stateObject: 'character' },
            'character-substyle-photorealistic': { title: 'Photorealistic Substyle', options: { 'Substyles': ["Hyperrealism", "Trompe-l'œil"] }, stateKey: 'substyle', stateObject: 'character' },
            'character-substyle-comic-book': { title: 'Comic Book Substyle', options: { 'Substyles': ['Golden Age (1930s-1950s)', 'Silver Age (1950s-1970s)', 'Bronze Age (1970s-1985)', 'Modern Age (1985-Present)', 'Manga Style'] }, stateKey: 'substyle', stateObject: 'character' },
            'character-substyle-cinematic': { title: 'Cinematic Substyle', options: { 'Substyles': ['Film Noir', 'German Expressionism', 'New Wave', 'Italian Neorealism', 'Hollywood Golden Age', 'Modern'] }, stateKey: 'substyle', stateObject: 'character' },
            'character-pose': {
                title: 'Pose',
                options: {
                    'Portrait': ['Close Up'],
                    'Full Body': ['Modeling Pose', 'Action Pose', 'In Scene'],
                    'Reference': ['Concept Sheet'],
                    'Custom': ['Other...']
                },
                stateKey: 'pose',
                stateObject: 'character'
            },
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
            'storyboard-substyle-cinematic': { title: 'Cinematic Substyle', options: { 'Substyles': ['Film Noir', 'German Expressionism', 'New Wave', 'Italian Neorealism', 'Hollywood Golden Age', 'Modern'] }, stateKey: 'storyboardSubstyle', stateObject: 'story' },
            'plot': { title: 'Plot', options: { 'Structures': ['Linear', 'Episodic', 'Parallel', 'Circular', 'Flashback-driven'], 'Custom': ['Other...'] }, stateKey: 'plot', stateObject: 'story' },
            'conflict': { title: 'Conflict', options: { 'Types': ['Character vs. Self', 'Character vs. Character', 'Character vs. Society', 'Character vs. Nature'], 'Custom': ['Other...'] }, stateKey: 'conflict', stateObject: 'story' },
            'theme': { title: 'Theme', options: { 'Ideas': ['Love vs. Hate', 'Good vs. Evil', 'Coming of Age', 'Redemption', 'Humanity vs. Technology', 'Survival'], 'Custom': ['Other...'] }, stateKey: 'theme', stateObject: 'story' },
            'pointOfView': { title: 'Point of View', options: { 'Perspectives': ['First Person', 'Second Person', 'Third Person Limited', 'Third Person Omniscient'], 'Custom': ['Other...'] }, stateKey: 'pointOfView', stateObject: 'story' },
            'tone': { title: 'Tone', options: { 'Attitudes': ['Serious', 'Humorous', 'Satirical', 'Suspenseful', 'Formal', 'Casual', 'Melancholy'], 'Custom': ['Other...'] }, stateKey: 'tone', stateObject: 'story' },
            'symbolism': { title: 'Symbolism', options: { 'Archetypes': ['Light vs. Dark', 'The Journey', 'Seasonal Cycles', 'Water (Purity/Rebirth)'], 'Custom': ['Other...'] }, stateKey: 'symbolism', stateObject: 'story' }
        };

        function createDisplayGem(label, value, setting) {
            const hasValue = !!value;
            const gemClass = `path-gem ${hasValue ? 'has-value' : ''}`;
            const gemContent = `
                <span class="path-gem-label">${label}:</span>
                <span class="path-gem-value">${value || ''}</span>
            `;
            return `<button class="${gemClass}" data-setting="${setting}">${gemContent}</button>`;
        }

        function updateCharacterPathDisplay() {
            characterPathDisplay.innerHTML = '';
            characterPathDisplay.innerHTML += createDisplayGem('Art Style', globalState.character.artStyle, 'character-art-style');
            const mainStyle = globalState.character.artStyle.toLowerCase().replace(/\s+/g, '-');
            const substyleSetting = `character-substyle-${mainStyle}`;
            if (PATH_OPTIONS[substyleSetting]) {
                characterPathDisplay.innerHTML += createDisplayGem(PATH_OPTIONS[substyleSetting].title, globalState.character.substyle, substyleSetting);
            }
            characterPathDisplay.innerHTML += createDisplayGem('Pose', globalState.character.pose, 'character-pose');
        }

        function updateScenePathDisplay() {
            scenePathDisplay.innerHTML = '';
            scenePathDisplay.innerHTML += createDisplayGem('Art Style', globalState.scene.artStyle, 'scene-art-style');
            const mainStyle = globalState.scene.artStyle.toLowerCase().replace(/\s+/g, '-');
            const substyleSetting = `scene-substyle-${mainStyle}`;
            if (PATH_OPTIONS[substyleSetting]) {
                scenePathDisplay.innerHTML += createDisplayGem(PATH_OPTIONS[substyleSetting].title, globalState.scene.substyle, substyleSetting);
            }
        }

        function updateSettingPathDisplay() {
            settingPathDisplay.innerHTML = '';
            settingPathDisplay.innerHTML += createDisplayGem('Art Style', globalState.setting.artStyle, 'setting-art-style');
            const mainStyle = globalState.setting.artStyle.toLowerCase().replace(/\s+/g, '-');
            const substyleSetting = `setting-substyle-${mainStyle}`;
            if (PATH_OPTIONS[substyleSetting]) {
                settingPathDisplay.innerHTML += createDisplayGem(PATH_OPTIONS[substyleSetting].title, globalState.setting.substyle, substyleSetting);
            }
        }

        function updateSidebarGems(container, gemList) {
            container.innerHTML = '';
            gemList.forEach(gemInfo => {
                const settingConfig = PATH_OPTIONS[gemInfo.setting];
                if (!settingConfig) return;
                const currentValue = globalState[settingConfig.stateObject][settingConfig.stateKey];
                const button = document.createElement('button');
                button.className = 'path-gem';
                button.dataset.setting = gemInfo.setting;
                button.innerHTML = `<span class="path-gem-label">${settingConfig.title}:</span><span class="path-gem-value">${currentValue || ''}</span>`;
                if (currentValue) {
                    button.classList.add('has-value');
                }
                container.appendChild(button);
            });
        }

        function updateAllSidebarGems() {
            const formGems = [
                { setting: 'brainstorm-type' }, { setting: 'target-audience' },
                { setting: 'outline-structure' }, { setting: 'treatment-format' },
                { setting: 'writing-style' }
            ];
            const optionalGems = [
                { setting: 'plot' }, { setting: 'conflict' }, { setting: 'theme' },
                { setting: 'pointOfView' }, { setting: 'tone' }, { setting: 'symbolism' }
            ];
            updateSidebarGems(formGuidanceGemsContainer, formGems);
            updateSidebarGems(optionalGemsContainer, optionalGems);
        }

        function handleOptionSelection(setting, option) {
            const settingConfig = PATH_OPTIONS[setting];
            const stateKey = settingConfig.stateKey;
            const stateObject = globalState[settingConfig.stateObject];

            if (setting.endsWith('-art-style') && stateObject[stateKey] !== option) {
                if (setting === 'storyboard-art-style') globalState.story.storyboardSubstyle = '';
                else globalState[settingConfig.stateObject].substyle = '';
            }

            if (option === 'Other...') {
                pathModalCustomInputContainer.classList.remove('hidden');
                pathModalCustomLabel.textContent = `Enter custom ${settingConfig.title.toLowerCase()}:`;
                pathModalCustomInput.value = '';
                pathModalCustomInput.focus();
                const newSaveBtn = pathModalCustomSaveBtn.cloneNode(true);
                pathModalCustomSaveBtn.parentNode.replaceChild(newSaveBtn, pathModalCustomSaveBtn);
                pathModalCustomSaveBtn = newSaveBtn;
                pathModalCustomSaveBtn.addEventListener('click', () => {
                    const customValue = pathModalCustomInput.value.trim();
                    if (customValue) {
                        stateObject[stateKey] = customValue;
                        closePathModal();
                    }
                });
            } else {
                stateObject[stateKey] = option;
                closePathModal();
            }
        }

        function openPathModal(setting) {
            pathModalContent.innerHTML = '';
            pathModalCustomInputContainer.classList.add('hidden');
            const settingConfig = PATH_OPTIONS[setting];
            if (!settingConfig) return;

            const stateObject = globalState[settingConfig.stateObject];
            pathModalTitle.textContent = `Select ${settingConfig.title}`;

            for (const groupName in settingConfig.options) {
                const groupContainer = document.createElement('div');
                groupContainer.innerHTML = `<h3 class="w-full text-sm font-semibold text-gray-400 mt-4 first:mt-0 mb-2">${groupName}</h3>`;
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
                    button.addEventListener('click', () => handleOptionSelection(setting, option));
                    buttonContainer.appendChild(button);
                });
                pathModalContent.appendChild(groupContainer);
            }

            pathSettingsModal.classList.remove('hidden');
            pathSettingsModal.classList.add('flex');
            setTimeout(() => pathSettingsModal.style.opacity = 1, 10);
        }

        function closePathModal() {
            pathSettingsModal.style.opacity = 0;
            setTimeout(() => {
                pathSettingsModal.classList.add('hidden');
                pathSettingsModal.classList.remove('flex');
                pathModalCustomInputContainer.classList.add('hidden');
            }, 250);
            updateAllSidebarGems();
            updateCharacterPathDisplay();
            updateScenePathDisplay();
            updateSettingPathDisplay();
            updateStoryboardStyleGems();
            saveStateToLocalStorage();
        }

        function openAssetModal(assetId, assetType) {
            const asset = globalState.assets[assetType].find(a => a.id === assetId);
            if (!asset) return;

            assetModalTitle.textContent = asset.fileName;
            assetModalContent.innerHTML = '';

            if (asset.type === 'image') {
                assetModalContent.innerHTML = `<img src="${asset.content}" class="rounded w-full h-auto max-h-[50vh] object-contain">`;
            } else if (asset.type === 'text') {
                assetModalContent.innerHTML = `<pre class="whitespace-pre-wrap text-sm w-full h-full">${asset.content}</pre>`;
            } else if (asset.type === 'json') {
                assetModalContent.innerHTML = `<pre class="whitespace-pre-wrap text-sm w-full h-full">${JSON.stringify(asset.content, null, 2)}</pre>`;
            }

            assetModalNotes.value = asset.notes || '';
            assetModalIncludeCheckbox.checked = asset.includeInPrompt;

            const newDeleteBtn = assetModalDeleteBtn.cloneNode(true);
            assetModalDeleteBtn.parentNode.replaceChild(newDeleteBtn, assetModalDeleteBtn);
            assetModalDeleteBtn = newDeleteBtn;
            assetModalDeleteBtn.addEventListener('click', () => {
                if(confirm(`Are you sure you want to delete "${asset.fileName}"?`)) {
                    globalState.assets[assetType] = globalState.assets[assetType].filter(a => a.id !== assetId);
                    renderAssets(assetType);
                    saveStateToLocalStorage();
                    closeAssetModal();
                }
            });

            const newIncludeCheckbox = assetModalIncludeCheckbox.cloneNode(true);
            assetModalIncludeCheckbox.parentNode.replaceChild(newIncludeCheckbox, assetModalIncludeCheckbox);
            assetModalIncludeCheckbox = newIncludeCheckbox;
            assetModalIncludeCheckbox.addEventListener('change', (e) => {
                asset.includeInPrompt = e.target.checked;
                saveStateToLocalStorage();
            });

            const newNotesTextarea = assetModalNotes.cloneNode(true);
            assetModalNotes.parentNode.replaceChild(newNotesTextarea, assetModalNotes);
            assetModalNotes = newNotesTextarea;
            assetModalNotes.value = asset.notes || '';
            assetModalNotes.addEventListener('input', (e) => {
                asset.notes = e.target.value;
                saveStateToLocalStorage();
            });

            assetPreviewModal.classList.remove('hidden');
            assetPreviewModal.classList.add('flex');
            setTimeout(() => assetPreviewModal.style.opacity = 1, 10);
        }

        function closeAssetModal() {
            assetPreviewModal.style.opacity = 0;
            setTimeout(() => {
                assetPreviewModal.classList.add('hidden');
                assetPreviewModal.classList.remove('flex');
            }, 250);
        }

        function showStatus(message, isError = false) {
            const statusMessage = document.getElementById('status-message');
            statusMessage.textContent = message;
            statusMessage.style.color = isError ? '#ef4444' : '#9ca3af';
            statusMessage.style.opacity = '1';
            setTimeout(() => { statusMessage.style.opacity = '0'; }, 3000);
        }

        function cleanAndFormat(text) {
            if (!text) return '';
            return text
                .replace(/^\s*#\s(.*)$/gm, '<h3>$1</h3>')
                .replace(/^\s*##\s(.*)$/gm, '<h4>$1</h4>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n/g, '<br>');
        }

        async function callGeminiAPI(prompt, loaderElement) {
            if (loaderElement) loaderElement.classList.remove('hidden');
            for (let i = 0, delay = 1000; i < 3; i++, delay *= 2) {
                try {
                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${userApiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                    });
                    if (response.ok) {
                        const result = await response.json();
                        if(loaderElement) loaderElement.classList.add('hidden');
                        return result.candidates?.[0]?.content?.parts?.[0]?.text;
                    }
                    const errorData = await response.json().catch(() => ({}));
                    if (errorData.error?.message.includes("API key not valid")) {
                        showStatus("Error: API Key is not valid. Please check settings.", true);
                        openModal('settings');
                        if(loaderElement) loaderElement.classList.add('hidden');
                        return `Error: ${errorData.error.message}`;
                    }
                    if ((response.status === 503 || response.status === 429) && i < 2) {
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                    if(loaderElement) loaderElement.classList.add('hidden');
                    throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
                } catch (e) {
                    if (i === 2) {
                        console.error(e);
                        if(loaderElement) loaderElement.classList.add('hidden');
                        return `Error: ${e.message}`;
                    }
                }
            }
        }

        async function callImagenAPI(positivePrompt, negativePrompt) {
            if (!userApiKey) {
                showStatus("API Key is missing for image generation.", true);
                openModal('settings');
                return null;
            }
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${userApiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        instances: [{ prompt: positivePrompt, negativePrompt: negativePrompt }],
                        parameters: { "sampleCount": 1 }
                    })
                });
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
                showStatus(`Image Gen Error: ${e.message}`, true);
                return null;
            }
        }

        function autoResizeTextarea(event) {
            const textarea = event.target;
            textarea.style.height = 'auto';
            textarea.style.height = (textarea.scrollHeight) + 'px';
        }

        function getAssetContextForAI(assetType = 'story') {
            const includedAssets = globalState.assets[assetType].filter(asset => asset.includeInPrompt);
            if (includedAssets.length === 0) return "";
            let context = "\n\n--- ASSETS CONTEXT ---\n";
            includedAssets.forEach(asset => {
                context += `\n[${asset.fileName} | Label: ${asset.label || 'N/A'}]\n`;
                if (asset.notes) context += `Notes: ${asset.notes}\n`;
                if (asset.type === 'json' && asset.content) {
                    if (asset.content.name && asset.content.personality) context += `Type: Character\n  Name: ${asset.content.name}\n  Description: ${asset.content['core-description'] || ''}\n`;
                    else if (asset.content['location-name'] && asset.content.atmosphere) context += `Type: Scene\n  Location: ${asset.content['location-name']}\n  Description: ${asset.content.overview || ''}\n`;
                } else if (asset.type === 'text' && asset.content) {
                    context += `Content:\n${asset.content}\n`;
                }
            });
            context += "--- END ASSETS CONTEXT ---\n\n";
            return context;
        }

        function addAssetToState(assetData, assetType) {
            const asset = { id: `asset-${Date.now()}-${Math.random()}`, label: '', notes: '', includeInPrompt: true, ...assetData };
            globalState.assets[assetType].push(asset);
            renderAssets(assetType);
            showStatus(`Asset "${assetData.fileName}" loaded to ${assetType} tool.`);
        }

        function renderAssets(assetType) {
            const container = assetContainers[assetType];
            if (!container) return;
            container.innerHTML = '';
            if (assetType === 'story') {
                const assetGroups = { character: [], scene: [], setting: [], image: [], text: [] };
                globalState.assets.story.forEach(asset => {
                    if (asset.type === 'image') assetGroups.image.push(asset);
                    else if (asset.type === 'text') assetGroups.text.push(asset);
                    else if (asset.type === 'json' && asset.content) {
                        if (asset.content.characterName || (asset.content.name && asset.content.personality)) assetGroups.character.push(asset);
                        else if (asset.content.sceneName || asset.content['location-name']) assetGroups.scene.push(asset);
                        else if (asset.content.settingName || asset.content.corePremise) assetGroups.setting.push(asset);
                        else assetGroups.text.push(asset);
                    }
                });
                const renderGroup = (title, assets) => {
                    if (assets.length === 0) return;
                    container.innerHTML += `<h4 class="text-md font-semibold text-blue-300 border-b border-gray-700 pb-1 mb-2 mt-3">${title}</h4>`;
                    assets.forEach(asset => renderAssetCard(asset, assetType, container));
                };
                renderGroup('Characters', assetGroups.character);
                renderGroup('Scenes', assetGroups.scene);
                renderGroup('Settings', assetGroups.setting);
                renderGroup('Images', assetGroups.image);
                renderGroup('Other Text', assetGroups.text);
            } else {
                globalState.assets[assetType].forEach(asset => renderAssetCard(asset, assetType, container));
            }
        }

        function renderAssetCard(asset, assetType, container) {
            const card = document.createElement('button');
            card.className = 'asset-card !p-2 !text-left w-full hover:border-blue-500 transition-colors flex items-center min-h-[40px]';
            card.dataset.id = asset.id;
            card.dataset.assetType = assetType;
            const cleanTitle = asset.fileName.replace(/\.(char|scen|sett)\b/g, '').replace(/\.[^/.]+$/, "");
            card.innerHTML = `<strong class="text-blue-400 pointer-events-none break-words text-sm font-semibold">${cleanTitle}</strong>`;
            container.appendChild(card);
        }

        const settingsModal = document.getElementById('settings-modal');
        const projectModal = document.getElementById('project-modal');
        const apiKeyInput = document.getElementById('api-key-input');

        function openModal(type) {
            const modal = (type === 'settings') ? settingsModal : projectModal;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            setTimeout(() => modal.style.opacity = 1, 10);
        }

        function closeModal(type) {
            const modal = (type === 'settings') ? settingsModal : projectModal;
            modal.style.opacity = 0;
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }, 250);
        }

        function saveApiKey() {
            const key = apiKeyInput.value.trim();
            localStorage.setItem('writerAIdApiKey', key);
            userApiKey = key;
            showStatus(key ? "API Key saved." : "API Key removed.");
            closeModal('settings');
        }

        function loadApiKey() {
            let key = localStorage.getItem('writerAIdApiKey');
            if (!key) key = localStorage.getItem('geminiApiKey');
            if (!key) key = localStorage.getItem('googleApiKey');
            userApiKey = key || '';
            apiKeyInput.value = userApiKey;
            if (key) localStorage.setItem('writerAIdApiKey', key);
        }

        function saveStateToLocalStorage() {
            try {
                const projectData = { ...globalState, editorContent: mainEditor.innerHTML };
                localStorage.setItem('writerAIdProject', JSON.stringify(projectData));
            } catch (error) { showStatus("Could not save project data.", true); }
        }

        function loadStateFromLocalStorage() {
            try {
                const savedData = localStorage.getItem('writerAIdProject');
                if (savedData) {
                    updateUiFromState(JSON.parse(savedData));
                    showStatus("Project restored from last session.");
                }
            } catch (error) {
                showStatus("Failed to load saved project.", true);
                localStorage.removeItem('writerAIdProject');
            }
        }

        function updateUiFromState(data) {
            if (data.story) Object.assign(globalState.story, data.story);
            if (data.character) Object.assign(globalState.character, data.character);
            if (data.scene) Object.assign(globalState.scene, data.scene);
            if (data.setting) Object.assign(globalState.setting, data.setting);
            if (data.assets) Object.assign(globalState.assets, data.assets);
            globalState.projectTitle = data.projectTitle || 'Untitled Project';
            projectTitleEl.textContent = globalState.projectTitle;
            mainEditor.innerHTML = data.editorContent || '';
            chosenIdeaDisplay.innerHTML = globalState.story.brainstormConcept || `<span class="text-gray-500">Select a concept...</span>`;
            if (globalState.story.storyOutline) {
                const formatted = cleanAndFormat(globalState.story.storyOutline);
                chosenOutlineDisplay.innerHTML = `<div class="prose prose-invert max-w-none text-gray-300 text-sm">${formatted}</div>`;
                outlineOutput.innerHTML = `<div class="bg-gray-900 p-6 rounded-lg shadow-inner"><div class="prose prose-invert max-w-none">${formatted}</div></div><button id="use-outline-btn" class="mt-6 w-full py-3 px-4 rounded-lg font-semibold btn-primary">Develop Treatment →</button>`;
            } else {
                 chosenOutlineDisplay.innerHTML = `<span class="text-gray-500">Generate or paste an outline.</span>`;
                 outlineOutput.innerHTML = '';
            }
            if (globalState.story.storyTreatment) {
                const formatted = cleanAndFormat(globalState.story.storyTreatment);
                treatmentOutput.innerHTML = `<div class="bg-gray-900 p-6 rounded-lg shadow-inner"><div class="prose prose-invert max-w-none">${formatted}</div></div><button id="use-treatment-btn" class="mt-6 w-full py-3 px-4 rounded-lg font-semibold btn-primary">Start Writing →</button>`;
                writeTreatmentReference.innerHTML = formatted;
            } else {
                 treatmentOutput.innerHTML = '';
                 writeTreatmentReference.innerHTML = `<span class="text-gray-500">Your treatment will appear here.</span>`;
            }
            renderAssets('story');
            renderAssets('character');
            renderAssets('scene');
            renderAssets('setting');
            updateAllSidebarGems();
            updateCharacterPathDisplay();
            updateScenePathDisplay();
            updateSettingPathDisplay();
            updateStoryboardStyleGems();
        }

        function handleJsonLoad(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (confirm("Loading this file will overwrite your current project. Are you sure?")) {
                        updateUiFromState(data);
                        showStatus("Project loaded successfully.");
                        closeModal('project');
                    }
                } catch (error) { alert("Error: Invalid JSON file."); }
            };
            reader.readAsText(file);
            event.target.value = null;
        }

        function sanitizeFilename(name) { return (name || 'untitled').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }

        function exportToJson() {
            const projectData = { ...globalState, editorContent: mainEditor.innerHTML };
            const dataStr = JSON.stringify(projectData, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${sanitizeFilename(globalState.projectTitle)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showStatus("Project exported as JSON.");
            closeModal('project');
        }

        function htmlToText(html) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            return tempDiv.textContent || tempDiv.innerText || "";
        }

        function exportAsText() {
            const separator = "\n\n========================================\n\n";
            let textContent = `PROJECT TITLE: ${globalState.projectTitle}\n`;
            textContent += separator + "BRAINSTORM CONCEPT:\n\n" + htmlToText(globalState.story.brainstormConcept);
            textContent += separator + "STORY OUTLINE:\n\n" + globalState.story.storyOutline;
            textContent += separator + "STORY TREATMENT:\n\n" + globalState.story.storyTreatment;
            textContent += separator + "YOUR STORY:\n\n" + htmlToText(mainEditor.innerHTML);
            const blob = new Blob([textContent], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${sanitizeFilename(globalState.projectTitle)}.txt`;
            a.click();
            URL.revokeObjectURL(url);
            showStatus("Project exported as Text.");
            closeModal('project');
        }

        function clearProject() {
            if (confirm("Are you sure you want to clear your entire project?")) {
                localStorage.removeItem('writerAIdProject');
                const initialState = {
                    projectTitle: 'Untitled Project',
                    story: {
                        brainstormConcept: '', storyOutline: '', storyTreatment: '',
                        storyboardArtStyle: 'Painting', storyboardSubstyle: '',
                        brainstormType: '', outlineStructure: '',
                        writingFormat: '', targetAudience: '',
                        writingStyle: '',
                        plot: '', conflict: '', theme: '', pointOfView: '', tone: '', symbolism: ''
                    },
                    character: { artStyle: 'Painting', substyle: '', pose: 'Close Up' },
                    scene: { artStyle: 'Painting', substyle: '' },
                    setting: { artStyle: 'Painting', substyle: '' },
                    assets: { story: [], character: [], scene: [], setting: [] },
                    editorContent: ''
                };
                updateUiFromState(initialState);
                ideasOutput.innerHTML = '';
                outlineOutput.innerHTML = '';
                treatmentOutput.innerHTML = '';
                storyboardOutput.innerHTML = '';
                resetAllToolForms();
                showStatus("New project started.");
                closeModal('project');
            }
        }

        function printProject() {
            const checks = {
                brainstorm: document.getElementById('print-check-brainstorm').checked,
                outline: document.getElementById('print-check-outline').checked,
                treatment: document.getElementById('print-check-treatment').checked,
                story: document.getElementById('print-check-story').checked,
                storyboard: document.getElementById('print-check-storyboard').checked,
            };
            let content = '';
            if (checks.brainstorm && globalState.story.brainstormConcept) content += `<h2>Brainstorm Concept</h2><div>${globalState.story.brainstormConcept}</div>`;
            if (checks.outline && globalState.story.storyOutline) content += `<h2>Story Outline</h2><div>${cleanAndFormat(globalState.story.storyOutline)}</div>`;
            if (checks.treatment && globalState.story.storyTreatment) content += `<h2>Story Treatment</h2><div>${cleanAndFormat(globalState.story.storyTreatment)}</div>`;
            if (checks.story && mainEditor.innerHTML) content += `<h2>Your Story</h2><div>${mainEditor.innerHTML}</div>`;
            if (checks.storyboard && storyboardOutput.innerHTML.trim() !== '') content += `<h2>Storyboard</h2><div class="storyboard-print-container">${storyboardOutput.innerHTML}</div>`;

            if (!content.trim()) { showStatus("No content selected to print.", true); return; }

            const printWindow = window.open('', '_blank');
            printWindow.document.write(`<html><head><title>Print - ${globalState.projectTitle}</title><style>body{font-family:sans-serif;line-height:1.6} h1{font-size:2em} h2{font-size:1.5em;margin-top:1.5em} .storyboard-print-container{display:grid;grid-template-columns:1fr 1fr;gap:20px} img{max-width:100%}</style></head><body><h1>${globalState.projectTitle}</h1>${content}</body></html>`);
            printWindow.document.close();
            printWindow.print();
        }

        const tabButtons = document.querySelectorAll('.main-tab-btn');
        const storyWeaverContentWrapper = document.getElementById('story-weaver-content-wrapper');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTabId = button.dataset.tab;
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                document.querySelectorAll('.tab-content').forEach(tc => tc.style.display = 'none');
                storyWeaverContentWrapper.style.display = 'none';

                if (targetTabId === 'story-weaver') {
                    storyWeaverContentWrapper.style.display = 'grid';
                    document.getElementById('story-weaver').style.display = 'block';
                } else {
                    document.getElementById(targetTabId).style.display = 'block';
                }
            });
        });

        function updateStoryboardStyleGems() {
            const container = document.getElementById('storyboard-style-gems-container');
            container.innerHTML = '';
            container.innerHTML += createDisplayGem('Art Style', globalState.story.storyboardArtStyle, 'storyboard-art-style');
            const mainStyle = globalState.story.storyboardArtStyle.toLowerCase().replace(/\s+/g, '-');
            const substyleSetting = `storyboard-substyle-${mainStyle}`;
            if (PATH_OPTIONS[substyleSetting]) {
                container.innerHTML += createDisplayGem(PATH_OPTIONS[substyleSetting].title, globalState.story.storyboardSubstyle, substyleSetting);
            }
        }

        function initStoryWeaver() {
            const navButtons = document.querySelectorAll('aside .nav-btn-side');
            const stages = document.querySelectorAll('#story-weaver .stage');
            const generateIdeasBtn = document.getElementById('generate-ideas-btn');
            const generateOutlineBtn = document.getElementById('generate-outline-btn');
            const generateTreatmentBtn = document.getElementById('generate-treatment-btn');
            const generateStoryboardBtn = document.getElementById('generate-storyboard-btn');
            const saveStoryboardBtn = document.getElementById('save-storyboard-btn');
            const reiterateStoryboardBtn = document.getElementById('reiterate-storyboard-btn');
            const storyboardDescription = document.getElementById('storyboard-description');
            const storyboardPanels = document.getElementById('storyboard-panels');
            const storyboardLoader = document.getElementById('storyboard-loader');
            const storyboardSecondaryGuidance = document.getElementById('storyboard-secondary-guidance');
            const storyboardSaveContainer = document.getElementById('storyboard-save-container');

            function setActiveStage(stageName) {
                stages.forEach(s => s.classList.toggle('active', s.id === stageName));
                navButtons.forEach(b => b.classList.toggle('active', b.dataset.stage === stageName));
            }

            async function handleStoryboardGeneration() {
                const description = storyboardDescription.value.trim();
                if (!description) { showStatus("Please enter a scene description.", true); return; }
                const numPanels = parseInt(storyboardPanels.value, 10);
                const style = globalState.story.storyboardArtStyle;
                const substyle = globalState.story.storyboardSubstyle;

                storyboardLoader.classList.remove('hidden');
                storyboardOutput.innerHTML = '';
                generateStoryboardBtn.disabled = true;
                storyboardSaveContainer.classList.add('hidden');

                const assetContext = getAssetContextForAI('story');
                const secondaryGuidance = storyboardSecondaryGuidance.value.trim();

                const seedPrompt = `You are a film director's assistant creating a visual style guide. Synthesize all information into a concise, comma-separated list of keywords for an AI image generator.
                **CONTEXT:** ${assetContext}
                **SCENE:** ${description}
                **GUIDANCE:** ${secondaryGuidance}
                Your output must be a single line of descriptive keywords.`;
                const visualSeed = await callGeminiAPI(seedPrompt);
                globalState.story.storyboardVisualSeed = visualSeed;

                const panelPrompt = `As a film director, break this scene into ${numPanels} storyboard panels: "${description}". For each panel, provide only a concise visual description for an AI image generator, separated by '---'.`;
                const panelDescriptionsText = await callGeminiAPI(panelPrompt);

                if (!panelDescriptionsText || panelDescriptionsText.startsWith("Error:")) {
                    showStatus(panelDescriptionsText || "Failed to generate panel descriptions.", true);
                    storyboardLoader.classList.add('hidden');
                    generateStoryboardBtn.disabled = false;
                    return;
                }
                const panelPrompts = panelDescriptionsText.split('---').map(p => p.trim()).filter(Boolean);
                globalState.story.storyboardPanelPrompts = panelPrompts;

                const imagePromises = panelPrompts.map(prompt => callImagenAPI(`${visualSeed}, ${prompt}, ${substyle}, ${style} style`, "text, watermark, signature, ugly, deformed, blurry"));
                const generatedImages = await Promise.all(imagePromises);

                storyboardLoader.classList.add('hidden');
                generateStoryboardBtn.disabled = false;

                generatedImages.forEach((imageUrl, index) => {
                    storyboardOutput.innerHTML += `
                        <div class="storyboard-panel relative" data-index="${index}">
                            <div class="aspect-video bg-gray-900 flex items-center justify-center">
                                ${imageUrl ? `<img src="${imageUrl}" class="w-full h-full object-cover">` : `<div class="p-4 text-red-400">Failed.</div>`}
                            </div>
                            <input type="checkbox" class="storyboard-checkbox absolute top-2 right-2 h-6 w-6 rounded text-blue-500 bg-gray-900/50 border-gray-500 focus:ring-blue-500">
                            <div class="p-3 text-xs text-gray-400"><p>${index + 1}. ${panelPrompts[index] || ''}</p></div>
                        </div>`;
                });
                if (generatedImages.some(img => img)) storyboardSaveContainer.classList.remove('hidden');
            }

            async function handleStoryboardReiteration() {
                const selectedCheckboxes = document.querySelectorAll('#storyboard-output .storyboard-checkbox:checked');
                if (selectedCheckboxes.length === 0) { showStatus('Please select at least one image to reiterate.', true); return; }

                reiterateStoryboardBtn.disabled = true;
                saveStoryboardBtn.disabled = true;
                reiterateStoryboardBtn.textContent = 'Reiterating...';

                const { storyboardVisualSeed, storyboardArtStyle, storyboardSubstyle } = globalState.story;
                if (!storyboardVisualSeed) {
                    showStatus('Error: Visual seed not found. Please regenerate the storyboard.', true);
                    reiterateStoryboardBtn.disabled = false;
                    saveStoryboardBtn.disabled = false;
                    reiterateStoryboardBtn.textContent = 'Reiterate Selected Images';
                    return;
                }

                const reiterationPromises = Array.from(selectedCheckboxes).map(checkbox => {
                    const panelDiv = checkbox.closest('.storyboard-panel');
                    const panelIndex = parseInt(panelDiv.dataset.index, 10);
                    const originalPrompt = globalState.story.storyboardPanelPrompts[panelIndex];
                    panelDiv.querySelector('.aspect-video').innerHTML = `<div class="panel-loader loader" style="margin: auto;"></div>`;
                    const newPrompt = `Reiterate and refine this image. Maintain consistency with: "${storyboardVisualSeed}". Shot: "${originalPrompt}". Style: "${storyboardSubstyle}, ${storyboardArtStyle}".`;
                    return callImagenAPI(newPrompt, "text, watermark, signature, ugly, deformed, blurry").then(imageUrl => ({ panelDiv, imageUrl }));
                });
                const results = await Promise.all(reiterationPromises);
                results.forEach(({ panelDiv, imageUrl }) => {
                    const imgContainer = panelDiv.querySelector('.aspect-video');
                    imgContainer.innerHTML = imageUrl ? `<img src="${imageUrl}" class="w-full h-full object-cover">` : `<div class="p-4 text-red-400">Reiteration Failed.</div>`;
                    panelDiv.querySelector('.storyboard-checkbox').checked = false;
                });
                reiterateStoryboardBtn.disabled = false;
                saveStoryboardBtn.disabled = false;
                reiterateStoryboardBtn.textContent = 'Reiterate Selected Images';
                showStatus(`Reiterated ${results.length} image(s).`);
            }

            navButtons.forEach(btn => btn.addEventListener('click', () => setActiveStage(btn.dataset.stage)));
            generateIdeasBtn.addEventListener('click', async () => {
                const brainstormInput = document.getElementById('brainstorm-input');
                const concept = brainstormInput.value.trim();
                if (!concept) { showStatus("Please enter a theme or concept to brainstorm.", true); return; }

                document.getElementById('ideas-loader').classList.remove('hidden');
                ideasOutput.innerHTML = '';
                generateIdeasBtn.disabled = true;

                const guidance = document.getElementById('brainstorm-secondary-guidance').value.trim();
                const prompt = `Brainstorm 6 unique concepts for the theme: "${concept}". Type: ${globalState.story.brainstormType || 'Story Ideas'}. Guidance: ${guidance}. Context: ${getAssetContextForAI('story')}. Format each with a title and paragraph, separated by '---'.`;
                const result = await callGeminiAPI(prompt, document.getElementById('ideas-loader'));
                generateIdeasBtn.disabled = false;

                if (result && !result.startsWith("Error:")) {
                    ideasOutput.innerHTML = result.split('---').map(idea => idea.trim()).filter(Boolean).map(idea => {
                        const titleMatch = idea.match(/^\s*(?:\*\*|#+\s*)?(.*?)(?:\*\*|#+)?\s*\n/);
                        const title = titleMatch ? titleMatch[1].replace(/\*/g, '').trim() : 'Concept';
                        const description = titleMatch ? idea.substring(titleMatch[0].length).trim() : idea;
                        return `<div class="idea-card bg-gray-900 p-6 rounded-lg cursor-pointer hover:border-blue-500"><h3 class="text-xl font-bold text-blue-400 mb-2">${title}</h3><p class="text-gray-400">${description}</p></div>`;
                    }).join('');
                } else {
                    ideasOutput.innerHTML = `<p class="text-red-400">Failed to generate ideas. ${result || ''}</p>`;
                }
            });

            ideasOutput.addEventListener('click', (e) => {
                const card = e.target.closest('.idea-card');
                if (!card) return;
                document.querySelectorAll('.idea-card').forEach(c => c.classList.remove('selected-card'));
                card.classList.add('selected-card');
                const title = card.querySelector('h3').textContent;
                globalState.story.brainstormConcept = `<h3>${title}</h3><p>${card.querySelector('p').textContent}</p>`;
                chosenIdeaDisplay.innerHTML = globalState.story.brainstormConcept;
                showStatus(`Concept "${title}" selected.`);
                setActiveStage('outline');
            });

            generateOutlineBtn.addEventListener('click', async () => {
                const concept = chosenIdeaDisplay.textContent.trim();
                if (!concept || concept.includes('Select a concept')) { showStatus("Please select or enter a concept first.", true); return; }

                document.getElementById('outline-loader').classList.remove('hidden');
                outlineOutput.innerHTML = '';
                generateOutlineBtn.disabled = true;

                const guidance = document.getElementById('outline-secondary-guidance').value.trim();
                const prompt = `Create a detailed story outline for: "${concept}". Structure: ${globalState.story.outlineStructure || 'Three-Act Structure'}. Audience: ${globalState.story.targetAudience || 'Young Adult'}. Guidance: ${guidance}. Context: ${getAssetContextForAI('story')}. Format with Markdown headings.`;
                const result = await callGeminiAPI(prompt, document.getElementById('outline-loader'));
                generateOutlineBtn.disabled = false;

                if (result && !result.startsWith("Error:")) {
                    globalState.story.storyOutline = result;
                    const formattedResult = cleanAndFormat(result);
                    outlineOutput.innerHTML = `<div class="bg-gray-900 p-6 rounded-lg shadow-inner"><div class="prose prose-invert max-w-none">${formattedResult}</div></div><button id="use-outline-btn" class="mt-6 w-full py-3 px-4 rounded-lg font-semibold btn-primary">Develop Treatment →</button>`;
                    chosenOutlineDisplay.innerHTML = `<div class="prose prose-invert max-w-none text-gray-300 text-sm">${formattedResult}</div>`;
                } else {
                    outlineOutput.innerHTML = `<p class="text-red-400">Failed to generate outline. ${result || ''}</p>`;
                }
            });

            outlineOutput.addEventListener('click', e => { if (e.target.id === 'use-outline-btn') setActiveStage('treatment'); });

            generateTreatmentBtn.addEventListener('click', async () => {
                if (!globalState.story.storyOutline) { showStatus("Please generate or enter an outline first.", true); return; }

                document.getElementById('treatment-loader').classList.remove('hidden');
                treatmentOutput.innerHTML = '';
                generateTreatmentBtn.disabled = true;

                const guidance = document.getElementById('treatment-secondary-guidance').value.trim();
                const prompt = `Expand this outline into a detailed story treatment: \n${globalState.story.storyOutline}\n Format: ${globalState.story.writingFormat || 'Short Story'}. Style: ${globalState.story.writingStyle || 'Casual'}. Guidance: ${guidance}. Context: ${getAssetContextForAI('story')}. Write in a narrative format.`;
                const result = await callGeminiAPI(prompt, document.getElementById('treatment-loader'));
                generateTreatmentBtn.disabled = false;

                if (result && !result.startsWith("Error:")) {
                    globalState.story.storyTreatment = result;
                    const formattedResult = cleanAndFormat(result);
                    treatmentOutput.innerHTML = `<div class="bg-gray-900 p-6 rounded-lg shadow-inner"><div class="prose prose-invert max-w-none">${formattedResult}</div></div><button id="use-treatment-btn" class="mt-6 w-full py-3 px-4 rounded-lg font-semibold btn-primary">Start Writing →</button>`;
                    writeTreatmentReference.innerHTML = formattedResult;
                } else {
                    treatmentOutput.innerHTML = `<p class="text-red-400">Failed to generate treatment. ${result || ''}</p>`;
                }
            });

            treatmentOutput.addEventListener('click', e => { if (e.target.id === 'use-treatment-btn') setActiveStage('write'); });
            saveStoryboardBtn.addEventListener('click', () => {
                document.querySelectorAll('#storyboard-output .storyboard-checkbox:checked').forEach((checkbox, index) => {
                    const img = checkbox.closest('.storyboard-panel').querySelector('img');
                    if (img?.src) {
                        const a = document.createElement('a');
                        a.href = img.src;
                        a.download = `${sanitizeFilename(globalState.projectTitle)}-storyboard-${index + 1}.png`;
                        a.click();
                    }
                });
            });
            generateStoryboardBtn.addEventListener('click', handleStoryboardGeneration);
            reiterateStoryboardBtn.addEventListener('click', handleStoryboardReiteration);
            updateStoryboardStyleGems();
        }

        function initCharacterTool() {
            const container = document.getElementById('character-tool');
            if(!container) return;
            const outputContainer = container.querySelector('#char-outputs');
            const generateTextBtn = container.querySelector('#generate-text-btn-char');
            const generateImageBtn = container.querySelector('#generate-image-btn-char');
            const form = container.querySelector('#character-form-unified');
            const imageElements = {
                spinner: container.querySelector('#loading-spinner-image-char'),
                img: container.querySelector('#generated-image-char'),
                placeholder: container.querySelector('#image-placeholder-char'),
                downloadBtn: container.querySelector('#download-image-btn-char')
            };

            if(outputContainer.children.length === 0) {
                ['Workup', 'Markdown', 'JSON'].forEach(format => {
                    const formatId = format.toLowerCase();
                    outputContainer.innerHTML += `
                        <div class="bg-gray-800 p-6 rounded-lg shadow-lg output-container">
                            <div class="flex justify-between items-center cursor-pointer toggle-btn">
                                <h2 class="text-xl font-bold text-white">${format}</h2>
                                <div class="flex items-center space-x-2">
                                     <button class="copy-btn btn-secondary py-1 px-2 text-xs rounded" data-target="output-${formatId}-char">Copy</button>
                                     <button class="save-btn btn-secondary py-1 px-2 text-xs rounded" data-target="output-${formatId}-char" data-format="${formatId === 'workup' ? 'txt' : formatId}">Save</button>
                                     <svg class="w-6 h-6 text-gray-400 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                            <div class="collapsible-content hidden mt-4"><div class="tool-output-box"><div id="loading-spinner-${formatId}-char" class="loader hidden"></div><pre id="output-${formatId}-char" class="whitespace-pre-wrap text-sm w-full h-full"></pre></div></div>
                        </div>`;
                });
            }

            async function handleTextGeneration() {
                if (!userApiKey) { showStatus("API Key is missing.", true); openModal('settings'); return; }
                generateTextBtn.disabled = true; generateTextBtn.textContent = 'Generating...';

                const allFieldsData = [], sectionsToGenerate = [];
                form.querySelectorAll('input.tool-input, textarea.tool-input').forEach(input => {
                    const fieldName = input.dataset.fieldName;
                    const label = document.querySelector(`label[for="char-${fieldName}"]`)?.textContent || fieldName;
                    const value = input.value.trim();
                    const toggle = input.closest('div').querySelector('.ai-toggle-btn');
                    if (value || toggle?.classList.contains('active')) {
                        allFieldsData.push(`- **${label}:** ${value}`);
                        if (toggle?.classList.contains('active')) sectionsToGenerate.push(label);
                    }
                });

                const secondaryGuidance = document.getElementById('char-secondary-guidance').value.trim();
                try {
                    const basePrompt = `Generate a cohesive character profile. DATA: ${allFieldsData.join('\n')}. CONTEXT: ${getAssetContextForAI('character')}. GUIDANCE: ${secondaryGuidance}. TASK: Integrate all data, generate content for empty fields, and refine these sections: **${sectionsToGenerate.join(', ')}**. Format with bold headings.`;
                    const workupOutput = await callGeminiAPI(basePrompt, document.getElementById('loading-spinner-workup-char'));
                    if (workupOutput.startsWith("Error:")) throw new Error(workupOutput);
                    document.getElementById('output-workup-char').textContent = workupOutput;

                    const markdownOutput = await callGeminiAPI(`Condense into a Markdown reference sheet:\n${workupOutput}`, document.getElementById('loading-spinner-markdown-char'));
                    if (markdownOutput.startsWith("Error:")) throw new Error(markdownOutput);
                    document.getElementById('output-markdown-char').textContent = markdownOutput;

                    const jsonOutput = await callGeminiAPI(`Distill into a simple JSON object (camelCase keys):\n${workupOutput}`, document.getElementById('loading-spinner-json-char'));
                    if (jsonOutput.startsWith("Error:")) throw new Error(jsonOutput);
                    document.getElementById('output-json-char').textContent = jsonOutput.replace(/```json|```/g, '');
                    showStatus('Character profile generated.');
                } catch (error) { showStatus(`Text Gen Error: ${error.message}`, true); }
                finally { generateTextBtn.disabled = false; generateTextBtn.textContent = 'Generate Full Profile'; }
            }

            async function handleImageGeneration() {
                if (!userApiKey) { showStatus("API Key is missing.", true); openModal('settings'); return; }
                generateImageBtn.disabled = true; generateImageBtn.textContent = 'Generating...';
                imageElements.spinner.classList.remove('hidden');
                imageElements.placeholder.style.display = 'none';
                imageElements.img.style.display = 'none';
                imageElements.downloadBtn.style.display = 'none';

                try {
                    const attributes = {};
                    form.querySelectorAll('input.tool-input, textarea.tool-input').forEach(input => attributes[input.dataset.fieldName] = input.value);
                    const { artStyle, substyle, pose } = globalState.character;
                    const imageGuidance = document.getElementById('char-image-guidance').value.trim();
                    let corePrompt = `a ${attributes.gender || 'character'}. Build: ${attributes.build}. Hair: ${attributes.hairColor}. Eyes: ${attributes.eyeColor}. Details: ${attributes.details}. Clothing: ${attributes.clothing}. Expression: ${attributes.expression}.`;
                    let posePromptPrefix = {
                        'Concept Sheet': 'Character concept sheet, multiple views, full body, detailed face, clean background.',
                        'In Scene': `Full body shot in a dynamic scene. Setting: ${attributes.background}.`,
                        'Action Pose': `Dynamic action pose. Setting: ${attributes.background}.`,
                        'Modeling Pose': `Full body, standing modeling pose.`
                    }[pose] || (!['Close Up'].includes(pose) ? `${pose} of a` : 'Close up portrait from the chest up.');

                    const positivePrompt = `${posePromptPrefix} ${corePrompt.replace(/\s+/g, ' ').trim()}, ${substyle}, ${artStyle} style, ${imageGuidance}`;
                    const negativePrompt = attributes.negative_prompts_char || 'blurry, low quality, text, watermark';
                    const imageUrl = await callImagenAPI(positivePrompt, negativePrompt);
                    if(imageUrl){
                        imageElements.img.src = imageUrl;
                        imageElements.img.style.display = 'block';
                        imageElements.downloadBtn.style.display = 'block';
                    } else {
                         imageElements.placeholder.innerHTML = `<span class="text-red-400">Image Error</span>`;
                         imageElements.placeholder.style.display = 'block';
                    }
                } catch (error) {
                    showStatus(`Image Gen Error: ${error.message}`, true);
                    imageElements.placeholder.innerHTML = `<span class="text-red-400">Image Error</span>`;
                    imageElements.placeholder.style.display = 'block';
                } finally {
                    imageElements.spinner.classList.add('hidden');
                    generateImageBtn.disabled = false; generateImageBtn.textContent = 'Generate Image';
                }
            }
            generateTextBtn.addEventListener('click', handleTextGeneration);
            generateImageBtn.addEventListener('click', handleImageGeneration);
            imageElements.downloadBtn.addEventListener('click', () => {
                const name = document.getElementById('char-name')?.value || 'character';
                const a = document.createElement('a'); a.href = imageElements.img.src; a.download = `${sanitizeFilename(name)}.char.png`; a.click();
            });
        }

        function initSceneBuilder() {
            // Placeholder for scene builder logic
        }

        function initSettingTool() {
            // Placeholder for setting tool logic
        }

        function resetAllToolForms() {
            // Placeholder for reset logic
        }

        function initToolInputs() {
            document.querySelectorAll('textarea.tool-input').forEach(textarea => {
                autoResizeTextarea({ target: textarea });
                textarea.addEventListener('input', autoResizeTextarea, false);
            });
        }

        function initToolForms() {
            // Placeholder for form initialization
        }

        loadApiKey();
        initStoryWeaver();
        initCharacterTool();
        initSceneBuilder();
        initSettingTool();
        initToolInputs();
        initToolForms();
        loadStateFromLocalStorage();

        // Final UI setup
        document.body.addEventListener('click', (e) => {
            const gemButton = e.target.closest('.path-gem');
            if (gemButton) {
                openPathModal(gemButton.dataset.setting);
            }

            const card = e.target.closest('.asset-card');
            if (card) {
                openAssetModal(card.dataset.id, card.dataset.assetType);
            }
        });

        projectTitleEl.addEventListener('blur', () => {
            globalState.projectTitle = projectTitleEl.textContent.trim() || 'Untitled Project';
            saveStateToLocalStorage();
        });

        mainEditor.addEventListener('input', saveStateToLocalStorage);

        document.getElementById('settings-btn').addEventListener('click', () => openModal('settings'));
        document.getElementById('close-settings-modal-btn').addEventListener('click', () => closeModal('settings'));
        document.getElementById('project-btn').addEventListener('click', () => openModal('project'));
        document.getElementById('close-project-modal-btn').addEventListener('click', () => closeModal('project'));

        document.getElementById('save-api-key-btn').addEventListener('click', saveApiKey);
        document.getElementById('new-project-btn').addEventListener('click', clearProject);
        document.getElementById('export-json-btn').addEventListener('click', exportToJson);
        document.getElementById('import-json-btn').addEventListener('click', () => jsonFileInput.click());
        jsonFileInput.addEventListener('change', handleJsonLoad);
        document.getElementById('export-text-btn').addEventListener('click', exportAsText);
        document.getElementById('print-btn').addEventListener('click', printProject);

        closeAssetModalBtn.addEventListener('click', closeAssetModal);

        updateAllSidebarGems();
        updateCharacterPathDisplay();
        updateScenePathDisplay();
        updateSettingPathDisplay();

        document.getElementById('character-tool').style.display = 'none';
        document.getElementById('scene-builder').style.display = 'none';
        document.getElementById('setting-tool').style.display = 'none';
    }
});
