import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    // Quality gates. Warnings, so existing code over the limits does not block commits.
    name: 'app/quality-gates',
    rules: {
      'max-lines': ['warn', { max: 200, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['warn', { max: 20, skipBlankLines: true, skipComments: true }],
      'max-params': ['warn', 3],
      'max-depth': ['warn', 2],
    },
  },

  {
    name: 'app/tests',
    files: ['**/*.test.ts'],
    rules: { 'max-lines-per-function': 'off' },
  },

  skipFormatting,
)
