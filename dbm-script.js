import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
    getAuth, onAuthStateChanged, signOut,
    createUserWithEmailAndPassword, signInWithEmailAndPassword,
    GoogleAuthProvider, signInWithPopup,
    signInWithCustomToken, signInAnonymously
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore, doc, onSnapshot, collection, addDoc, deleteDoc, updateDoc, getDocs, getDoc, setDoc, setLogLevel, serverTimestamp, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyBA1CC4SXXtWM9UpU1XkAiBFr0RIgrPwGk",
  authDomain: "tangent-rpg-dbm.firebaseapp.com",
  projectId: "tangent-rpg-dbm",
  storageBucket: "tangent-rpg-dbm.appspot.com",
  messagingSenderId: "559983787369",
  appId: "1:559983787369:web:d6f3b87daaa82b23d211f8",
  measurementId: "G-G6NC09PXPC"
};
const appId = firebaseConfig.projectId;

// --- Firebase Initialization ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Application State ---
const appState = {
    userId: null,
    isAnonymous: true,
    userRole: 'guest', // 'guest', 'contributor', 'admin', 'owner'
    devMode: false, // false = GAME MODE (read-only), true = DEV MODE (editable)
    authReady: false,
    editingDocId: null,
    confirmCallback: null,
    initialFormState: null,
    pendingNavigation: null,
    navigationContext: null,
    navigationHistory: [],
    navigationFuture: [],
    currentView: null, // e.g., { view: 'renderCategoryView', args: ['species'] }
    searchTerm: '',
    sortBy: 'name',
    sortDirection: 'asc',
    wikiEntries: [],
    currentWikiEntryId: null,
    activeListeners: {},
    onNewEntrySave: null,
};
window.appState = appState;

// --- Role-Based Access Control (RBAC) ---
const OWNER_UID = "09bdwApxw5UZ9BQTo7LXXdSsqx13";

/**
 * Checks if the current user has permission to perform an action on an item.
 * @param {string} action - The action to perform ('create', 'edit', 'delete').
 * @param {object} [itemData=null] - The data of the item, required for 'edit' and 'delete'.
 * @returns {boolean} - True if the user has permission, false otherwise.
 */
function hasPermission(action, itemData = null) {
    const { userRole, userId, devMode } = appState;

    // In GAME MODE (devMode is false), no one can perform create/edit/delete actions.
    if (!devMode) {
        return false;
    }

    // In DEV MODE, apply role-based permissions.
    switch (action) {
        case 'create':
            // Any logged-in, non-anonymous user with sufficient role can create.
            return userRole === 'owner' || userRole === 'admin' || userRole === 'contributor';

        case 'edit':
        case 'delete':
            // Owner and admin can always edit/delete.
            if (userRole === 'owner' || userRole === 'admin') {
                return true;
            }
            // Contributors can only edit/delete their own items.
            if (userRole === 'contributor') {
                return itemData && itemData.creatorId === userId;
            }
            // Guests cannot edit/delete.
            return false;

        default:
            return false;
    }
}

// --- RPG System Configuration ---
const categoryConfig = {
    rules_codex: {
        label: 'RULES CODEX',
        viewType: 'wiki',
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea', aiEnabled: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' },
            guide: { type: 'textarea' },
            parent: { type: 'select', source: 'rules_codex', label: 'Parent Entry', manageable: false },
            order: { type: 'number', label: 'Order', default: 0 },
        }
    },
    species: {
        label: 'SPECIES',
        viewType: 'table',
        directory_columns: ['name', 'description', 'type'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea', aiEnabled: true },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            type: { type: 'multiselect', source: 'species_type', manageable: true },
            size: { type: 'multiselect', source: 'species_size', manageable: true },
            movement: { type: 'multiselect', source: 'species_movement', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            bonus_skills: { type: 'json_list', source: 'skills', label: 'Bonus Skills' },
            bonus_skill_options: { type: 'multiselect', source: 'skills', label: 'Bonus Skill Options', manageable: true },
            bonus_skill_choices: { type: 'number', label: 'Bonus Skill Choices' },
            bonus_features: { type: 'multiselect', source: 'features', label: 'Bonus Features', manageable: true },
            bonus_feature_options: { type: 'multiselect', source: 'features', label: 'Bonus Feature Options', manageable: true },
            bonus_feature_choices: { type: 'number', label: 'Bonus Feature Choices' },
            recommended_features: { type: 'multiselect', source: 'features', label: 'Recommended Features', manageable: true },
            note: { type: 'textarea' },
            cp: { type: 'readonlytext', label: 'CP' }
        },
        subcategories: {
            species_type: {
                label: 'TYPES',
                directory_columns: ['name', 'description', 'modifier'],
                fields: {
                    name: { type:'text', required: true},
                    prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
                    modifier: { type: 'multiselect', source: 'modifier', manageable: true },
                    description: { type:'textarea', aiEnabled: true},
                    mechanic: { type: 'textarea' },
                    note: { type: 'textarea' },
                    cp: { type: 'readonlytext', label: 'TOTAL CP'}
                }
            },
            species_size: {
                label: 'SIZES',
                directory_columns: ['name', 'description', 'modifier'],
                fields: {
                    name: { type:'text', required: true},
                    modifier: { type: 'multiselect', source: 'modifier', manageable: true },
                    description: { type:'textarea', aiEnabled: true},
                    scaling: { type: 'number', label: 'Scaling' },
                    height_length_range: { type: 'text', label: 'Height/Length Range' },
                    weight_range: { type: 'text', label: 'Weight Range' },
                    reach: { type: 'text', label: 'Reach' },
                    mechanic: { type: 'textarea' },
                    note: { type: 'textarea' },
                    dc: { type: 'number', label: 'DC' },
                    cp: { type: 'readonlytext', label: 'TOTAL CP'}
                }
            },
            species_movement: {
                label: 'MOVEMENTS',
                directory_columns: ['name', 'description', 'cp'],
                fields: {
                    name: { type:'text', required: true},
                    prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
                    modifier: { type: 'multiselect', source: 'modifier', manageable: true },
                    description: { type:'textarea', aiEnabled: true},
                    mechanic: { type: 'textarea' },
                    note: { type: 'textarea' },
                    cp: { type: 'readonlytext', label: 'TOTAL CP' }
                }
            },
        }
    },
    factions: {
        label: 'FACTIONS',
        viewType: 'table',
        directory_columns: ['name', 'description', 'society'],
        fields: {
            name: { type:'text', required: true},
            description: { type:'textarea', aiEnabled: true },
            society: { type: 'select', source: 'societies', manageable: true },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            bonus_skills: { type: 'json_list', source: 'skills', label: 'Bonus Skills' },
            bonus_skill_options: { type: 'multiselect', source: 'skills', label: 'Bonus Skill Options', manageable: true },
            bonus_skill_choices: { type: 'number', label: 'Bonus Skill Choices' },
            bonus_features: { type: 'multiselect', source: 'features', label: 'Bonus Features', manageable: true },
            bonus_feature_options: { type: 'multiselect', source: 'features', label: 'Bonus Feature Options', manageable: true },
            bonus_feature_choices: { type: 'number', label: 'Bonus Feature Choices' },
            recommended_features: { type: 'multiselect', source: 'features', label: 'Recommended Features', manageable: true },
            attitude: { type: 'textarea' },
            goals: { type: 'textarea' },
            social_strengths: { type: 'textarea' },
            social_weaknesses: { type: 'textarea' },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    origins: {
        label: 'ORIGINS',
        viewType: 'table',
        directory_columns: ['name', 'description'],
        fields: {
            name: { type:'text', required: true},
            description: { type:'textarea', aiEnabled: true},
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            bonus_skills: { type: 'json_list', source: 'skills', label: 'Bonus Skills' },
            bonus_skill_options: { type: 'multiselect', source: 'skills', label: 'Bonus Skill Options', manageable: true },
            bonus_skill_choices: { type: 'number', label: 'Bonus Skill Choices' },
            bonus_features: { type: 'multiselect', source: 'features', label: 'Bonus Features', manageable: true },
            bonus_feature_options: { type: 'multiselect', source: 'features', label: 'Bonus Feature Options', manageable: true },
            bonus_feature_choices: { type: 'number', label: 'Bonus Feature Choices' },
            recommended_features: { type: 'multiselect', source: 'features', label: 'Recommended Features', manageable: true },
            trait: { type: 'multiselect', source: 'trait', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        },
        subcategories: {
            trait: {
                label: 'TRAITS',
                directory_columns: ['name', 'description', 'cp'],
                fields: {
                    name: { type:'text', required: true},
                    prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
                    tech_level: { type: 'select', label: 'Tech Level', options: [0, 1, 2, 3, 4, 5] },
                    meta_level: { type: 'select', label: 'Meta Level', options: [0, 1, 2, 3, 4, 5] },
                    modifier: { type: 'multiselect', source: 'modifier', manageable: true },
                    description: { type:'textarea', aiEnabled: true},
                    mechanic: { type: 'textarea' },
                    note: { type: 'textarea' },
                    cp: { type: 'readonlytext', label: 'TOTAL CP' }
                }
            },
        }
    },
    occupations: {
        label: 'OCCUPATIONS',
        viewType: 'table',
        directory_columns: ['name', 'description'],
        fields: {
            name: { type:'text', required: true},
            description: { type:'textarea', aiEnabled: true},
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            bonus_skills: { type: 'json_list', source: 'skills', label: 'Bonus Skills' },
            bonus_skill_options: { type: 'multiselect', source: 'skills', label: 'Bonus Skill Options', manageable: true },
            bonus_skill_choices: { type: 'number', label: 'Bonus Skill Choices' },
            bonus_features: { type: 'multiselect', source: 'features', label: 'Bonus Features', manageable: true },
            bonus_feature_options: { type: 'multiselect', source: 'features', label: 'Bonus Feature Options', manageable: true },
            bonus_feature_choices: { type: 'number', label: 'Bonus Feature Choices' },
            recommended_features: { type: 'multiselect', source: 'features', label: 'Recommended Features', manageable: true },
            trait: { type: 'multiselect', source: 'trait', manageable: true },
            mechanic: { type: 'textarea' },
            tech_level: { type: 'select', label: 'Tech Level', options: [0, 1, 2, 3, 4, 5] },
            meta_level: { type: 'select', label: 'Meta Level', options: [0, 1, 2, 3, 4, 5] },
            note: { type: 'textarea' }
        }
    },
    skills: {
        label: 'SKILLS',
        viewType: 'table',
        directory_columns: ['name', 'type', 'subtype', 'description'],
        fields: {
            name: { type:'text', required: true},
            type: { type: 'select', options: ['mental', 'physical', 'social', 'combat', 'meta'], required: true },
            subtype: { type: 'select' },
            is_specialization: { type: 'boolean', label: 'SPECIALIZATION' },
            base_skill: { type: 'select', source: 'skills', label: 'BASE SKILL' },
            description: { type:'textarea', aiEnabled: true},
            tech_level: { type: 'select', label: 'Tech Level', options: [0, 1, 2, 3, 4, 5] },
            meta_level: { type: 'select', label: 'Meta Level', options: [0, 1, 2, 3, 4, 5] },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    features: {
        label: 'FEATURES',
        viewType: 'table',
        directory_columns: ['name', 'type', 'description', 'cp'],
        fields: {
            name: { type:'text', required: true},
            type: { type: 'select', options: ['ability', 'combat', 'meta', 'general', 'karma', 'skill', 'exotic'] },
            description: { type:'textarea', aiEnabled: true},
            tech_level: { type: 'select', label: 'Tech Level', options: [0, 1, 2, 3, 4, 5] },
            meta_level: { type: 'select', label: 'Meta Level', options: [0, 1, 2, 3, 4, 5] },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true},
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            cp: { type: 'readonlytext', label: 'TOTAL CP' },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' },
            multi: { type: 'boolean', label: 'Multi' },
            staged: { type: 'boolean', label: 'Staged' }
        }
    },
    disadvantages: {
        label: 'DISADVANTAGES',
        viewType: 'table',
        directory_columns: ['name', 'description', 'cp'],
        fields: {
            name: { type:'text', required: true},
            description: { type:'textarea', aiEnabled: true},
            tech_level: { type: 'select', label: 'Tech Level', options: [0, 1, 2, 3, 4, 5] },
            meta_level: { type: 'select', label: 'Meta Level', options: [0, 1, 2, 3, 4, 5] },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            cp: { type: 'number'},
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    invocations: {
        label: 'INVOCATIONS',
        viewType: 'table',
        directory_columns: ['name', 'description', 'discipline', 'meta_skill', 'design_dc'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea', aiEnabled: true },
            discipline: { type: 'select', source: 'discipline', manageable: true },
            meta_skill: { type: 'select', source: 'skills_meta', label: 'Meta Skill' },
            area: { type: 'multiselect', source: 'area', manageable: true },
            effect: { type: 'multiselect', source: 'effect', manageable: true },
            range: { type: 'multiselect', source: 'range', manageable: true },
            target: { type: 'multiselect', source: 'target', manageable: true },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            critical_success_effect: { type: 'multiselect', source: 'critical_success_effect', manageable: true },
            critical_failure_effect: { type: 'multiselect', source: 'critical_failure_effect', manageable: true },
            design_dc: { type: 'readonlytext', label: 'DESIGN DC' },
            mechanic: { type: 'textarea' },
            tech_level: { type: 'select', label: 'Tech Level', options: [0, 1, 2, 3, 4, 5] },
            meta_level: { type: 'select', label: 'Meta Level', options: [0, 1, 2, 3, 4, 5] },
            note: { type: 'textarea' }
        },
        subcategories: {
            discipline: {
                label: 'DISCIPLINES',
                directory_columns: ['name', 'description'],
                fields: {
                    name: { type: 'text', required: true },
                    description: { type: 'textarea' },
                    prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
                    modifier: { type: 'multiselect', source: 'modifier', manageable: true },
                    discipline_skills: { type: 'multiselect', source: 'skills', label: 'Discipline Skills', manageable: true },
                    mechanic: { type: 'textarea' },
                    note: { type: 'textarea' }
                }
            }
        }
    },
    special_abilities: {
        label: 'SPECIAL ABILITIES',
        viewType: 'table',
        directory_columns: ['name', 'description', 'discipline', 'meta_skill', 'design_dc'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea', aiEnabled: true },
            discipline: { type: 'select', source: 'discipline', manageable: true },
            meta_skill: { type: 'select', source: 'skills_meta', label: 'Meta Skill' },
            area: { type: 'multiselect', source: 'area', manageable: true },
            effect: { type: 'multiselect', source: 'effect', manageable: true },
            range: { type: 'multiselect', source: 'range', manageable: true },
            target: { type: 'multiselect', source: 'target', manageable: true },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            critical_success_effect: { type: 'multiselect', source: 'critical_success_effect', manageable: true },
            critical_failure_effect: { type: 'multiselect', source: 'critical_failure_effect', manageable: true },
            design_dc: { type: 'readonlytext', label: 'DESIGN DC' },
            mechanic: { type: 'textarea' },
            tech_level: { type: 'select', label: 'Tech Level', options: [0, 1, 2, 3, 4, 5] },
            meta_level: { type: 'select', label: 'Meta Level', options: [0, 1, 2, 3, 4, 5] },
            note: { type: 'textarea' }
        },
        subcategories: {
            discipline: {
                label: 'DISCIPLINES',
                directory_columns: ['name', 'description'],
                fields: {
                    name: { type: 'text', required: true },
                    description: { type: 'textarea' },
                    prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
                    modifier: { type: 'multiselect', source: 'modifier', manageable: true },
                    discipline_skills: { type: 'multiselect', source: 'skills', label: 'Discipline Skills', manageable: true },
                    mechanic: { type: 'textarea' },
                    note: { type: 'textarea' }
                }
            }
        }
    },
    augmentations: {
        label: 'AUGMENTATIONS',
        viewType: 'table',
        directory_columns: ['name', 'type', 'description', 'design_dc'],
        fields: {
            name: { type:'text', required: true},
            type: { type: 'select', source: 'augmentation_type', manageable: true },
            classification: { type: 'multiselect', source: 'classification', manageable: true, label: 'Classification' },
            location: { type: 'multiselect', source: 'body_location', manageable: true },
            description: { type:'textarea', aiEnabled: true},
            tech_level: { type: 'select', label: 'Tech Level', options: [0, 1, 2, 3, 4, 5] },
            meta_level: { type: 'select', label: 'Meta Level', options: [0, 1, 2, 3, 4, 5] },
            creator: { type: 'multiselect', source: 'creator', manageable: true },
            design: { type: 'multiselect', source: 'design', manageable: true },
            component: { type: 'multiselect', source: 'component', manageable: true },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true},
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            critical_success_effect: { type: 'multiselect', source: 'critical_success_effect', manageable: true },
            critical_failure_effect: { type: 'multiselect', source: 'critical_failure_effect', manageable: true },
            cost: { type: 'number', label: 'Cost' },
            availability: { type: 'select', source: 'availability', manageable: true },
            cr: { type: 'number', label: 'CR' },
            restricted: { type: 'boolean', label: 'Restricted' },
            design_dc: { type: 'readonlytext', label: 'DESIGN DC' },
            cp: { type: 'number' },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        },
        subcategories: {
            augmentation_type: {
                label: 'AUGMENTATION TYPES',
                directory_columns: ['name', 'description'],
                fields: {
                    name: { type: 'text', required: true },
                    description: { type: 'textarea' },
                    prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
                    modifier: { type: 'multiselect', source: 'modifier', manageable: true },
                    mechanic: { type: 'textarea' },
                    note: { type: 'textarea' }
                }
            }
        }
    },
    personal_property: {
        label: 'PERSONAL PROPERTY',
        isParent: true,
        viewType: 'landing',
        subItems: ['gear', 'weaponry', 'armoring', 'mecha'],
    },
    user_guide: {
        label: 'User Guide',
        viewType: 'guide'
    },
    // --- DEV-MODE ONLY CATEGORIES ---
    societies: {
        label: 'SOCIETIES',
        hideFromMenu: true,
        viewType: 'table',
        directory_columns: ['name', 'description', 'tech_level', 'meta_level'],
        fields: {
            name: { type:'text', required: true},
            description: { type:'textarea', aiEnabled: true},
            tech_level: { type: 'select', label: 'Tech Level', options: [0, 1, 2, 3, 4, 5] },
            meta_level: { type: 'select', label: 'Meta Level', options: [0, 1, 2, 3, 4, 5] },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            agriculture: { type: 'multiselect', source: 'society_agriculture', manageable: true },
            architecture: { type: 'multiselect', source: 'society_architecture', manageable: true },
            biotechnology: { type: 'multiselect', source: 'society_biotechnology', manageable: true },
            commerce: { type: 'multiselect', source: 'society_commerce', manageable: true },
            communication: { type: 'multiselect', source: 'society_communication', manageable: true },
            devices: { type: 'multiselect', source: 'society_devices', manageable: true },
            education: { type: 'multiselect', source: 'society_education', manageable: true },
            energy: { type: 'multiselect', source: 'society_energy', manageable: true },
            manufacturing: { type: 'multiselect', source: 'society_manufacturing', manageable: true },
            materials: { type: 'multiselect', source: 'society_materials', manageable: true },
            medicine: { type: 'multiselect', source: 'society_medicine', manageable: true },
            synthetics: { type: 'multiselect', source: 'society_synthetics', manageable: true, label: 'Synthetics' },
            weaponry: { type: 'multiselect', source: 'society_weaponry', manageable: true },
            mechanic: { type: 'textarea'},
            note: { type: 'textarea'}
        },
        subcategories: {
            society_agriculture: { label: 'AGRICULTURE', directory_columns: ['name', 'description', 'level'], fields: { name: { type: 'text', required: true }, description: { type: 'textarea', aiEnabled: true }, level: { type: 'select', options: [0, 1, 2, 3, 4, 5] }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, note: { type: 'textarea' }, mechanic: { type: 'textarea'} }},
            society_architecture: { label: 'ARCHITECTURE', directory_columns: ['name', 'description', 'level'], fields: { name: { type: 'text', required: true }, description: { type: 'textarea', aiEnabled: true }, level: { type: 'select', options: [0, 1, 2, 3, 4, 5] }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, note: { type: 'textarea' }, mechanic: { type: 'textarea'} }},
            society_biotechnology: { label: 'BIOTECHNOLOGY', directory_columns: ['name', 'description', 'level'], fields: { name: { type: 'text', required: true }, description: { type: 'textarea', aiEnabled: true }, level: { type: 'select', options: [0, 1, 2, 3, 4, 5] }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, note: { type: 'textarea' }, mechanic: { type: 'textarea'} }},
            society_commerce: { label: 'COMMERCE', directory_columns: ['name', 'description', 'level'], fields: { name: { type: 'text', required: true }, description: { type: 'textarea', aiEnabled: true }, level: { type: 'select', options: [0, 1, 2, 3, 4, 5] }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, note: { type: 'textarea' }, mechanic: { type: 'textarea'} }},
            society_communication: { label: 'COMMUNICATION', directory_columns: ['name', 'description', 'level'], fields: { name: { type: 'text' }, description: { type: 'textarea', aiEnabled: true }, level: { type: 'select', options: [0, 1, 2, 3, 4, 5] }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, note: { type: 'textarea' }, mechanic: { type: 'textarea'} }},
            society_devices: { label: 'DEVICES', directory_columns: ['name', 'description', 'level'], fields: { name: { type: 'text' }, description: { type: 'textarea', aiEnabled: true }, level: { type: 'select', options: [0, 1, 2, 3, 4, 5] }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, note: { type: 'textarea' }, mechanic: { type: 'textarea'} }},
            society_education: { label: 'EDUCATION', directory_columns: ['name', 'description', 'level'], fields: { name: { type: 'text' }, description: { type: 'textarea', aiEnabled: true }, level: { type: 'select', options: [0, 1, 2, 3, 4, 5] }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, note: { type: 'textarea' }, mechanic: { type: 'textarea'} }},
            society_energy: { label: 'ENERGY', directory_columns: ['name', 'description', 'level'], fields: { name: { type: 'text' }, description: { type: 'textarea', aiEnabled: true }, level: { type: 'select', options: [0, 1, 2, 3, 4, 5] }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, note: { type: 'textarea' }, mechanic: { type: 'textarea'} }},
            society_manufacturing: { label: 'MANUFACTURING', directory_columns: ['name', 'description', 'level'], fields: { name: { type: 'text' }, description: { type: 'textarea', aiEnabled: true }, level: { type: 'select', options: [0, 1, 2, 3, 4, 5] }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, note: { type: 'textarea' }, mechanic: { type: 'textarea'} }},
            society_materials: { label: 'MATERIALS', directory_columns: ['name', 'description', 'level'], fields: { name: { type: 'text' }, description: { type: 'textarea', aiEnabled: true }, level: { type: 'select', options: [0, 1, 2, 3, 4, 5] }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, note: { type: 'textarea' }, mechanic: { type: 'textarea'} }},
            society_medicine: { label: 'MEDICINE', directory_columns: ['name', 'description', 'level'], fields: { name: { type: 'text' }, description: { type: 'textarea', aiEnabled: true }, level: { type: 'select', options: [0, 1, 2, 3, 4, 5] }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, note: { type: 'textarea' }, mechanic: { type: 'textarea'} }},
            society_society: { label: 'SOCIETY', directory_columns: ['name', 'description', 'level'], fields: { name: { type: 'text' }, description: { type: 'textarea', aiEnabled: true }, level: { type: 'select', options: [0, 1, 2, 3, 4, 5] }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, note: { type: 'textarea' }, mechanic: { type: 'textarea'} }},
            society_synthetics: { label: 'SYNTHETICS', directory_columns: ['name', 'description', 'level'], fields: { name: { type: 'text' }, description: { type: 'textarea', aiEnabled: true }, level: { type: 'select', options: [0, 1, 2, 3, 4, 5] }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, note: { type: 'textarea' }, mechanic: { type: 'textarea'} }},
            society_weaponry: { label: 'WEAPONRY', directory_columns: ['name', 'description', 'level'], fields: { name: { type: 'text' }, description: { type: 'textarea', aiEnabled: true }, level: { type: 'select', options: [0, 1, 2, 3, 4, 5] }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, note: { type: 'textarea' }, mechanic: { type: 'textarea'} }}}
    },
    values: {
        label: 'VALUES',
        hideFromMenu: true,
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea', aiEnabled: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            mechanic: { type: 'textarea' },
            cp: { type: 'number' }
        }
    },
    secondary_values: {
        label: 'SECONDARY VALUES',
        hideFromMenu: true,
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea', aiEnabled: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            mechanic: { type: 'textarea' },
            cp: { type: 'number' }
        }
    },
    tertiary_values: {
        label: 'TERTIARY VALUES',
        hideFromMenu: true,
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea', aiEnabled: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            mechanic: { type: 'textarea' },
            cp: { type: 'number' }
        }
    },
    prerequisite: {
        label: 'PREREQUISITES',
        hideFromMenu: true,
        directory_columns: ['name', 'aspect', 'aspect_subtype', 'value', 'note', 'cp'],
        fields: {
            name: { type: 'text', required: true},
            description: { type: 'textarea', aiEnabled: true},
            aspect: { type: 'select', options: ['attribute', 'skill', 'combat', 'meta', 'other'] },
            aspect_subtype: { type: 'select' },
            value: { type: 'number' },
            dc: { type: 'number', label: 'DC' },
            mechanic: { type: 'textarea'},
            note: { type: 'textarea'},
            cp: { type: 'number' }
        }
    },
    modifier: {
        label: 'MODIFIERS',
        hideFromMenu: true,
        directory_columns: ['name', 'aspect', 'aspect_subtype', 'value', 'note', 'cp'],
        fields: {
            name: { type: 'text', required: true},
            description: { type: 'textarea', aiEnabled: true},
            aspect: { type: 'select', options: ['attribute', 'skill', 'combat', 'other', 'feature'] },
            aspect_subtype: { type: 'select' },
            bonus_scope: {
                type: 'radio',
                label: 'Scope',
                options: ['any', 'specific'],
                hidden: true
            },
            bonus_feature_categories: {
                type: 'multiselect',
                label: 'Feature Categories',
                options: ['ability', 'combat', 'meta', 'general', 'karma', 'skill', 'exotic'],
                hidden: true
            },
            bonus_skill_categories: {
                type: 'multiselect',
                label: 'Skill Categories',
                options: ['mental', 'physical', 'social', 'combat', 'meta'],
                hidden: true
            },
            bonus_attribute_group: {
                type: 'select',
                label: 'Attribute Group',
                options: ['primary', 'secondary'],
                hidden: true
            },
            value: { type: 'number' },
            modifier_type: { type: 'radio', label: 'Modifier Type', options: ['constant', 'situational', 'optional', 'temporary'] },
            dc: { type: 'number', label: 'DC' },
            mechanic: { type: 'textarea'},
            note: { type: 'textarea'},
            cp: { type: 'number' }
        }
    },
    armoring: {
        label: 'Armoring',
        viewType: 'table',
        parent: 'personal_property',
        directory_columns: ['name', 'tl', 'ml', 'description', 'cost', 'resistance', 'design_dc'],
        fields: {
            name: { type: 'text', required: true, label: 'Armor Name' },
            description: { type: 'textarea' },
            tl: { type: 'number', label: 'TL' },
            ml: { type: 'number', label: 'ML' },
            cost: { type: 'number' },
            availability: { type: 'select', source: 'availability', manageable: true },
            design_dc: { type: 'readonlytext', label: 'DESIGN DC' },
            size: { type: 'multiselect', source: 'species_size', manageable: true },
            weight: { type: 'number' },
            quality: { type: 'select', options: ['Bad', 'Poor', 'Standard', 'Good', 'Exceptional', 'Mastercrafted'] },
            durability: { type: 'number' },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            skill: { type: 'select', source: 'skills', manageable: true },
            origin: { type: 'multiselect', source: 'origins', manageable: true },
            creator: { type: 'multiselect', source: 'creator', manageable: true },
            design: { type: 'multiselect', source: 'design', manageable: true },
            classification: { type: 'multiselect', source: 'classification', manageable: true, label: 'Classification' },
            material: { type: 'multiselect', source: 'material', manageable: true },
            location: { type: 'multiselect', source: 'body_location', manageable: true },
            component: { type: 'multiselect', source: 'component', manageable: true },
            resistance: { type: 'multiselect', source: 'resistance', manageable: true },
            critical_success_effect: { type: 'multiselect', source: 'critical_success_effect', manageable: true },
            critical_failure_effect: { type: 'multiselect', source: 'critical_failure_effect', manageable: true },
            component_slots: { type: 'number', label: 'Component Slots' },
            modes: { type: 'multiselect', source: 'mode', manageable: true, label: 'Modes' },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        },
        subcategories: {
            availability: { label: 'AVAILABILITY' },
            material: { label: 'MATERIALS' },
            resistance: { label: 'RESISTANCES' },
            creator: { label: 'CREATORS' },
            design: { label: 'DESIGNS' },
            classification: { label: 'CLASSIFICATIONS' },
        }
    },
    weaponry: {
        label: 'Weaponry',
        viewType: 'table',
        parent: 'personal_property',
        directory_columns: ['name', 'tl', 'ml', 'description', 'cost', 'effect', 'design_dc'],
        fields: {
            name: { type: 'text', required: true, label: 'Weapon Name' },
            description: { type: 'textarea' },
            tl: { type: 'number', label: 'TL' },
            ml: { type: 'number', label: 'ML' },
            cost: { type: 'number' },
            availability: { type: 'select', source: 'availability', manageable: true },
            design_dc: { type: 'readonlytext', label: 'DESIGN DC' },
            size: { type: 'multiselect', source: 'species_size', manageable: true },
            weight: { type: 'number' },
            quality: { type: 'select', options: ['Bad', 'Poor', 'Standard', 'Good', 'Exceptional', 'Mastercrafted'] },
            durability: { type: 'number' },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            skill: { type: 'select', source: 'skills', manageable: true },
            special: { type: 'multiselect', source: 'special', manageable: true, label: 'Special' },
            area: { type: 'multiselect', source: 'area', manageable: true },
            effect: { type: 'multiselect', source: 'effect', manageable: true },
            range: { type: 'multiselect', source: 'range', manageable: true },
            target: { type: 'multiselect', source: 'target', manageable: true },
            origin: { type: 'multiselect', source: 'origins', manageable: true },
            creator: { type: 'multiselect', source: 'creator', manageable: true },
            design: { type: 'multiselect', source: 'design', manageable: true },
            classification: { type: 'multiselect', source: 'classification', manageable: true, label: 'Classification' },
            accuracy: { type: 'number' },
            ap: { type: 'number', label: 'AP' },
            modes: { type: 'multiselect', source: 'mode', manageable: true, label: 'Modes' },
            attack_rate: { type: 'text', label: 'Rate of Fire' },
            critical_score: { type: 'text', label: 'Critical Score' },
            critical_effect: { type: 'multiselect', source: 'critical_effect', manageable: true },
            critical_success_effect: { type: 'multiselect', source: 'critical_success_effect', manageable: true },
            critical_failure_effect: { type: 'multiselect', source: 'critical_failure_effect', manageable: true },
            wielding: { type: 'select', options: ['One-Handed', 'Two-Handed', 'Versatile', 'Independent', 'Mounted'] },
            component: { type: 'multiselect', source: 'component', manageable: true },
            component_slots: { type: 'number', label: 'Component Slots' },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        },
        subcategories: {
            availability: { label: 'AVAILABILITY' },
            special: { label: 'SPECIAL' },
                mode: { label: 'MODES' },
            critical_effect: { label: 'CRITICAL EFFECTS' },
            creator: { label: 'CREATORS' },
            design: { label: 'DESIGNS' },
            classification: { label: 'CLASSIFICATIONS' },
        }
    },
        gear: {
        label: 'Gear',
        viewType: 'table',
        parent: 'personal_property',
        directory_columns: ['name', 'category', 'description', 'cost', 'weight'],
        fields: {
            name: { type: 'text', required: true, label: 'Item Name' },
            description: { type: 'textarea' },
            category: { type: 'select', source: 'gear_category', manageable: true },
            cost: { type: 'number' },
            weight: { type: 'number' },
            tl: { type: 'number', label: 'TL' },
            ml: { type: 'number', label: 'ML' },
            availability: { type: 'select', source: 'availability', manageable: true },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        },
        subcategories: {
            gear_category: { label: 'CATEGORIES' },
            availability: { label: 'AVAILABILITY' },
        }
    },
    mecha: {
        label: 'Mecha',
        viewType: 'table',
        parent: 'personal_property',
        directory_columns: ['name', 'tl', 'ml', 'description', 'cost', 'design_dc'],
        fields: {
            name: { type: 'text', required: true, label: 'Mecha Name' },
            description: { type: 'textarea' },
            tl: { type: 'number', label: 'TL' },
            ml: { type: 'number', label: 'ML' },
            cost: { type: 'number' },
            availability: { type: 'select', source: 'availability', manageable: true },
            design_dc: { type: 'readonlytext', label: 'DESIGN DC' },
            size: { type: 'multiselect', source: 'species_size', manageable: true },
            height: { type: 'number' },
            weight: { type: 'number' },
            quality: { type: 'select', options: ['Bad', 'Poor', 'Standard', 'Good', 'Exceptional', 'Mastercrafted'] },
            durability: { type: 'number' },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            skill: { type: 'select', source: 'skills', manageable: true },
            origin: { type: 'multiselect', source: 'origins', manageable: true },
            creator: { type: 'multiselect', source: 'creator', manageable: true },
            design: { type: 'multiselect', source: 'design', manageable: true },
            classification: { type: 'multiselect', source: 'classification', manageable: true, label: 'Classification' },
            personnel: { type: 'text' },
            cargo: { type: 'text' },
            speed: { type: 'text' },
            maneuverability: { type: 'text' },
            control: { type: 'select', options: ['Auto', 'Remote', 'Pilot', 'Crew'] },
            component: { type: 'multiselect', source: 'component', manageable: true },
            critical_success_effect: { type: 'multiselect', source: 'critical_success_effect', manageable: true },
            critical_failure_effect: { type: 'multiselect', source: 'critical_failure_effect', manageable: true },
            component_slots: { type: 'number', label: 'Component Slots' },
            modes: { type: 'multiselect', source: 'mode', manageable: true, label: 'Modes' },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    }
};

// --- Field Order Configuration ---
const masterFieldOrder = [
    'name', 'description', 'mechanic', 'guide', 'effect_type', 'value', 'aspect', 'aspect_subtype', 'bonus_scope', 'bonus_feature_categories', 'bonus_skill_categories', 'bonus_attribute_group', 'modifier_type', 'shape', 'dimensions', 'number_of_targets',
    'tech_level', 'meta_level', 'class', 'classification', 'category', 'type', 'subtype',
    'cr', 'cost', 'availability', 'dc', 'cp', 'restricted', 'component_slots',
    'location', 'size', 'height', 'weight', 'scaling', 'height_length_range', 'weight_range', 'personnel', 'cargo', 'reach', 'weapon_effect', 'wielding',
    'movement', 'speed',
    'quality', 'material', 'durability', 'resistance',
    'prerequisite', 'modifier', 'abilities',
    'ammunition_type', 'ap', 'area', 'attack_rate', 'damage', 'damage_type', 'damage_value', 'effect', 'effect_subtype', 'range', 'target', 'critical_score', 'critical_success_effect', 'critical_failure_effect', 'critical_effect',
    'skill', 'meta_skill', 'faction_skill', 'profession_skill', 'species_skill', 'is_specialization', 'base_skill', 'discipline', 'accuracy', 'control', 'maneuverability',
    'faction_feat', 'recommended_feature',
    'trait',
    'attitude', 'social_strengths', 'social_weaknesses', 'society', 'goals',
    'component', 'integration',
    'special',
    'modes', 'note', 'parent', 'order'
];

const helpMarkdown = `
### **Welcome to the Tangent SFF RPG Database Manager**
This guide provides a comprehensive overview of how to use this tool to browse and manage your game world's data, which is stored and shared in real-time using Firebase.

### **Core Concepts & User Roles**
The Database Manager has different capabilities based on your login status and assigned role.
* **Guest (Anonymous):** As a guest, you have complete read-only access to all entries in the database. You can navigate all sections, open items to see their details, and explore the rules codex. This is the default mode for players or viewers.
* **Contributor (Logged-in):** After logging in with a Google account, you are assigned the 'Contributor' role. You can **create** new entries in any category and **edit** or **delete** the entries that you have created. You cannot modify entries created by other users.
* **Admin/Owner (Logged-in):** These roles have full administrative rights. You can create, edit, and delete **any** data in the database, regardless of who created it.

### **Navigating the Application**
Your primary navigation tools are the **Header** and the **Sidebar**.
* **Sidebar:** This is your main navigation hub. Click any category (e.g., "Species", "Factions") to view its content. The active category is highlighted. For categories with sub-pages, like "Equipment," a nested list of links will appear below the main tab.
* **Header:** Use the back and forward arrows to move through your viewing history. The top-right corner displays your login status and provides the **LOGIN/LOGOUT** button.

### **Viewing & Finding Data**
* **Table Views:** Most categories are presented in a table format.
    * **Sorting:** Click on any column header to sort the table by that column's data.
    * **Searching:** Use the search bar at the top-right of a table to filter entries by name in real-time.
    * **Viewing Details:** Click anywhere on a row to open a detailed view of that item in a pop-up modal.
* **Wiki View (Rules Codex):** This special section has a two-column layout. The directory of all rules articles is on the left. Clicking an article title displays its full content on the right.

### **Managing Data (Logged-in Users)**
When logged in, you can create and modify data using the **Entry Modal**.
1.  **Creating an Entry:** Click the **ADD NEW** button at the top of any table. This opens the modal with a blank, editable form.
2.  **Editing an Entry:**
    * Click on an existing row to open its details in the modal (read-only view).
    * Click the **DATA** button in the top-right corner of the modal.
3.  **Saving:** After making changes in edit mode, click the **DATA** button and select **Save**. The modal will remain open in edit mode, allowing for further changes.
4.  **Deleting:** To remove an entry permanently (if you have permission), open it, click the **DATA** button, and select **Delete**.
5.  **Managing Linked Data:** Some fields (like "Modifiers" on a species) are managed in other database categories. To add or edit these, click the underlined label for the field (e.g., the word **MODIFIER**). This will navigate you to that category's management table.

### **Special Features**
* **AI-Powered Generation:** In fields like "Description," logged-in users can click the **GENERATE** button. This uses the Gemini API to create descriptive text based on the entry's other data, like its name and type. You must provide your own Gemini API key in the settings for this to work.
* **Settings:** Click the gear icon in the bottom-left corner to open the settings modal, where you can enter and save your Gemini API key.
* **Wiki-Linking:** In text areas within the "Rules Codex," you can create links to other entries by wrapping the exact entry name in double square brackets, for example: \`[[Some Rule Name]]\`. When viewed, this becomes a clickable link that opens the corresponding entry.
* **Local Backup:** Inside the modal's **DATA** menu, the "Local" submenu allows you to save the current entry's data to a JSON file on your computer or load data from such a file to populate the form.
`;

// --- UI Elements ---
const mainContentContainer = document.getElementById('main-content');
const entryModal = document.getElementById('entry-modal');
const modalTitle = document.getElementById('modal-title');
const entryForm = document.getElementById('entry-form');
const formFieldsContainer = document.getElementById('form-fields');
const confirmModal = document.getElementById('confirm-modal');
const confirmMessage = document.getElementById('confirm-message');
const confirmOkBtn = document.getElementById('confirm-ok-btn');
const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
const unsavedChangesModal = document.getElementById('unsaved-changes-modal');
const unsavedCancelBtn = document.getElementById('unsaved-cancel-btn');
const unsavedDismissBtn = document.getElementById('unsaved-dismiss-btn');
const unsavedSaveBtn = document.getElementById('unsaved-save-btn');
const errorModal = document.getElementById('error-modal');
const errorMessage = document.getElementById('error-message');
const errorOkBtn = document.getElementById('error-ok-btn');
const customModal = document.getElementById('custom-modal');
const summaryModal = document.getElementById('summary-modal');
const summaryCloseBtn = document.getElementById('summary-close-btn');
const jsonFileInput = document.getElementById('json-file-input');
const settingsModal = document.getElementById('settings-modal');
const settingsSaveBtn = document.getElementById('settings-save-btn');
const settingsCancelBtn = document.getElementById('settings-cancel-btn');
const apiKeyInput = document.getElementById('api-key-input');

// --- Authentication & Navigation---

function renderTableView(collectionKey, title, container, parentCategoryKey = null) {
    const config = getActiveConfig(collectionKey);
    if (!config) {
        showError(`Configuration for "${collectionKey}" not found.`);
        return;
    }

    // Force clear search term on view render to prevent autofill issues
    appState.searchTerm = '';

    container.innerHTML = `
        <div class="table-view-container">
            <div class="flex flex-col sm:flex-row justify-between sm:items-center my-4 gap-4">
                <div class="flex-grow min-w-0">
                    <h2 id="table-title-${collectionKey}" class="text-3xl font-bold truncate uppercase">${title}</h2>
                </div>
                <div class="flex items-center gap-2">
                    <input type="text" id="search-input-${collectionKey}" placeholder="Search by name..." class="global-form-input !w-auto" value="" autocomplete="new-password">
                    <button id="add-new-btn-${collectionKey}" class="btn btn-primary auth-required hidden">ADD NEW</button>
                </div>
            </div>
            <div class="shadow-lg rounded-lg overflow-x-auto">
                <table class="data-table min-w-full">
                    <thead id="table-header-${collectionKey}"></thead>
                    <tbody id="table-body-${collectionKey}"></tbody>
                </table>
            </div>
        </div>
    `;

    const titleElement = container.querySelector(`#table-title-${collectionKey}`);
    if (titleElement) {
        titleElement.addEventListener('click', () => {
            if (hasPermission('create')) {
                openModal(collectionKey, null, {}, true);
            }
        });
    }

    const addNewBtn = container.querySelector(`#add-new-btn-${collectionKey}`);
    if (addNewBtn) {
        addNewBtn.addEventListener('click', () => {
            openModal(collectionKey, null, {}, true);
        });
    }

    const searchInput = container.querySelector(`#search-input-${collectionKey}`);
    if (searchInput) {
        // Also clear with JS as a fallback for aggressive autofill
        setTimeout(() => { searchInput.value = ''; }, 50);

        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                appState.searchTerm = e.target.value;
                listenForData(collectionKey);
            }, 300);
        });
    }

    listenForData(collectionKey);
    updateUIAfterAuthChange();
}

function renderManagementView(collectionKey, parentCollectionKey) {
    if (!appState.authReady) return;

    const mainCollectionForHeader = parentCollectionKey || collectionKey;
    mainContentContainer.innerHTML = '';
    renderSidebar(mainCollectionForHeader);

    const config = getActiveConfig(collectionKey);
    if (!config) {
        showError(`Configuration for "${collectionKey}" not found.`);
        return;
    }

    mainContentContainer.className = 'p-8 md:p-16 pt-8 md:pt-8';
    renderTableView(collectionKey, config.label, mainContentContainer, parentCollectionKey);
}

const viewFunctions = { renderCategoryView, renderManagementView };

function navigateTo(viewDescriptor, pushState = true) {
    if (pushState && appState.currentView) {
        appState.navigationHistory.push(appState.currentView);
        appState.navigationFuture = []; // Clear future on new navigation
    }
    appState.currentView = viewDescriptor;

    const { view, args } = viewDescriptor;
    if (viewFunctions[view]) {
        viewFunctions[view](...args);
    }

    try {
        sessionStorage.setItem('navigationHistory', JSON.stringify(appState.navigationHistory));
        sessionStorage.setItem('navigationFuture', JSON.stringify(appState.navigationFuture));
        sessionStorage.setItem('currentView', JSON.stringify(appState.currentView));
    } catch (e) {
        console.warn("Could not save navigation state to sessionStorage.", e);
    }

    updateNavButtonsState();
}

function goBack() {
    if (appState.navigationHistory.length > 0) {
        if (appState.currentView) {
            appState.navigationFuture.unshift(appState.currentView);
        }
        const previousView = appState.navigationHistory.pop();
        navigateTo(previousView, false);
    }
}

function goForward() {
    if (appState.navigationFuture.length > 0) {
        if (appState.currentView) {
            appState.navigationHistory.push(appState.currentView);
        }
        const nextView = appState.navigationFuture.shift();
        navigateTo(nextView, false);
    }
}

function updateNavButtonsState() {
    const backBtn = document.getElementById('back-btn');
    const forwardBtn = document.getElementById('forward-btn');
    if (backBtn) {
        backBtn.disabled = appState.navigationHistory.length === 0;
    }
    if (forwardBtn) {
        forwardBtn.disabled = appState.navigationFuture.length === 0;
    }
}

function requestNavigation(viewDescriptor) {
    if (isFormDirty()) {
        appState.pendingNavigation = viewDescriptor;
        unsavedChangesModal.classList.remove('hidden');
    } else {
        closeModal(true);
        if (viewDescriptor) {
            navigateTo(viewDescriptor);
        }
    }
}


async function handleLogin() {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Error during Google sign-in:", error);
        if (error.code === 'auth/unauthorized-domain') {
            showError("This domain is not authorized for Google Sign-In. Please add it to the authorized domains in your Firebase Authentication settings.");
        } else {
            showError("Could not sign in with Google. Please try again.");
        }
    }
}

async function handleLogout() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out:", error);
        showError("An error occurred while signing out.");
    }
}

function updateUIAfterAuthChange() {
    const authContainer = document.getElementById('auth-container');
    const userIdDisplay = document.getElementById('userIdDisplay');

    if (authContainer) {
        authContainer.innerHTML = '';
        if (appState.isAnonymous) {
            const loginButton = document.createElement('button');
            loginButton.className = 'btn btn-primary !py-1 !px-3';
            loginButton.textContent = 'LOGIN';
            loginButton.addEventListener('click', handleLogin);
            authContainer.appendChild(loginButton);
        } else {
            const logoutButton = document.createElement('button');
            logoutButton.className = 'btn btn-secondary !py-1 !px-3';
            logoutButton.textContent = 'LOGOUT';
            logoutButton.addEventListener('click', handleLogout);
            authContainer.appendChild(logoutButton);
        }
    }

    if(userIdDisplay) {
         userIdDisplay.textContent = appState.isAnonymous ? 'ANONYMOUS' : (auth.currentUser?.email || appState.userId);
    }

    const canEditContent = appState.userRole === 'owner' || appState.userRole === 'admin' || appState.userRole === 'contributor';

    // Generic auth-required elements (like ADD NEW) respect devMode via hasPermission
    const authRequiredElements = document.querySelectorAll('.auth-required');
    authRequiredElements.forEach(el => {
        if (hasPermission('create')) {
             el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });

    // Special handling for PAIR-GM button and Mode Toggle visibility (devMode independent)
    const pairGmBtn = document.getElementById('pair-gm-btn');
    if (pairGmBtn) {
        if (canEditContent) pairGmBtn.classList.remove('hidden');
        else pairGmBtn.classList.add('hidden');
    }
    const modeToggleContainer = document.getElementById('mode-toggle-container');
    if (modeToggleContainer) {
        if (canEditContent) modeToggleContainer.classList.remove('hidden');
        else modeToggleContainer.classList.add('hidden');
    }

    // Update interactivity of table titles based on auth state
    const allTableTitles = document.querySelectorAll('h2[id^="table-title-"]');
    allTableTitles.forEach(title => {
        if (hasPermission('create')) {
            title.style.cursor = 'pointer';
            title.classList.add('hover:underline');
        } else {
            title.style.cursor = 'default';
            title.classList.remove('hover:underline');
        }
    });
}


onAuthStateChanged(auth, async (user) => {
    if (user) {
        appState.userId = user.uid;
        appState.isAnonymous = user.isAnonymous;

        if (user.isAnonymous) {
            appState.userRole = 'guest';
        } else if (user.uid === OWNER_UID) {
            appState.userRole = 'owner';
        } else {
            // Check for a role in Firestore, default to 'contributor'
            const roleDocRef = doc(db, "user_roles", user.uid);
            try {
                const roleDoc = await getDoc(roleDocRef);
                if (roleDoc.exists() && roleDoc.data().role) {
                    appState.userRole = roleDoc.data().role;
                } else {
                    appState.userRole = 'contributor';
                    // Optional: Create the role document for new users
                    await setDoc(roleDocRef, { role: 'contributor', email: user.email });
                }
            } catch (e) {
                console.error("Error fetching user role, defaulting to contributor.", e);
                appState.userRole = 'contributor';
            }
        }


        if (!appState.authReady) {
            appState.authReady = true;
            try {
                renderAppHeader();
                await populateRulesCodexMap();

                let navigatedFromSession = false;
                const savedViewJSON = sessionStorage.getItem('currentView');
                if (savedViewJSON) {
                    try {
                        const viewDescriptor = JSON.parse(savedViewJSON);
                        const categoryKey = viewDescriptor.args && viewDescriptor.args[0];

                        // Check if the category key from session is valid in the current config
                        if (categoryKey && categoryConfig[categoryKey]) {
                            const savedHistory = sessionStorage.getItem('navigationHistory');
                            const savedFuture = sessionStorage.getItem('navigationFuture');
                            appState.navigationHistory = savedHistory ? JSON.parse(savedHistory) : [];
                            appState.navigationFuture = savedFuture ? JSON.parse(savedFuture) : [];
                            navigateTo(viewDescriptor, false);
                            navigatedFromSession = true;
                        } else {
                            // The saved category is invalid, so clear session and load default
                            console.warn(`Invalid category '${categoryKey}' found in session storage. Clearing.`);
                            sessionStorage.clear();
                        }
                    } catch (e) {
                        console.warn("Could not parse session storage. Clearing.", e);
                        sessionStorage.clear();
                    }
                }

                if (!navigatedFromSession) {
                    navigateTo({ view: 'renderCategoryView', args: ['rules_codex'] });
                }

            } catch (error) {
                if (error.code === 'permission-denied') {
                    showError("CRITICAL ERROR: Firestore rules are not set up for public read. Please update your Firestore security rules to allow read access.");
                } else {
                    showError(`An unexpected error occurred during startup: ${error.message}`);
                }
                console.error("Startup Error:", error);
            }
        }
        // Always refresh UI on auth state change
        renderAppHeader();
        updateUIAfterAuthChange();
        if (appState.currentView) {
            const { view, args } = appState.currentView;
            if (viewFunctions[view]) viewFunctions[view](...args);
        }
    } else {
        appState.isAnonymous = true;
        appState.userId = null;
        appState.userRole = 'guest';
        signInAnonymously(auth).catch(err => {
            console.error("Failed to re-establish anonymous session:", err);
            if (err.code === 'auth/admin-restricted-operation') {
                showError("CRITICAL ERROR: Anonymous sign-in is not enabled in your Firebase project. Please go to Authentication -> Sign-in method in the Firebase console and enable the 'Anonymous' provider.");
            } else {
                showError("Your session has ended. Please refresh the page.");
            }
        });
    }
});

function getFormDataObject(formElement) {
    const form = formElement || document.getElementById('entry-form');
    if (!form) return {};
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
        if (data[key]) {
            if (!Array.isArray(data[key])) {
                data[key] = [data[key]];
            }
            data[key].push(value);
        } else {
            data[key] = value;
        }
    }
    return data;
}

function getFormState(form) {
    return JSON.stringify(getFormDataObject(form));
}

function isFormDirty() {
    if (!entryModal || entryModal.classList.contains('hidden')) return false;
    if (appState.initialFormState === null) return false;
    return appState.initialFormState !== getFormState(document.getElementById('entry-form'));
}

function handleManageClick(sourceKey) {
    const currentForm = document.getElementById('entry-form');
    const parentCollection = currentForm.dataset.collectionKey;

    appState.navigationContext = {
        from: 'modal',
        parentCollection: parentCollection,
        docId: appState.editingDocId,
        data: getFormDataObject(currentForm)
    };

    const viewDescriptor = { view: 'renderManagementView', args: [sourceKey, parentCollection] };

    if (isFormDirty()) {
        appState.pendingNavigation = viewDescriptor;
        unsavedChangesModal.classList.remove('hidden');
    } else {
        closeModal(true);
        navigateTo(viewDescriptor);
    }
}

// --- Navigation & View Rendering ---

function renderAppHeader() {
    const headerContainer = document.querySelector('.app-header');
    headerContainer.innerHTML = `
        <div class="flex-1 flex items-center gap-4">
            <div class="header-title-container">
                <h1 class="tangent-title">TANGENT</h1>
                <p>Science Fiction & Fantasy</p>
                <p>Role Playing Game</p>
            </div>
        </div>
        <div class="flex-grow flex justify-center items-center gap-4">
            <button id="back-btn" class="btn btn-secondary !p-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/></svg>
            </button>
            <button id="forward-btn" class="btn btn-secondary !p-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>
            </button>
        </div>
        <div class="flex-1 flex justify-end items-center gap-4">
            <div id="mode-toggle-container" class="flex items-center gap-2 hidden">
                <span class="text-xs font-bold uppercase text-gray-400">GAME</span>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="mode-toggle-checkbox" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-600 rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <span class="text-xs font-bold uppercase text-gray-400">DEV</span>
            </div>
            <div class="text-right">
                <p class="text-xs text-gray-500">USER:</p>
                <p id="userIdDisplay" class="text-sm font-semibold bg-gray-700 rounded-md px-2 py-0.5 inline-block break-all" style="color: var(--text-subtle); background-color: var(--bg-header);"></p>
            </div>
            <div id="auth-container"></div>
            <button id="settings-icon" class="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-300"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
        </div>
    `;

    document.getElementById('settings-icon').addEventListener('click', () => {
        apiKeyInput.value = localStorage.getItem('geminiApiKey') || '';
        settingsModal.classList.remove('hidden');
    });
    document.getElementById('back-btn').addEventListener('click', goBack);
    document.getElementById('forward-btn').addEventListener('click', goForward);


    const modeToggleCheckbox = document.getElementById('mode-toggle-checkbox');
    if (modeToggleCheckbox) {
        modeToggleCheckbox.checked = appState.devMode;
        modeToggleCheckbox.addEventListener('change', (e) => {
            appState.devMode = e.target.checked;
            if (appState.currentView) {
                navigateTo(appState.currentView, false);
            }
        });
    }

    updateUIAfterAuthChange();
    updateNavButtonsState();
}

function renderSidebar(activeCategoryKey) {
    const sidebar = document.getElementById('app-sidebar');
    sidebar.innerHTML = '';

    const activeConfig = categoryConfig[activeCategoryKey] || {};
    const activeParentKey = activeConfig.parent || activeCategoryKey;

    const excludedCategories = ['values', 'secondary_values', 'tertiary_values'];
    const mainCategories = Object.keys(categoryConfig).filter(key => !categoryConfig[key].hideFromMenu && !categoryConfig[key].parent && !excludedCategories.includes(key));

    mainCategories.forEach(key => {
        const config = categoryConfig[key];
        const tab = document.createElement('button');
        tab.className = `sidebar-tab ${key === activeParentKey ? 'active' : ''}`;
        tab.textContent = config.label;

        if (config.isParent) {
            tab.addEventListener('click', () => {
                requestNavigation({ view: 'renderCategoryView', args: [config.subItems[0]] });
            });
        } else {
            tab.addEventListener('click', () => {
                requestNavigation({ view: 'renderCategoryView', args: [key] });
            });
        }
        sidebar.appendChild(tab);

        if (key === activeParentKey && config.isParent && config.subItems) {
            const subDirContainer = document.createElement('div');
            subDirContainer.className = 'wiki-directory-container';
            const subList = document.createElement('ul');
            subList.className = 'pl-4 space-y-1';

            config.subItems.forEach(subKey => {
                const subConfig = categoryConfig[subKey];
                if (!subConfig) return;

                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = `#`;
                a.className = `block p-1 rounded hover:bg-gray-700 text-sm uppercase ${subKey === activeCategoryKey ? 'font-bold text-white' : ''}`;
                a.textContent = subConfig.label;
                a.onclick = (e) => {
                    e.preventDefault();
                    requestNavigation({ view: 'renderCategoryView', args: [subKey] });
                };
                li.appendChild(a);
                subList.appendChild(li);
            });

            subDirContainer.appendChild(subList);
            sidebar.appendChild(subDirContainer);
        }
    });

    if (appState.devMode) {
        const separator = document.createElement('div');
        separator.className = 'sidebar-separator';
        separator.textContent = 'OTHER';
        sidebar.appendChild(separator);

        const devCategories = Object.keys(categoryConfig).filter(key => categoryConfig[key].hideFromMenu);
        devCategories.forEach(key => {
            const config = categoryConfig[key];
            const tab = document.createElement('button');
            tab.className = `sidebar-tab ${key === activeParentKey ? 'active' : ''}`;
            tab.textContent = config.label;
            tab.addEventListener('click', () => {
                requestNavigation({ view: 'renderCategoryView', args: [key] });
            });
            sidebar.appendChild(tab);
        });
    }
}

function renderCategoryView(categoryKey) {
    if (!appState.authReady) return;

    // Clear all previous listeners
    Object.values(appState.activeListeners).forEach(unsub => unsub());
    appState.activeListeners = {};

    mainContentContainer.innerHTML = '';
    renderSidebar(categoryKey);

    const config = categoryConfig[categoryKey];
    if (!config) {
        showError(`No configuration found for category: ${categoryKey}`);
        return;
    }

    updateUIAfterAuthChange();
    if (config.viewType === 'wiki') {
        mainContentContainer.innerHTML = `
            <div class="flex" style="height: calc(100vh - var(--header-height) - 3rem);">
                <div id="wiki-directory-main" class="w-80 flex-shrink-0 p-4 overflow-y-auto">
                    <button id="add-wiki-entry-btn" class="btn btn-primary w-full mb-4 auth-required hidden">Add New Entry</button>
                    <ul id="wiki-directory-list"></ul>
                </div>
                <div class="flex-grow p-6 overflow-y-auto">
                    <div class="wiki-content prose prose-invert max-w-none" id="wiki-content-main">
                        <div class="flex justify-end gap-2 mb-4">
                            <div class="file-menu">
                                <button id="wiki-data-btn" class="file-menu-button hidden">DATA</button>
                                <div id="wiki-data-dropdown" class="file-menu-dropdown"></div>
                            </div>
                        </div>
                        <h2 id="wiki-entry-title">Select an Entry</h2>
                        <div id="wiki-entry-body">
                            <p class="text-gray-400">Please select an entry from the directory on the left.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

         document.getElementById('add-wiki-entry-btn').addEventListener('click', () => openModal('rules_codex', null, {}, true));

        listenForWikiEntries();

    } else if (config.viewType === 'guide') {
        renderGuideView(mainContentContainer);
    } else if (config.viewType === 'landing') {
        renderLandingView(categoryKey, config.label, mainContentContainer);
    }
    else {
         renderTableView(categoryKey, config.label, mainContentContainer);
    }
    updateUIAfterAuthChange();
}

function renderLandingView(categoryKey, title, container) {
    const config = categoryConfig[categoryKey];
    if (!config || !config.subItems) {
        showError(`Configuration for landing page "${categoryKey}" is missing subItems.`);
        return;
    }

    const subItemsHtml = config.subItems.map(subKey => {
        const subConfig = categoryConfig[subKey];
        if (!subConfig) return '';
        return `
            <button class="landing-page-button" data-navigate-to="${subKey}">
                <span class="text-2xl font-bold uppercase">${subConfig.label}</span>
            </button>
        `;
    }).join('');

    container.innerHTML = `
        <div class="landing-page-container">
            <h2 class="text-3xl font-bold uppercase mb-8">${title}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${subItemsHtml}
            </div>
        </div>
    `;

    container.querySelectorAll('.landing-page-button').forEach(button => {
        button.addEventListener('click', () => {
            requestNavigation({ view: 'renderCategoryView', args: [button.dataset.navigateTo] });
        });
    });
}

function renderGuideView(container) {
    container.innerHTML = `
        <div class="guide-content">
            ${convertMarkdownToHtml(helpMarkdown)}
        </div>
    `;
}

async function renderWikiDirectory(container, entries, parent = null, level = 0) {
    if (!container) return;
    const ul = document.createElement('ul');
    ul.className = `space-y-1 ${level > 0 ? 'pl-4' : ''}`;

    const children = entries.filter(entry => (entry.parent || null) === parent).sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name));

    for (const entry of children) {
        const li = document.createElement('li');
        const hasChildren = entries.some(e => e.parent === entry.name);

        let arrowHtml = `<span class="inline-block w-6"></span>`;
        if (hasChildren) {
            arrowHtml = `<span class="arrow-indicator inline-block w-6 text-center">▸</span>`;
        }

        const link = document.createElement('a');
        link.href = '#';
        link.dataset.entryId = entry.id;
        link.className = 'flex items-center'; // Make link a flex container for arrow and text
        link.innerHTML = `${arrowHtml}<span>${entry.name}</span>`;

        li.appendChild(link);

        if (hasChildren) {
            const childrenContainer = document.createElement('div');
            childrenContainer.id = `children-${entry.id}`;
            childrenContainer.style.display = 'none';
            await renderWikiDirectory(childrenContainer, entries, entry.name, level + 1);
            li.appendChild(childrenContainer);

            link.addEventListener('click', (e) => {
                e.preventDefault();
                displayWikiEntry(entry.id);

                const isHidden = childrenContainer.style.display === 'none';
                childrenContainer.style.display = isHidden ? 'block' : 'none';

                const arrowIndicator = link.querySelector('.arrow-indicator');
                if (arrowIndicator) {
                    arrowIndicator.textContent = isHidden ? '▾' : '▸';
                }
            });
        } else {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                displayWikiEntry(entry.id);
            });
        }

        ul.appendChild(li);
    }
    container.innerHTML = '';
    container.appendChild(ul);
}

async function displayWikiEntry(docId) {
    // Active state switching
    const allLinks = document.querySelectorAll('#wiki-directory-list a');
    allLinks.forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`#wiki-directory-list a[data-entry-id="${docId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    const wikiTitle = document.getElementById('wiki-entry-title');
    const wikiBody = document.getElementById('wiki-entry-body');
    const wikiDataBtn = document.getElementById('wiki-data-btn');
    const wikiDataDropdown = document.getElementById('wiki-data-dropdown');

    if (!wikiTitle || !wikiBody || !wikiDataBtn || !wikiDataDropdown) return;

    wikiTitle.textContent = 'Loading...';
    wikiBody.innerHTML = '<p class="text-center text-gray-400">Loading entry...</p>';
    wikiDataBtn.classList.add('hidden');
    wikiDataDropdown.classList.remove('show');
    wikiDataDropdown.innerHTML = '';
    appState.currentWikiEntryId = null;

    try {
        const entry = appState.wikiEntries.find(e => e.id === docId);

        if (entry) {
            wikiTitle.textContent = entry.name.toUpperCase();
            let contentHtml = '';

            // The content from the editor is already HTML. Display it directly.
            if (entry.description) contentHtml += entry.description;
            if (entry.mechanic) contentHtml += `<h3>Mechanics</h3>` + entry.mechanic;
            if (entry.guide) contentHtml += `<h3>Guide</h3>` + entry.guide;
            if (entry.note) contentHtml += `<h3>Notes</h3>` + entry.note;

            if (!contentHtml) {
                contentHtml = '<p class="text-gray-400">No content available for this entry.</p>';
            }

            // Parse for [[...]] links after assembling the raw HTML
            wikiBody.innerHTML = parseWikiLinks(contentHtml);
            appState.currentWikiEntryId = docId;

            const canEdit = hasPermission('edit', entry);
            const canDelete = hasPermission('delete', entry);

            if (canEdit || canDelete) {
                wikiDataBtn.classList.remove('hidden');

                if (canEdit) {
                    const editButton = document.createElement('button');
                    editButton.textContent = 'Edit';
                    editButton.addEventListener('click', () => {
                        openModal('rules_codex', entry.id, entry, appState.devMode);
                    });
                    wikiDataDropdown.appendChild(editButton);
                }

                if (canDelete) {
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.className = 'text-red-400 hover:bg-red-800';
                    deleteButton.addEventListener('click', () => {
                        deleteEntry('rules_codex', entry.id);
                    });
                    wikiDataDropdown.appendChild(deleteButton);
                }

                wikiDataBtn.onclick = (e) => {
                    e.stopPropagation();
                    wikiDataDropdown.classList.toggle('show');
                };

            }

        } else {
            wikiTitle.textContent = 'Entry Not Found';
            wikiBody.innerHTML = '<p class="text-red-400">The requested wiki entry could not be found.</p>';
        }
    } catch (error) {
        console.error("Error displaying wiki entry:", error);
        showError("Failed to display wiki entry.");
        wikiTitle.textContent = 'Error';
        wikiBody.innerHTML = '<p class="text-red-400">An error occurred while loading the entry.</p>';
    }
}

async function getCollectionOptions(collectionName) {
    if (!appState.authReady) return [];
    if (collectionName === 'all_equipment') {
        const equipmentTypes = ['armoring', 'weaponry', 'mecha', 'gear'];
        let allOptions = [];
        for (const type of equipmentTypes) {
            const options = await getCollectionOptions(type);
            allOptions.push({ label: type.toUpperCase(), options });
        }
        return allOptions;
    }
    if (collectionName === 'skills_meta') {
        const allSkills = await getCollectionOptions('skills');
        const metaSkills = allSkills.filter(skill => skill.type === 'meta');
        return metaSkills;
    }
    if (collectionName === 'rules_codex') {
        const allEntries = appState.wikiEntries.filter(entry => entry.id !== appState.editingDocId);

        function buildCodexTree(parentName, level) {
            const children = allEntries.filter(entry => (entry.parent || null) === parentName);
            let result = [];
            children.sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name));
            for (const child of children) {
                result.push({ name: child.name, id: child.id, level: level });
                result = result.concat(buildCodexTree(child.name, level + 1));
            }
            return result;
        }

        return buildCodexTree(null, 0);
    }


    const collectionPath = `artifacts/${appId}/public/data/${collectionName}`;
    try {
        const querySnapshot = await getDocs(collection(db, collectionPath));
        return querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a,b) => (a.name || '').localeCompare(b.name || ''));
    } catch (error) {
        console.error(`Error getting options from ${collectionName}:`, error);
        showError(`Could not load options for ${collectionName}.`);
        return [];
    }
}

function getActiveConfig(collectionKey) {
    if (!collectionKey) return null;

    if (categoryConfig[collectionKey]) {
        return categoryConfig[collectionKey];
    }

    for (const mainKey in categoryConfig) {
        const mainConfig = categoryConfig[mainKey];
        if (mainConfig?.tables && mainConfig.tables[collectionKey]) {
            return mainConfig.tables[collectionKey];
        }
        if (mainConfig?.subcategories?.[collectionKey]) {
            return mainConfig.subcategories[collectionKey];
        }
         for (const tableKey in mainConfig.tables) {
            if (mainConfig.tables[tableKey].subcategories && mainConfig.tables[tableKey].subcategories[collectionKey]) {
                return getActiveConfig(collectionKey);
            }
        }
    }
    return null;
}

let rulesCodexMap = new Map();

async function populateRulesCodexMap() {
    if (!appState.authReady) return;
    const collectionPath = `artifacts/${appId}/public/data/rules_codex`;
    try {
        const querySnapshot = await getDocs(collection(db, collectionPath));
        rulesCodexMap.clear();
        appState.wikiEntries = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        appState.wikiEntries.forEach(entry => {
            rulesCodexMap.set(entry.name, entry.id);
        });
    } catch (error) {
        console.error("Error populating Rules Codex Map:", error);
        // This error will be caught by the caller in the onAuthStateChanged handler
        throw error;
    }
}

function listenForWikiEntries() {
    if (appState.activeListeners['rules_codex']) {
        appState.activeListeners['rules_codex']();
    }

    const collectionPath = `artifacts/${appId}/public/data/rules_codex`;
    const q = query(collection(db, collectionPath));

    appState.activeListeners['rules_codex'] = onSnapshot(q, (snapshot) => {
        appState.wikiEntries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        rulesCodexMap.clear();
        appState.wikiEntries.forEach(entry => rulesCodexMap.set(entry.name, entry.id));

        const wikiDirectory = document.getElementById('wiki-directory-list');
        if (wikiDirectory) {
            if (snapshot.empty) {
                wikiDirectory.innerHTML = '<li>No entries found.</li>';
            } else {
                renderWikiDirectory(wikiDirectory, appState.wikiEntries, null);
                if (appState.currentWikiEntryId && appState.wikiEntries.some(e => e.id === appState.currentWikiEntryId)) {
                    displayWikiEntry(appState.currentWikiEntryId);
                } else {
                    const defaultEntry = appState.wikiEntries.find(e => e.name === 'Tangent SFF RPG');
                    if (defaultEntry) {
                        displayWikiEntry(defaultEntry.id);
                    }
                }
            }
        }
    }, error => {
        console.error("Error listening for wiki entries:", error);
        const wikiDirectory = document.getElementById('wiki-directory-list');
        if(wikiDirectory) wikiDirectory.innerHTML = '<li class="text-red-500">Error loading entries.</li>';
        showError("Failed to load wiki entries. Check console for details.");
    });
}


function createTableRow(docId, data, collectionKey) {
    const config = getActiveConfig(collectionKey);

    if (!config || !config.fields) {
        console.error("Could not find config for table row", collectionKey);
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="99" class="text-red-500">Config error for ${collectionKey}</td>`;
        return tr;
    }
    const fields = config.fields;
    const columnsToShow = config.directory_columns || Object.keys(fields);

    const tr = document.createElement('tr');
    tr.className = 'cursor-pointer';
    tr.dataset.id = docId;
    tr.addEventListener('click', () => {
        openModal(collectionKey, docId, data, appState.devMode);
    });

    columnsToShow.forEach(fieldKey => {
        const td = document.createElement('td');
        let value = data[fieldKey];
        td.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-300 uppercase';

        if(fieldKey === 'is_specialization' || fieldKey === 'restricted') {
            value = value === true || value === 'true' ? 'YES' : 'NO';
        } else if (fields[fieldKey]?.type === 'json_list' && typeof value === 'string' && value.startsWith('[')) {
            try {
                const parsed = JSON.parse(value);
                value = parsed.map(p => `${p.name.toUpperCase()}: ${p.value}`).join(', ');
            } catch (e) { /* Do nothing, display raw string if parse fails */ }
        }

        if(Array.isArray(value)) {
            td.textContent = value.join(', ').toUpperCase();
        } else if (typeof value === 'object' && value !== null) {
            td.textContent = JSON.stringify(value).toUpperCase();
        } else {
            td.textContent = (value || '').toString().toUpperCase();
        }

        tr.appendChild(td);
    });
    return tr;
}

function listenForData(collectionName) {
    if (appState.activeListeners[collectionName]) {
        appState.activeListeners[collectionName]();
    }

    const collectionPath = `artifacts/${appId}/public/data/${collectionName}`;
    let q;

    if (appState.searchTerm) {
        const searchTermLower = appState.searchTerm.toLowerCase();
         q = query(collection(db, collectionPath),
            where('name', '>=', searchTermLower),
            where('name', '<=', searchTermLower + '\uf8ff'),
            orderBy('name')
        );
    } else {
         q = query(collection(db, collectionPath), orderBy(appState.sortBy, appState.sortDirection));
    }

    const tableHeader = document.getElementById(`table-header-${collectionName}`);
    const tableBody = document.getElementById(`table-body-${collectionName}`);

    if (!tableHeader) return;
    tableHeader.innerHTML = '';
    const config = getActiveConfig(collectionName);
    if (!config || !config.fields) {
        console.error("Could not find config for table header", collectionName);
        return;
    }
    const fields = config.fields;
    const columnsToShow = config.directory_columns || Object.keys(fields);

    const tr = document.createElement('tr');
    columnsToShow.forEach(fieldKey => {
        const th = document.createElement('th');
        th.className = 'px-6 py-3 text-left text-xs font-bold tracking-wider';
        const fieldConfig = fields[fieldKey] || {};
        th.innerHTML = `<span>${(fieldConfig.label || fieldKey.replace(/_/g, ' ')).toUpperCase()}</span>`;
        th.dataset.sortKey = fieldKey;
        th.addEventListener('click', () => {
            if (appState.sortBy === fieldKey) {
                appState.sortDirection = appState.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                appState.sortBy = fieldKey;
                appState.sortDirection = 'asc';
            }
            listenForData(collectionName);
        });
        tr.appendChild(th);
    });
    tableHeader.appendChild(tr);

    appState.activeListeners[collectionName] = onSnapshot(q, (snapshot) => {
        if (!tableBody) return;

        tableBody.innerHTML = '';

        if (snapshot.empty) {
            const colspan = columnsToShow.length;
            tableBody.innerHTML = `<tr><td colspan="${colspan}" class="px-6 py-4 text-center text-gray-400">NO ENTRIES FOUND.</td></tr>`;
            return;
        }

        snapshot.forEach((doc) => {
            const docId = doc.id;
            const data = doc.data();
            const newRow = createTableRow(docId, data, collectionName);
            tableBody.appendChild(newRow);
        });

        if (collectionName === 'rules_codex') {
            populateRulesCodexMap();
        }

    }, error => {
        console.error(`Error listening for data from ${collectionName}:`, error);
        showError(`Failed to load data from ${collectionName}.`);
    });
}

// --- Unified Selector Modal Logic ---

let unifiedSelectorState = {
    isOpen: false,
    fieldKey: null,
    fieldConfig: null,
    isMultiSelect: false,
    currentSelections: new Set(),
    allItems: [],
    onSave: null,
};

function renderUnifiedSelectorList(searchTerm = '') {
    const listEl = document.getElementById('unified-selector-list');
    listEl.innerHTML = '';
    const lowerSearchTerm = searchTerm.toLowerCase();

    const filteredItems = unifiedSelectorState.allItems.filter(item =>
        item.name.toLowerCase().includes(lowerSearchTerm)
    );

    if (filteredItems.length === 0) {
        listEl.innerHTML = '<div class="text-center text-gray-400 p-4">No items found.</div>';
        return;
    }

    filteredItems.forEach(item => {
        const isSelected = unifiedSelectorState.currentSelections.has(item.name);
        const itemEl = document.createElement('div');
        itemEl.className = `p-2 rounded-md cursor-pointer flex justify-between items-center ${isSelected ? 'bg-blue-800/50' : 'hover:bg-gray-700/80'}`;
        itemEl.textContent = item.name.toUpperCase();
        itemEl.dataset.itemName = item.name;

        itemEl.addEventListener('click', () => {
            const itemName = item.name;
            if (unifiedSelectorState.isMultiSelect) {
                if (unifiedSelectorState.currentSelections.has(itemName)) {
                    unifiedSelectorState.currentSelections.delete(itemName);
                } else {
                    unifiedSelectorState.currentSelections.add(itemName);
                }
            } else {
                if (unifiedSelectorState.currentSelections.has(itemName)) {
                    unifiedSelectorState.currentSelections.clear();
                } else {
                    unifiedSelectorState.currentSelections.clear();
                    unifiedSelectorState.currentSelections.add(itemName);
                }
            }
            renderUnifiedSelectorList(document.getElementById('unified-selector-search').value);
        });

        listEl.appendChild(itemEl);
    });
}

async function openUnifiedSelectorModal(fieldKey, fieldConfig, currentValue, onSaveCallback) {
    const modal = document.getElementById('unified-selector-modal');
    const titleEl = document.getElementById('unified-selector-title');
    const listEl = document.getElementById('unified-selector-list');
    const searchEl = document.getElementById('unified-selector-search');
    const newBtn = document.getElementById('unified-selector-new-btn');
    const saveBtn = document.getElementById('unified-selector-save-btn');
    const cancelBtn = document.getElementById('unified-selector-cancel-btn');

    unifiedSelectorState = {
        isOpen: true,
        fieldKey,
        fieldConfig,
        isMultiSelect: fieldConfig.type === 'multiselect',
        currentSelections: new Set(fieldConfig.type === 'multiselect' ? (Array.isArray(currentValue) ? currentValue : (currentValue ? currentValue.split(',') : [])) : (currentValue ? [currentValue] : [])),
        allItems: [],
        onSave: onSaveCallback
    };

    titleEl.textContent = `Select ${fieldConfig.label || fieldKey}`;
    listEl.innerHTML = '<div class="loader"></div>';
    searchEl.value = '';

    modal.classList.remove('hidden');

    unifiedSelectorState.allItems = await getCollectionOptions(fieldConfig.source);
    renderUnifiedSelectorList();

    searchEl.oninput = () => renderUnifiedSelectorList(searchEl.value);

    cancelBtn.onclick = () => {
        modal.classList.add('hidden');
        unifiedSelectorState.isOpen = false;
         if (appState.onNewEntrySave) {
            appState.onNewEntrySave(null, null);
        }
    };

    saveBtn.onclick = () => {
        if (unifiedSelectorState.onSave) {
            const selection = unifiedSelectorState.isMultiSelect
                ? Array.from(unifiedSelectorState.currentSelections)
                : (unifiedSelectorState.currentSelections.size > 0 ? unifiedSelectorState.currentSelections.values().next().value : '');
            unifiedSelectorState.onSave(selection);
        }
        modal.classList.add('hidden');
        unifiedSelectorState.isOpen = false;
    };

    newBtn.onclick = () => {
        modal.classList.add('hidden');
        appState.onNewEntrySave = (newDocId, newName) => {
            if (newDocId) {
               if (unifiedSelectorState.isMultiSelect) {
                   unifiedSelectorState.currentSelections.add(newName);
               } else {
                   unifiedSelectorState.currentSelections.clear();
                   unifiedSelectorState.currentSelections.add(newName);
               }
               const updatedValue = Array.from(unifiedSelectorState.currentSelections).join(',');
               openUnifiedSelectorModal(fieldKey, fieldConfig, updatedValue, onSaveCallback);
            } else {
                modal.classList.remove('hidden');
            }
            appState.onNewEntrySave = null;
        };
        openModal(fieldConfig.source, null, {}, true);
    };
}
window.openUnifiedSelectorModal = openUnifiedSelectorModal;

// --- Form Field Creation Helpers ---

function createTextField(fieldKey, savedValue, isEditMode) {
    const readonlyAttr = isEditMode ? '' : 'readonly';
    const displayClass = isEditMode ? '' : 'display-only-input';
    return `<input type="text" id="${fieldKey}" name="${fieldKey}" value="${savedValue}" class="global-form-input ${displayClass}" ${readonlyAttr}>`;
}

function createNumberField(fieldKey, savedValue, isEditMode) {
    const readonlyAttr = isEditMode ? '' : 'readonly';
    const displayClass = isEditMode ? '' : 'display-only-input';
    return `<input type="number" id="${fieldKey}" name="${fieldKey}" value="${savedValue || 0}" class="global-form-input ${displayClass}" ${readonlyAttr}>`;
}

function createTextareaField(fieldKey, savedValue, isEditMode, collectionKey) {
    if (!isEditMode) {
        const content = collectionKey === 'rules_codex' ? parseWikiLinks(savedValue || '') : savedValue;
        const proseClass = collectionKey === 'rules_codex' ? 'prose prose-invert max-w-none' : '';
        return `<div class="global-form-input display-only-input p-2 overflow-auto ${proseClass}" style="min-height: 3rem;">${content}</div>`;
    }

    if (collectionKey === 'rules_codex') {
        return `<div class="quill-editor-frame"><div id="editor-${fieldKey}" class="quill-editor-container"></div></div><input type="hidden" id="${fieldKey}" name="${fieldKey}">`;
    } else {
        return `<textarea id="${fieldKey}" name="${fieldKey}" class="global-form-input" rows="1">${savedValue || ''}</textarea>`;
    }
}

function createBooleanField(fieldKey, savedValue, isEditMode) {
    const savedBool = savedValue === true || savedValue === 'true';
    if (!isEditMode) {
        return `<div class="global-form-input display-only-input">${savedBool ? 'YES' : 'NO'}</div>`;
    }
    return `<div class="flex gap-4">
                <label class="flex items-center gap-2">
                    <input type="radio" name="${fieldKey}" value="true" ${savedBool ? 'checked' : ''} class="h-4 w-4 rounded-full border-gray-600 bg-gray-700 text-gray-400 focus:ring-gray-500">
                    <span>YES</span>
                </label>
                <label class="flex items-center gap-2">
                    <input type="radio" name="${fieldKey}" value="false" ${!savedBool ? 'checked' : ''} class="h-4 w-4 rounded-full border-gray-600 bg-gray-700 text-gray-400 focus:ring-gray-500">
                    <span>NO</span>
                </label>
            </div>`;
}

function createRadioField(fieldKey, fieldConfig, savedValue, isEditMode) {
    const options = fieldConfig.options || [];
    const valueToSelect = (savedValue === '' && fieldKey === 'modifier_type') ? 'constant' : savedValue;
    if (!isEditMode) {
        return `<div class="global-form-input display-only-input">${(valueToSelect || '').toUpperCase()}</div>`;
    }
    const radioHtml = options.map(opt => `
        <label class="flex items-center gap-2">
            <input type="radio" name="${fieldKey}" value="${opt}" ${valueToSelect === opt ? 'checked' : ''} class="h-4 w-4 rounded-full border-gray-600 bg-gray-700 text-gray-400 focus:ring-gray-500">
            <span>${opt.toUpperCase()}</span>
        </label>
    `).join('');
    return `<div class="flex gap-4">${radioHtml}</div>`;
}

async function createSelectField(fieldKey, fieldConfig, savedValue, isEditMode) {
    let options = [];
    if (fieldConfig.source === 'skills_meta') {
        const allSkills = await getCollectionOptions('skills');
        const metaSkills = allSkills.filter(skill => skill.type === 'meta');
        options = metaSkills;
    } else if (fieldConfig.source) {
        options = await getCollectionOptions(fieldConfig.source);
    } else if (fieldConfig.options) {
        options = fieldConfig.options.map(opt => ({ name: opt, dc: 0}));
    }

    if (!isEditMode) {
        const displayValue = options.find(opt => opt.name === savedValue)?.name || savedValue || '';
        return `<div class="global-form-input display-only-input">${String(displayValue).toUpperCase()}</div>`;
    }

    let optionHtml = '';
    if (fieldConfig.source === 'rules_codex') {
        optionHtml = options.map(opt => {
            const indentation = '&nbsp;&nbsp;'.repeat(opt.level || 0);
            const prefix = (opt.level || 0) > 0 ? '└─ ' : '';
            return `<option value="${opt.name}" ${savedValue == opt.name ? 'selected' : ''}>${indentation}${prefix}${String(opt.name).toUpperCase()}</option>`;
        }).join('');
    } else {
        optionHtml = options.map(opt => `<option value="${opt.name}" ${savedValue == opt.name ? 'selected' : ''} data-dc="${opt.dc || 0}" data-cp="${opt.cp || 0}">${String(opt.name).toUpperCase()}</option>`).join('');
    }
    return `<select id="${fieldKey}" name="${fieldKey}" class="global-form-input form-select-arrow"><option value="">--CHOOSE--</option>${optionHtml}</select>`;
}


async function createMultiselectField(fieldKey, fieldConfig, savedValue, isEditMode) {
    const savedArray = Array.isArray(savedValue) ? savedValue : (savedValue ? String(savedValue).split(',') : []);

    if (!isEditMode) {
        const displayValue = savedArray.length > 0 ? savedArray.join(', ').toUpperCase() : 'NONE';
        return `<div class="global-form-input display-only-input">${displayValue}</div>`;
    }

    if (fieldConfig.source === 'all_equipment') {
        const equipmentGroups = await getCollectionOptions(fieldConfig.source);
        let groupedCheckboxHtml = '';
        equipmentGroups.forEach(group => {
            if (group.options.length > 0) {
                groupedCheckboxHtml += `<h5 class="font-bold text-sm uppercase text-gray-400 mt-2 first:mt-0">${group.label}</h5>`;
                groupedCheckboxHtml += group.options.map(opt => `
                    <label class="flex items-center space-x-2 p-1 rounded-md pl-2">
                        <input type="checkbox" name="${fieldKey}" value="${opt.name}" ${savedArray.includes(opt.name) ? 'checked' : ''} class="h-4 w-4 rounded border-gray-600 bg-gray-700 text-gray-400 focus:ring-gray-500" data-dc="${opt.dc || 0}" data-cp="${opt.cp || 0}">
                        <span class="uppercase">${opt.name}</span>
                    </label>`).join('');
            }
        });
        return `<div class="multiselect-container">${groupedCheckboxHtml || `<span class="text-gray-500">No equipment available.</span>`}</div>`;
    }

    let options = [];
    if (fieldConfig.options) {
        options = fieldConfig.options.map(opt => ({ name: opt }));
    } else if (fieldConfig.source) {
        options = await getCollectionOptions(fieldConfig.source);
    }

    if (fieldKey === 'prerequisite' && appState.editingDocId) {
        options = options.filter(opt => opt.id !== appState.editingDocId);
    }

    if (options.length === 0) {
        return `<div class="multiselect-container"><span class="text-gray-500">No options available.</span></div>`;
    } else {
        const checkboxHtml = options.map(opt => `
            <label class="flex items-center space-x-2 p-1 rounded-md">
                <input type="checkbox" name="${fieldKey}" value="${opt.name}" data-dc="${opt.dc || 0}" data-cp="${opt.cp || 0}" ${savedArray.includes(opt.name) ? 'checked' : ''} class="h-4 w-4 rounded border-gray-600 bg-gray-700 text-gray-400 focus:ring-gray-500">
                <span class="uppercase">${opt.name}</span>
            </label>`).join('');
        return `<div class="multiselect-container">${checkboxHtml}</div>`;
    }
}

function createJsonListField(fieldKey, savedValue, isEditMode) {
    if (!isEditMode) {
        let displayValue = savedValue;
        try {
            const parsed = JSON.parse(savedValue);
            if (Array.isArray(parsed)) {
                displayValue = parsed.map(p => `${p.name.toUpperCase()}: ${p.value}`).join(', ');
            }
        } catch (e) { /* display raw string */ }
        return `<div class="global-form-input display-only-input">${displayValue}</div>`;
    }
    return `<div id="json-list-editor-${fieldKey}" class="p-2 border border-gray-600 rounded-md"></div>
                                <textarea id="${fieldKey}" name="${fieldKey}" class="hidden">${savedValue}</textarea>`;
}

function createReadonlyTextField(fieldKey, savedValue) {
    return `<input type="text" id="${fieldKey}" name="${fieldKey}" value="${savedValue || 0}" class="global-form-input cursor-not-allowed display-only-input" readonly>`;
}

async function createFormFieldHtml(fieldKey, fieldConfig, savedValue, collectionKey, isEditMode) {
    const labelText = (fieldConfig.label || fieldKey.replace(/_/g, ' ')).toUpperCase();
    let fieldHtml = '';
    const isHidden = fieldConfig.hidden || false;

    if (fieldConfig.manageable && isEditMode) {
        // Special rendering for manageable fields in edit mode
        const displayValue = Array.isArray(savedValue) ? savedValue.join(', ') : savedValue;
        fieldHtml = `
            <div id="unified-display-${fieldKey}" class="global-form-input display-only-input mb-2 min-h-[40px]">${displayValue || 'None'}</div>
            <input type="hidden" id="${fieldKey}" name="${fieldKey}" value="${savedValue || ''}">
            <button type="button" class="btn btn-secondary w-full"
                    onclick="openUnifiedSelectorModal('${fieldKey}', { type: '${fieldConfig.type}', source: '${fieldConfig.source}', label: '${labelText}' }, document.getElementById('${fieldKey}').value, (selection) => {
                        const fieldInput = document.getElementById('${fieldKey}');
                        const displayDiv = document.getElementById('unified-display-${fieldKey}');
                        fieldInput.value = selection;
                        displayDiv.textContent = Array.isArray(selection) ? selection.join(', ') : selection || 'None';
                    })">
                Select ${labelText}
            </button>
        `;
        return `<div class="${isHidden ? 'hidden' : ''}" data-field-key="${fieldKey}"><label class="global-form-label">${labelText}</label>${fieldHtml}</div>`;
    } else {
         // Fallback to original rendering for non-manageable or non-edit-mode fields
        let labelHtml = `<label for="${fieldKey}" class="global-form-label">${labelText}</label>`;
        switch (fieldConfig.type) {
            case 'boolean': fieldHtml = createBooleanField(fieldKey, savedValue, isEditMode); break;
            case 'radio': fieldHtml = createRadioField(fieldKey, fieldConfig, savedValue, isEditMode); break;
            case 'select': fieldHtml = await createSelectField(fieldKey, fieldConfig, savedValue, isEditMode); break;
            case 'multiselect': fieldHtml = await createMultiselectField(fieldKey, fieldConfig, savedValue, isEditMode); break;
            case 'json_list': fieldHtml = createJsonListField(fieldKey, savedValue, isEditMode); break;
            case 'textarea': fieldHtml = createTextareaField(fieldKey, savedValue, isEditMode, collectionKey); break;
            case 'readonlytext': fieldHtml = createReadonlyTextField(fieldKey, savedValue); break;
            case 'number': fieldHtml = createNumberField(fieldKey, savedValue, isEditMode); break;
            default: fieldHtml = createTextField(fieldKey, savedValue, isEditMode);
        }
        return `<div class="${isHidden ? 'hidden' : ''}" data-field-key="${fieldKey}">${labelHtml}${fieldHtml}</div>`;
    }
}

window.openModal = openModal;
function getSingularLabel(label) {
    if (!label) return '';
    const upperLabel = label.toUpperCase();
    if (upperLabel === 'SPECIES') {
        return 'Species';
    }
    if (upperLabel.endsWith('IES')) {
        return label.slice(0, -3) + 'Y';
    }
    if (upperLabel.endsWith('S')) {
        return label.slice(0, -1);
    }
    return label;
}

async function openModal(collectionKey, docId = null, data = {}, isEditMode = false) {
    // Determine if the user CAN edit, based on permissions.
    const canPerformAction = docId ? hasPermission('edit', data) : hasPermission('create');
    // The modal is in "edit mode" only if the user has permission AND requested it OR if dev mode is on.
    const finalEditMode = canPerformAction && (isEditMode || appState.devMode);

    appState.editingDocId = docId;
    entryForm.dataset.collectionKey = collectionKey;

    const config = getActiveConfig(collectionKey);

    const modalLabel = getSingularLabel(config.label).toUpperCase();
    const modalHeader = modalTitle.parentElement;

    // Clear previous back button and set title
    const existingBackBtn = modalHeader.querySelector('#modal-back-btn');
    if (existingBackBtn) existingBackBtn.remove();
    modalTitle.textContent = `${finalEditMode ? 'MANAGE' : 'VIEW'} ${modalLabel}`;

    // Add Back button if there's a navigation context
    if (appState.navigationContext) {
        const backButton = document.createElement('button');
        backButton.id = 'modal-back-btn';
        backButton.className = 'btn btn-secondary !py-1 !px-2 mr-4';
        backButton.textContent = 'BACK';
        backButton.addEventListener('click', (e) => {
            e.preventDefault();
            const goBackInModal = () => {
                const { parentCollection, docId, data } = appState.navigationContext;
                appState.navigationContext = null;
                openModal(parentCollection, docId, data, true);
            };

            if (isFormDirty()) {
                 appState.pendingNavigation = () => {
                    closeModal(true);
                    goBackInModal();
                 };
                unsavedChangesModal.classList.remove('hidden');
            } else {
                goBackInModal();
            }
        });
        modalHeader.prepend(backButton);
    }

    formFieldsContainer.innerHTML = '<div class="text-center">LOADING...</div>';
    entryModal.classList.remove('hidden');

    const availableFields = Object.keys(config.fields);

    // This sort logic was already correct. Re-applying for clarity.
    const sortedFieldKeys = availableFields.sort((a, b) => {
        const indexA = masterFieldOrder.indexOf(a);
        const indexB = masterFieldOrder.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });

    const formHtmlPromises = sortedFieldKeys.map(fieldKey => {
        const fieldConfig = config.fields[fieldKey];
        const savedValue = data[fieldKey] === undefined ? (fieldConfig.type === 'multiselect' ? [] : (fieldConfig.type === 'json_list' ? '[]' : (fieldConfig.type === 'number' ? 0 : ''))) : data[fieldKey];
        return createFormFieldHtml(fieldKey, fieldConfig, savedValue, collectionKey, finalEditMode);
    });

    const formHtml = await Promise.all(formHtmlPromises);

    formFieldsContainer.innerHTML = formHtml.join('');

    const creatorInfo = document.getElementById('creator-info');
    if (data.creatorEmail) {
        creatorInfo.textContent = `Created by: ${data.creatorEmail}`;
        creatorInfo.classList.remove('hidden');
    } else {
        creatorInfo.classList.add('hidden');
    }

    const modalDataBtn = document.getElementById('modal-data-btn');
    const modalDataDropdown = document.getElementById('modal-data-dropdown');

    modalDataDropdown.innerHTML = ''; // Clear previous items

    if (finalEditMode) {
        const saveButton = document.createElement('button');
        saveButton.type = 'submit';
        saveButton.setAttribute('form', 'entry-form');
        saveButton.textContent = 'Save';
        modalDataDropdown.appendChild(saveButton);
    }


    const summaryButton = document.createElement('button');
    summaryButton.id = 'modal-summary-btn';
    summaryButton.textContent = 'Summary';
    summaryButton.addEventListener('click', () => showSummaryModal('modal'));
    modalDataDropdown.appendChild(summaryButton);

    const localMenuContainer = document.createElement('div');
    localMenuContainer.className = 'submenu-container';
    localMenuContainer.innerHTML = `
        <span>Local</span>
        <div class="submenu">
            <button id="modal-local-save-btn">Save</button>
            <button id="modal-local-load-btn">Load</button>
        </div>
    `;
    modalDataDropdown.appendChild(localMenuContainer);

    const cancelButton = document.createElement('button');
    cancelButton.id = 'modal-cancel-btn';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => closeModal());
    modalDataDropdown.appendChild(cancelButton);

    if (docId && hasPermission('delete', data)) {
        const deleteButton = document.createElement('button');
        deleteButton.id = 'modal-delete-btn';
        deleteButton.className = 'text-red-400 hover:bg-red-800';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => deleteEntry(collectionKey, docId));
        modalDataDropdown.appendChild(deleteButton);
    }


    modalDataBtn.onclick = (e) => {
        e.stopPropagation();
        modalDataDropdown.classList.toggle('show');
    };

    document.getElementById('modal-local-save-btn').addEventListener('click', () => saveLocal(entryForm, collectionKey));
    document.getElementById('modal-local-load-btn').addEventListener('click', () => loadLocal(entryForm));
    document.getElementById('entry-form').addEventListener('submit', handleFormSubmit);

    formFieldsContainer.querySelectorAll('button[data-manage-source]').forEach(button => {
        button.addEventListener('click', () => handleManageClick(button.dataset.manageSource));
    });

    if (finalEditMode) {
        if (collectionKey === 'rules_codex') {
            const editorContainers = formFieldsContainer.querySelectorAll('.quill-editor-container');
            editorContainers.forEach(container => {
                const fieldKey = container.id.replace('editor-', '');
                const hiddenInput = document.getElementById(fieldKey);
                const quill = new Quill(container, {
                    modules: {
                        toolbar: [
                            [{ 'header': [1, 2, 3, false] }],
                            ['bold', 'italic', 'underline', 'link'],
                            [{ 'color': [] }]
                        ]
                    },
                    theme: 'snow'
                });
                quill.root.innerHTML = data[fieldKey] || '';
                hiddenInput.value = data[fieldKey] || '';
                quill.on('text-change', () => { hiddenInput.value = quill.root.innerHTML; });

                // Add event listeners to toggle a class on the parent frame for focus glow
                quill.on('selection-change', (range) => {
                    const frame = container.closest('.quill-editor-frame');
                    if (frame) {
                        if (range) {
                            frame.classList.add('frame-focused');
                        } else {
                            frame.classList.remove('frame-focused');
                        }
                    }
                });
            });
        } else {
            const textareas = formFieldsContainer.querySelectorAll('textarea');
            const autosize = (el) => {
                setTimeout(() => {
                    el.style.height = 'auto';
                    el.style.height = (el.scrollHeight) + 'px';
                }, 0);
            };

            textareas.forEach(textarea => {
                textarea.addEventListener('input', () => autosize(textarea));
                autosize(textarea);
            });
        }
    }


    for (const fieldKey of Object.keys(config.fields)) {
        const fieldConfig = config.fields[fieldKey];
        if (fieldConfig.type === 'json_list' && finalEditMode) {
            await setupJsonListEditor(fieldKey, fieldConfig);
        }
    }

    if (collectionKey === 'modifier' || collectionKey === 'prerequisite') {
        const aspectSelect = formFieldsContainer.querySelector('#aspect');
        const aspectSubtypeContainer = formFieldsContainer.querySelector('#aspect_subtype')?.parentElement;

            const toggleField = (fieldName, show) => {
                const fieldContainer = formFieldsContainer.querySelector(`[data-field-key="${fieldName}"]`);
                if (fieldContainer) {
                    fieldContainer.classList.toggle('hidden', !show);
                }
            };

            const handleBonusScopeChange = () => {
                const selectedAspect = aspectSelect.value;
                const scope = formFieldsContainer.querySelector('input[name="bonus_scope"]:checked')?.value;
                if (selectedAspect === 'feature') {
                    toggleField('bonus_feature_categories', scope === 'specific');
                } else if (selectedAspect === 'skill') {
                    toggleField('bonus_skill_categories', scope === 'specific');
                }
            };

        const updateSubtypeOptions = async () => {
            const selectedAspect = aspectSelect.value;
            const subtypeSelect = formFieldsContainer.querySelector('#aspect_subtype');
            if (!subtypeSelect || !aspectSubtypeContainer) return;

            const currentSubtypeValue = data.aspect_subtype || '';
            subtypeSelect.innerHTML = '<option value="">--CHOOSE--</option>';
            aspectSubtypeContainer.style.display = 'none';

                // Hide all bonus-related fields by default
                const allBonusFields = ['bonus_scope', 'bonus_feature_categories', 'bonus_skill_categories', 'bonus_attribute_group'];
                allBonusFields.forEach(field => toggleField(field, false));

            let options = [];

            const attributeOptions = ['Strength', 'Agility', 'Constitution', 'Intellect', 'Wisdom', 'Charisma', 'Might', 'Reflex', 'Fortitude', 'Logic', 'Will', 'Etiquette'];
            const skillOptions = async () => {
                const individualSkills = await getCollectionOptions('skills');
                return individualSkills.map(s => s.name);
            };
            const combatOptions = [
                'health', 'vitality', 'initiative',
                'melee attack', 'ranged attack', 'unarmed attack',
                'ballistic weapon attack', 'heavy weapon attack', 'energy weapon attack', 'heavy energy weapon attack',
                'damage', 'melee damage', 'ranged damage', 'critical score',
                'dodge', 'parry', 'block', 'charge', 'disarm', 'grapple', 'overrun', 'sunder', 'trip', 'drag', 'aim', 'flanking',
                'Head DR', 'Torso DR', 'Right Arm DR', 'Left Arm DR', 'Right Leg DR', 'Left Leg DR'
            ];
            const otherOptions = ['karma', 'plot points', 'tech level', 'meta level', 'size', 'durability', 'carry capacity', 'component slot', 'ammunition capacity', 'wealth', 'Walk Speed', 'Swim Speed', 'Climb Speed', 'Fly Speed', 'Perception', 'Meta Perception', 'Social Perception', 'Technology Perception', 'aid'];

                if (selectedAspect === 'attribute') {
                options = attributeOptions;
                    toggleField('bonus_attribute_group', true);
                } else if (selectedAspect === 'skill') {
                options = await skillOptions();
                    toggleField('bonus_scope', true);
                    handleBonusScopeChange(); // Also call it here to set initial state
                } else if (selectedAspect === 'feature') {
                    toggleField('bonus_scope', true);
                    handleBonusScopeChange(); // Also call it here to set initial state
                } else if (selectedAspect === 'combat') {
                options = combatOptions;
                } else if (selectedAspect === 'other') {
                options = otherOptions;
            }

            if (options.length > 0) {
                options.forEach(opt => {
                    subtypeSelect.innerHTML += `<option value="${opt}" ${currentSubtypeValue === opt ? 'selected' : ''}>${opt.toUpperCase()}</option>`;
                });
                aspectSubtypeContainer.style.display = '';
            }
            subtypeSelect.value = currentSubtypeValue;
        };

        if(aspectSelect && finalEditMode){
            aspectSelect.addEventListener('change', updateSubtypeOptions);

            const bonusScopeRadios = formFieldsContainer.querySelectorAll('input[name="bonus_scope"]');
                bonusScopeRadios.forEach(radio => radio.addEventListener('change', handleBonusScopeChange));

            await updateSubtypeOptions();
        }
    }

    if (collectionKey === 'area') {
        const shapeSelect = formFieldsContainer.querySelector('#shape');
        const dimensionsFieldContainer = formFieldsContainer.querySelector('#dimensions')?.parentElement;

        const updateDimensionsField = () => {
            if (!shapeSelect || !dimensionsFieldContainer) return;

            const selectedShape = shapeSelect.value;
            const savedValue = data.dimensions || '';

            const label = dimensionsFieldContainer.querySelector('label');
            dimensionsFieldContainer.innerHTML = '';
            if (label) dimensionsFieldContainer.appendChild(label);

            const dimensionOptions = {
                burst: ['5-foot radius', '15-foot radius', '30-foot radius', '60-foot radius'],
                cone: ['15-foot length', '30-foot length', '45-foot length'],
                line: ['30-foot length', '60-foot length', '90-foot length']
            };

            if (dimensionOptions[selectedShape]) {
                const select = document.createElement('select');
                select.id = 'dimensions';
                select.name = 'dimensions';
                select.className = 'global-form-input form-select-arrow';
                let optionsHtml = '<option value="">--CHOOSE--</option>';
                optionsHtml += dimensionOptions[selectedShape].map(opt => `<option value="${opt}" ${savedValue === opt ? 'selected' : ''}>${opt.toUpperCase()}</option>`).join('');
                select.innerHTML = optionsHtml;
                if (!finalEditMode) {
                    select.disabled = true;
                    select.classList.add('display-only-input');
                }
                dimensionsFieldContainer.appendChild(select);
            } else if (selectedShape === 'cubes') {
                const input = document.createElement('input');
                input.type = 'text';
                input.id = 'dimensions';
                input.name = 'dimensions';
                input.value = '10ft x 10ft x 10ft cube per invocation level';
                input.className = 'global-form-input cursor-not-allowed bg-gray-600';
                input.readOnly = true;
                if (!finalEditMode) {
                    input.classList.add('display-only-input');
                }
                dimensionsFieldContainer.appendChild(input);
            } else {
                const select = document.createElement('select');
                select.id = 'dimensions';
                select.name = 'dimensions';
                select.className = 'global-form-input form-select-arrow';
                select.disabled = true;
                select.innerHTML = '<option value="">--SELECT SHAPE FIRST--</option>';
                if (!finalEditMode) {
                    select.classList.add('display-only-input');
                }
                dimensionsFieldContainer.appendChild(select);
            }
        };

        if (shapeSelect && dimensionsFieldContainer) {
            if (finalEditMode) {
                shapeSelect.addEventListener('change', updateDimensionsField);
            } else {
                shapeSelect.disabled = true;
                shapeSelect.classList.add('display-only-input');
            }
            updateDimensionsField();
        }
    }

    setupDynamicCalculations(formFieldsContainer);
    appState.initialFormState = getFormState(entryForm);
    updateUIAfterAuthChange();
}

function setupDynamicCalculations(formContainer) {
    const designDcInput = formContainer.querySelector('#design_dc');
    if (!designDcInput) return;

    const updateTotals = () => {
        let totalDc = 0;

        const checkedBoxes = formContainer.querySelectorAll('input[type=checkbox]:checked');
        checkedBoxes.forEach(box => {
            totalDc += Number(box.dataset.dc) || 0;
        });

        const selects = formContainer.querySelectorAll('select');
        selects.forEach(select => {
            if (select.selectedOptions.length > 0) {
                const selectedOption = select.selectedOptions[0];
                if (selectedOption && selectedOption.value) {
                    totalDc += Number(selectedOption.dataset.dc) || 0;
                }
            }
        });

        designDcInput.value = totalDc;
    };

    const allSelectableInputs = formContainer.querySelectorAll('select, input[type=checkbox]');
    allSelectableInputs.forEach(input => {
        if (!input.readOnly && !input.disabled) {
            input.addEventListener('change', updateTotals);
        }
    });

    updateTotals();
}


async function setupJsonListEditor(fieldKey, fieldConfig) {
    const editorContainer = document.getElementById(`json-list-editor-${fieldKey}`);
    const textarea = document.getElementById(fieldKey);
    let items = [];
    try {
        const parsed = JSON.parse(textarea.value);
        if (Array.isArray(parsed)) {
            items = parsed;
        }
    } catch (e) {
        console.error("Could not parse prerequisite JSON:", textarea.value);
        items = [];
    }

    const redrawList = () => {
        editorContainer.innerHTML = '';
        const listContainer = document.createElement('div');
        listContainer.className = 'space-y-2 mb-2';
        items.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'prereq-item';
            itemEl.innerHTML = `<span>${item.name.toUpperCase()}: ${item.value}</span>`;
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.innerHTML = '&times;';
            removeBtn.className = 'ml-4 font-bold text-red-500 hover:text-red-300';
            removeBtn.addEventListener('click', () => {
                items.splice(index, 1);
                textarea.value = JSON.stringify(items);
                redrawList();
            });
            itemEl.appendChild(removeBtn);
            listContainer.appendChild(itemEl);
        });
        editorContainer.appendChild(listContainer);

        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.textContent = 'ADD REQUIREMENT';
        addBtn.className = 'btn btn-secondary w-full !py-1 !text-xs';
        addBtn.addEventListener('click', () => showAddForm());
        editorContainer.appendChild(addBtn);
    };

    const showAddForm = async () => {
        editorContainer.innerHTML = ''; /* Clear to show the form */
        const formContainer = document.createElement('div');
        formContainer.className = 'p-2 space-y-2 rounded-md';
        formContainer.style.backgroundColor = 'var(--bg-main)';

        let selectOptions = [];
        if (fieldConfig.source) {
            let sourceItems = await getCollectionOptions(fieldConfig.source);
            if (fieldConfig.source === 'feature' && appState.editingDocId) {
                    sourceItems = sourceItems.filter(item => item.id !== appState.editingDocId);
            }
            selectOptions = sourceItems.map(item => `<option value="${item.name}">${item.name.toUpperCase()}</option>`);
        } else if (fieldConfig.options) {
            selectOptions = fieldConfig.options.map(opt => `<option value="${opt}">${opt.toUpperCase()}</option>`);
        }

        const valueInputHtml = (fieldConfig.source === 'feature') ? '' : `<input type="number" id="prereq-value-input" class="global-form-input" placeholder="VALUE" value="1">`;


        formContainer.innerHTML = `
            <select class="global-form-input form-select-arrow" id="prereq-name-input">${selectOptions.join('')}</select>
            ${valueInputHtml}
            <div class="flex justify-end gap-2">
                <button type="button" id="prereq-cancel-btn" class="btn btn-secondary !text-xs !py-1 !px-2">CANCEL</button>
                <button type="button" id="prereq-add-btn" class="btn btn-primary !text-xs !py-1 !px-2">ADD</button>
            </div>
        `;

        editorContainer.appendChild(formContainer);

        document.getElementById('prereq-cancel-btn').addEventListener('click', () => redrawList());
        document.getElementById('prereq-add-btn').addEventListener('click', () => {
            const nameInput = document.getElementById('prereq-name-input');
            const valueInput = document.getElementById('prereq-value-input');
            const value = (fieldConfig.source === 'feature') ? 1 : (valueInput ? Number(valueInput.value) : 1);

            if (nameInput.value) {
                items.push({ name: nameInput.value, value: value });
                textarea.value = JSON.stringify(items);
                redrawList();
            }
        });
    };

    redrawList();
}

function closeModal(force = false) {
    const isModalOpen = !entryModal.classList.contains('hidden');
    if (appState.onNewEntrySave) {
        appState.onNewEntrySave(null, null); // Signal cancellation
    }
    if (!force && isModalOpen && isFormDirty()) {
        appState.pendingNavigation = null; /* Clear pending nav if any */
        unsavedChangesModal.classList.remove('hidden');
        return;
    }
    appState.initialFormState = null;
    appState.editingDocId = null;
    if (!force) {
        appState.navigationContext = null;
    }
    if(entryForm) entryForm.reset();
    const modalDataDropdown = document.getElementById('modal-data-dropdown');
    if(modalDataDropdown) modalDataDropdown.innerHTML = '';
    if(entryModal) entryModal.classList.add('hidden');
}

async function saveCurrentForm() {
    const isCreating = !appState.editingDocId;

    if (isCreating && !hasPermission('create')) {
        showError("You do not have permission to create new entries.");
        return { success: false };
    }

    const form = document.getElementById('entry-form');
    const collectionKey = form.dataset.collectionKey;
    const docId = appState.editingDocId;

    if (!collectionKey) {
        console.error("No collectionKey found on form dataset. Aborting save.");
        showError("A critical error occurred. Could not determine where to save the data.");
        return { success: false };
    }

    const config = getActiveConfig(collectionKey);
    const dataFromForm = getFormDataObject(form);
    const sanitizedData = { ...dataFromForm };

    // --- Definitive Fix: Sanitize data before sending to Firestore ---
    for (const fieldKey in config.fields) {
        const fieldConfig = config.fields[fieldKey];
        const currentValue = sanitizedData[fieldKey];

        // Ensure multiselects are always arrays
        if (fieldConfig.type === 'multiselect') {
            if (currentValue === undefined) {
                sanitizedData[fieldKey] = []; // If no options selected, set to empty array
            } else if (!Array.isArray(currentValue)) {
                sanitizedData[fieldKey] = [currentValue]; // If one option selected, wrap it in an array
            }
        }
        // Ensure numbers are numbers, not strings
        else if (fieldConfig.type === 'number' || fieldConfig.type === 'readonlytext') {
             const num = Number(currentValue);
             sanitizedData[fieldKey] = isNaN(num) ? 0 : num; // Default to 0 if not a number
        }
        // Ensure booleans are booleans
        else if (fieldConfig.type === 'boolean') {
            sanitizedData[fieldKey] = currentValue === 'true' || currentValue === true;
        }
        // Ensure other undefined fields have a valid default
        else if (currentValue === undefined) {
             if (fieldConfig.type === 'json_list') {
                sanitizedData[fieldKey] = '[]';
            } else {
                sanitizedData[fieldKey] = ''; // Default for text, textarea, select
            }
        }
    }

    if (sanitizedData.parent === '') {
        sanitizedData.parent = null;
    }

    const collectionPath = `artifacts/${appId}/public/data/${collectionKey}`;
    let newDocId = docId;

    try {
        if (docId) { // This is an update
            const docRef = doc(db, collectionPath, docId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists() || !hasPermission('edit', docSnap.data())) {
                showError("You do not have permission to edit this entry or it does not exist.");
                return { success: false };
            }

            const existingData = docSnap.data();
            const updateData = {
                ...sanitizedData,
                creatorId: existingData.creatorId,
                creatorEmail: existingData.creatorEmail
            };
            await updateDoc(docRef, updateData);

        } else { // This is a creation
            sanitizedData.creatorId = appState.userId;
            sanitizedData.creatorEmail = auth.currentUser?.email || 'anonymous';
            const newDocRef = await addDoc(collection(db, collectionPath), sanitizedData);
            newDocId = newDocRef.id; // Get the ID of the newly created document
        }

        appState.initialFormState = getFormState(form);
        return { success: true, collectionKey, docId: newDocId, data: sanitizedData };
    } catch (error) {
        console.error("Error saving data:", error);
        showError(`Error saving data. Check console for details. Error: ${error.message}`);
        return { success: false };
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const result = await saveCurrentForm();
    if (result.success) {
        if (appState.onNewEntrySave) {
            closeModal(true);
            appState.onNewEntrySave(result.docId, result.data.name);
        } else {
            const { collectionKey, docId, data } = result;
            closeModal(true);
            openModal(collectionKey, docId, data, true);
        }
    }
}

async function deleteEntry(collectionKey, docId) {
    if (!docId) return;
    const collectionPath = `artifacts/${appId}/public/data/${collectionKey}`;
    const docRef = doc(db, collectionPath, docId);
    const docSnap = await getDoc(docRef);

    if (!hasPermission('delete', docSnap.data())) {
         showError("You do not have permission to delete this entry.");
        return;
    }

    showConfirmModal(`ARE YOU SURE YOU WANT TO DELETE THIS ENTRY? THIS ACTION CANNOT BE UNDONE.`, async () => {
        closeModal();
        try {
            await deleteDoc(docRef);
            if (collectionKey === 'rules_codex' && appState.currentWikiEntryId === docId) {
                document.getElementById('wiki-entry-title').textContent = 'Select an Entry';
                document.getElementById('wiki-entry-body').innerHTML = '<p class="text-gray-400">Please select an entry from the left sidebar or create a new one.</p>';
                if(document.getElementById('wiki-edit-btn')) document.getElementById('wiki-edit-btn').classList.add('hidden');
                if(document.getElementById('wiki-delete-btn')) document.getElementById('wiki-delete-btn').classList.add('hidden');
                appState.currentWikiEntryId = null;
            }
        } catch (error) {
            console.error("Error deleting document:", error);
            showError("Error deleting entry. Check console for details.");
        }
    });
}

function showConfirmModal(message, onConfirm) {
    confirmMessage.textContent = message.toUpperCase();
    appState.confirmCallback = onConfirm;
    confirmModal.classList.remove('hidden');
}
function hideConfirmModal() { appState.confirmCallback = null; confirmModal.classList.add('hidden'); }

function showCustomModal(title, choices, onSelect) {
    const modal = document.getElementById('custom-modal');
    const titleEl = document.getElementById('custom-modal-title');
    const choicesEl = document.getElementById('custom-modal-choices');

    titleEl.textContent = title;
    choicesEl.innerHTML = '';

    choices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'btn btn-secondary';
        button.textContent = choice;
        button.addEventListener('click', () => {
            onSelect(choice);
            modal.classList.add('hidden');
        });
        choicesEl.appendChild(button);
    });

    modal.classList.remove('hidden');
    document.getElementById('custom-modal-cancel-btn').onclick = () => modal.classList.add('hidden');
}



function hideUnsavedChangesModal() {
    appState.pendingNavigation = null;
    unsavedChangesModal.classList.add('hidden');
}
function showError(message) { errorMessage.textContent = message.toUpperCase(); errorModal.classList.remove('hidden'); }
function hideErrorModal() { errorModal.classList.add('hidden'); }

function parseWikiLinks(text) {
    if (!text) return '';
    return text.replace(/\[\[(.*?)\]\]/g, (match, p1) => {
        const entryName = p1.trim();
        const docId = rulesCodexMap.get(entryName);
        if (docId) {
            return `<a href="#" class="wiki-link" data-linked-id="${docId}" data-linked-name="${entryName}">${entryName}</a>`;
        }
        return entryName;
    });
}

entryModal.addEventListener('click', async (event) => {
    if (event.target.classList.contains('wiki-link')) {
        event.preventDefault();
        const linkedDocId = event.target.dataset.linkedId;
        const linkedDocName = event.target.dataset.linkedName;

        if (linkedDocId) {
            const collectionPath = `artifacts/${appId}/public/data/rules_codex`;
            try {
                const docSnap = await getDoc(doc(db, collectionPath, linkedDocId));
                if (docSnap.exists()) {
                    if (appState.editingDocId !== linkedDocId) {
                        closeModal(true);
                    }
                    openModal('rules_codex', linkedDocId, docSnap.data(), appState.devMode);
                } else {
                    showError(`Linked entry "${linkedDocName}" not found.`);
                }
            } catch (error) {
                console.error("Error fetching linked document:", error);
                showError(`Could not load linked entry "${linkedDocName}".`);
            }
        }
    }
});


// --- Event Listeners ---
confirmOkBtn.addEventListener('click', () => { if (appState.confirmCallback) appState.confirmCallback(); hideConfirmModal(); });
confirmCancelBtn.addEventListener('click', hideConfirmModal);
unsavedCancelBtn.addEventListener('click', hideUnsavedChangesModal);
unsavedDismissBtn.addEventListener('click', () => {
    closeModal(true);
    if(appState.pendingNavigation) {
        navigateTo(appState.pendingNavigation);
        appState.pendingNavigation = null;
        appState.navigationContext = null;
    }
    hideUnsavedChangesModal();
});
unsavedSaveBtn.addEventListener('click', async () => {
    const success = await saveCurrentForm();
    if(success && appState.pendingNavigation) {
        closeModal(true);
        navigateTo(appState.pendingNavigation);
        appState.pendingNavigation = null;
        appState.navigationContext = null;
    }
    hideUnsavedChangesModal();
});

errorOkBtn.addEventListener('click', hideErrorModal);
summaryCloseBtn.addEventListener('click', () => { summaryModal.classList.add('hidden'); });

settingsCancelBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
settingsSaveBtn.addEventListener('click', () => {
    localStorage.setItem('geminiApiKey', apiKeyInput.value);
    settingsModal.classList.add('hidden');
});

window.addEventListener('click', (event) => {
    if (event.target == entryModal || event.target == confirmModal || event.target == errorModal || event.target == unsavedChangesModal || event.target == customModal || event.target == summaryModal || event.target == settingsModal) {
        if (event.target === entryModal) {
            appState.navigationContext = null;
            closeModal();
        }
        if (event.target == customModal) {
            customModal.classList.add('hidden');
        }
         if (event.target == settingsModal) {
            settingsModal.classList.add('hidden');
        }
        if (event.target == summaryModal) {
            summaryModal.classList.add('hidden');
        }
        if (event.target == aiAssistantModal) {
            aiAssistantModal.classList.add('hidden');
        }
        if (event.target == confirmModal) hideConfirmModal();
        if (event.target == errorModal) hideErrorModal();
        if (event.target == unsavedChangesModal) hideUnsavedChangesModal();
    }
    const menuButton = document.getElementById('category-menu-button');
    const dropdownMenu = document.getElementById('category-dropdown-menu');
    if (menuButton && dropdownMenu && !menuButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.classList.add('hidden');
    }

    const folioMenuButton = document.querySelector('.persona-folio-container .file-menu-button');
    const folioDropdownMenu = document.querySelector('.persona-folio-container .file-menu-dropdown');
    if (folioMenuButton && folioDropdownMenu && !folioMenuButton.contains(event.target) && !folioDropdownMenu.contains(event.target)) {
        folioDropdownMenu.classList.remove('show');
    }

    const modalDataBtn = document.getElementById('modal-data-btn');
    const modalDataDropdown = document.getElementById('modal-data-dropdown');
    if (modalDataBtn && modalDataDropdown && !modalDataBtn.contains(event.target) && !modalDataDropdown.contains(event.target)) {
        modalDataDropdown.classList.remove('show');
    }

    const wikiDataBtnInContent = document.getElementById('wiki-data-btn');
    const wikiDataDropdownInContent = document.getElementById('wiki-data-dropdown');
    if (wikiDataBtnInContent && wikiDataDropdownInContent && !wikiDataBtnInContent.contains(event.target) && !wikiDataDropdownInContent.contains(event.target)) {
        wikiDataDropdownInContent.classList.remove('show');
    }
});

function convertMarkdownToHtml(markdown) {
    if (!markdown) return '';
    const lines = markdown.trim().split('\n');
    let html = '';
    let inList = false;

    for (const line of lines) {
        if (line.startsWith('### ')) {
            if (inList) { html += '</ul>'; inList = false; }
            html += `<h3>${line.substring(4)}</h3>`;
        } else if (line.startsWith('## ')) {
            if (inList) { html += '</ul>'; inList = false; }
            html += `<h2>${line.substring(3)}</h2>`;
        } else if (line.startsWith('# ')) {
            if (inList) { html += '</ul>'; inList = false; }
            html += `<h1>${line.substring(2)}</h1>`;
        } else if (line.startsWith('* ')) {
            if (!inList) { html += '<ul>'; inList = true; }
            html += `<li>${line.substring(2)}</li>`;
        } else if (line.trim() === '') {
            if (inList) { html += '</ul>'; inList = false; }
            html += '<br>';
        } else {
            if (inList) { html += '</ul>'; inList = false; }
            html += `<p>${line}</p>`;
        }
    }
    if (inList) { html += '</ul>'; }
    return html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}