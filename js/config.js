
// js/config.js

export const categoryConfig = {
    other: {
        label: 'DASHBOARD',
        viewType: 'button_grid'
    },
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
    species: { 
        label: 'SPECIES',
        directory_columns: ['name', 'description', 'type'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea', aiEnabled: true },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            type: { type: 'multiselect', source: 'species_type', manageable: true },
            size: { type: 'multiselect', source: 'species_size', manageable: true },
            movement: { type: 'multiselect', source: 'species_movement', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
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
        directory_columns: ['name', 'description'],
        fields: { 
            name: { type:'text', required: true}, 
            description: { type:'textarea', aiEnabled: true },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
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
        directory_columns: ['name', 'description'],
        fields: { 
            name: { type:'text', required: true}, 
            description: { type:'textarea', aiEnabled: true},
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
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
        directory_columns: ['name', 'description'],
        fields: { 
            name: { type:'text', required: true}, 
            description: { type:'textarea', aiEnabled: true},
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            trait: { type: 'multiselect', source: 'trait', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        } 
    },
    disadvantages: { 
        label: 'DISADVANTAGES',
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
    features: { 
        label: 'FEATURES',
        directory_columns: ['name', 'type', 'description', 'cp'], 
        fields: { 
            name: { type:'text', required: true},
            type: { type: 'select', options: ['ability', 'combat', 'meta', 'general', 'karma', 'skill', 'special'] },
            description: { type:'textarea', aiEnabled: true},
            tech_level: { type: 'select', label: 'Tech Level', options: [0, 1, 2, 3, 4, 5] },
            meta_level: { type: 'select', label: 'Meta Level', options: [0, 1, 2, 3, 4, 5] },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true},
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            cp: { type: 'readonlytext', label: 'TOTAL CP' },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        } 
    },
    skills: { 
        label: 'SKILLS',
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
            aspect: { type: 'select', options: ['attribute', 'skill', 'combat', 'meta', 'other'] },
            aspect_subtype: { type: 'select' },
            value: { type: 'number' },
            modifier_type: { type: 'radio', label: 'Modifier Type', options: ['constant', 'situational', 'optional', 'temporary'] },
            dc: { type: 'number', label: 'DC' },
            mechanic: { type: 'textarea'},
            note: { type: 'textarea'},
            cp: { type: 'number' }
        }
    },
    augmentations: { 
        label: 'AUGMENTATIONS', 
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
    invocations: {
        label: 'INVOCATIONS',
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
                    mechanic: { type: 'textarea' },
                    note: { type: 'textarea' }
                }
            }
        }
    },
    equipment: { 
        label: 'EQUIPMENT', 
        viewType: 'multi-table',
        tables: {
            armoring: {
                label: 'Armoring',
                directory_columns: ['name', 'tl', 'ml', 'description', 'cost', 'design_dc'],
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
                }
            },
            weaponry: {
                label: 'Weaponry',
                directory_columns: ['name', 'tl', 'ml', 'description', 'cost', 'design_dc'],
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
                }
            },
            mecha: {
                label: 'Mecha',
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
        },
        subcategories: {
            availability: { 
                label: 'AVAILABILITY', 
                directory_columns: ['name', 'description'],
                fields: { 
                    name: { type: 'text', required: true }, 
                    description: { type: 'textarea' },
                    dc: { type: 'number', label: 'DC' },
                    prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
                    modifier: { type: 'multiselect', source: 'modifier', manageable: true },
                    mechanic: { type: 'textarea' },
                    note: { type: 'textarea' }
                }
            },
            material: { 
                label: 'MATERIALS', 
                directory_columns: ['name', 'description'],
                fields: { 
                    name: { type: 'text', required: true }, 
                    description: { type: 'textarea' }, 
                    dc: { type: 'number', label: 'DC' },
                    prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
                    modifier: { type: 'multiselect', source: 'modifier', manageable: true },
                    mechanic: { type: 'textarea' },
                    note: { type: 'textarea' }
                }
            },
            resistance: { 
                label: 'RESISTANCES', 
                directory_columns: ['name', 'type', 'value', 'description'],
                fields: { 
                    name: { type: 'text', required: true },
                    type: { type: 'select', source: 'resistance_type', manageable: true },
                    value: { type: 'number' },
                    description: { type: 'textarea' },
                    dc: { type: 'number', label: 'DC' },
                    prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
                    modifier: { type: 'multiselect', source: 'modifier', manageable: true },
                    mechanic: { type: 'textarea' },
                    note: { type: 'textarea' }
                }
            },
            resistance_type: { 
                label: 'RESISTANCE TYPES', 
                directory_columns: ['name', 'description'],
                fields: { 
                    name: { type: 'text', required: true },
                    description: { type: 'textarea' }
                }
            },
            special: { 
                label: 'SPECIAL',
                directory_columns: ['name', 'description'],
                fields: { 
                    name: { type: 'text', required: true },
                    description: { type: 'textarea' },
                    prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
                    modifier: { type: 'multiselect', source: 'modifier', manageable: true },
                    mechanic: { type: 'textarea' },
                    note: { type: 'textarea' }
                } 
            },
            mode: { 
                label: 'MODES', 
                directory_columns: ['name', 'description'],
                fields: { 
                    name: { type: 'text', required: true }, 
                    description: { type: 'textarea' },
                    prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
                    modifier: { type: 'multiselect', source: 'modifier', manageable: true },
                    mechanic: { type: 'textarea' },
                    note: { type: 'textarea' }
                }
            },
            critical_effect: { 
                label: 'CRITICAL EFFECTS', 
                fields: { 
                    name: { type: 'text', required: true },
                    description: { type: 'textarea' },
                    effect: { type: 'multiselect', source: 'effect', manageable: true },
                    prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
                    modifier: { type: 'multiselect', source: 'modifier', manageable: true },
                    mechanic: { type: 'textarea' },
                    note: { type: 'textarea' }
                }
            },
            component: { 
                label: 'COMPONENTS',
                directory_columns: ['name', 'description', 'cost'],
                fields: {
                    name: { type: 'text', required: true },
                    description: { type: 'textarea' },
                    equipment: { type: 'multiselect', source: 'all_equipment', label: 'Equipment', manageable: true },
                    cost: { type: 'number' }
                }
            },
            creator: {
                label: 'CREATORS',
                directory_columns: ['name', 'description'],
                fields: {
                    name: { type: 'text', required: true },
                    description: { type: 'textarea' },
                    dc: { type: 'number', label: 'DC' },
                    prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
                    modifier: { type: 'multiselect', source: 'modifier', manageable: true },
                    mechanic: { type: 'textarea' },
                    note: { type: 'textarea' }
                }
            },
            design: {
                label: 'DESIGNS',
                directory_columns: ['name', 'description'],
                fields: {
                    name: { type: 'text', required: true },
                    description: { type: 'textarea' },
                    dc: { type: 'number', label: 'DC' },
                    prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
                    modifier: { type: 'multiselect', source: 'modifier', manageable: true },
                    mechanic: { type: 'textarea' },
                    note: { type: 'textarea' }
                }
            },
            classification: { 
                label: 'CLASSIFICATIONS', 
                directory_columns: ['name', 'description'],
                fields: { 
                    name: { type: 'text', required: true }, 
                    description: { type: 'textarea' }, 
                    dc: { type: 'number', label: 'DC' },
                    prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
                    modifier: { type: 'multiselect', source: 'modifier', manageable: true },
                    mechanic: { type: 'textarea' },
                    note: { type: 'textarea' } 
                }
            },
            gear_category: { 
                label: 'CATEGORIES', 
                directory_columns: ['name', 'description'],
                fields: { 
                    name: { type: 'text', required: true }, 
                    description: { type: 'textarea' },
                    dc: { type: 'number', label: 'DC' },
                    prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
                    modifier: { type: 'multiselect', source: 'modifier', manageable: true },
                    mechanic: { type: 'textarea' },
                    note: { type: 'textarea' }
                }
            },
            body_location: { 
                label: 'BODY LOCATIONS', 
                directory_columns: ['name', 'description'],
                fields: { 
                    name: { type: 'text', required: true }, 
                    description: { type: 'textarea' },
                    mechanic: { type: 'textarea' },
                    note: { type: 'textarea' }
                }
            }
        }
    },
    societies: { 
        label: 'SOCIETIES', 
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
            society_weaponry: { label: 'WEAPONRY', directory_columns: ['name', 'description', 'level'], fields: { name: { type: 'text' }, description: { type: 'textarea', aiEnabled: true }, level: { type: 'select', options: [0, 1, 2, 3, 4, 5] }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, note: { type: 'textarea' }, mechanic: { type: 'textarea'} }}
        }
    }
};

export const masterFieldOrder = [
    'name', 'description', 'mechanic', 'guide', 'effect_type', 'value', 'shape', 'dimensions', 'number_of_targets',
    'tech_level', 'meta_level', 'class', 'classification', 'category', 'type', 'subtype',
    'cr', 'cost', 'availability', 'dc', 'cp', 'restricted', 'component_slots',
    'location', 'size', 'height', 'weight', 'scaling', 'height_length_range', 'weight_range', 'personnel', 'cargo', 'reach', 'weapon_effect', 'wielding',
    'movement', 'speed',
    'quality', 'material', 'durability', 'resistance',
    'prerequisite', 'modifier', 'modifier_type', 'abilities',
    'ammunition_type', 'ap', 'area', 'attack_rate', 'damage', 'damage_type', 'damage_value', 'effect', 'effect_subtype', 'range', 'target', 'critical_score', 'critical_success_effect', 'critical_failure_effect', 'critical_effect',
    'skill', 'meta_skill', 'faction_skill', 'profession_skill', 'species_skill', 'is_specialization', 'base_skill', 'discipline', 'accuracy', 'control', 'maneuverability',
    'faction_feat', 'recommended_feature',
    'trait',
    'attitude', 'social_strengths', 'social_weaknesses', 'society', 'value', 'goals',
    'component', 'integration',
    'special',
    'modes', 'note', 'parent', 'order' 
];
