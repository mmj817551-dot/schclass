// Pinia store skeleton for config
import { defineStore } from 'pinia';
import { getConfig, updateConfig } from '../services/config.api.js';
import { SUBJECTS, DEFAULT_SLOT_DISPLAY_MAP } from '../constants/dicts.js';

export const useConfigStore = defineStore('config', {
  state: () => ({
    subjects: SUBJECTS,
    slotDisplayMap: { ...DEFAULT_SLOT_DISPLAY_MAP },
    largeRoomCapacity: 10,
    weekStart: 'monday', // 'monday' | 'sunday'
    timezone: 'Asia/Shanghai',
    loaded: false,
    loading: false,
  }),
  actions: {
    async load() {
      this.loading = true;
      try {
        const cfg = await getConfig();
        if (cfg) {
          if (cfg.subjects) this.subjects = cfg.subjects;
          if (cfg.slotDisplayMap) this.slotDisplayMap = cfg.slotDisplayMap;
          if (cfg.largeRoomCapacity != null) this.largeRoomCapacity = cfg.largeRoomCapacity;
          if (cfg.weekStart) this.weekStart = cfg.weekStart;
          if (cfg.timezone) this.timezone = cfg.timezone;
        }
        this.loaded = true;
        return cfg;
      } finally {
        this.loading = false;
      }
    },
    async update(patch) {
      const res = await updateConfig(patch);
      // optimistic update
      if (patch.subjects) this.subjects = patch.subjects;
      if (patch.slotDisplayMap) this.slotDisplayMap = patch.slotDisplayMap;
      if (patch.largeRoomCapacity != null) this.largeRoomCapacity = patch.largeRoomCapacity;
      if (patch.weekStart) this.weekStart = patch.weekStart;
      if (patch.timezone) this.timezone = patch.timezone;
      return res;
    },
  },
});

