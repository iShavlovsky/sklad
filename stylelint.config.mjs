const ownClassNamePattern = [
  '^([a-z][a-zA-Z0-9]*|is-[a-z0-9]+(?:-[a-z0-9]+)*|has-[a-z0-9]+(?:-[a-z0-9]+)*|u-[a-z0-9]+(?:-[a-z0-9]+)*|mantine-[A-Za-z0-9]+-[A-Za-z0-9-]+)$',
  {
    message:
      'Expected CSS Module class to be camelCase. Allowed exceptions: is-*, has-*, u-*, mantine-*.',
  },
];

const customPropertyPattern = [
  '^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$',
  {
    message: 'Expected custom property to be kebab-case.',
  },
];

const layoutProperties = [
  'content',
  'box-sizing',
  'display',

  'position',
  'inset',
  'inset-block',
  'inset-block-start',
  'inset-block-end',
  'inset-inline',
  'inset-inline-start',
  'inset-inline-end',
  'top',
  'right',
  'bottom',
  'left',
  'z-index',

  'isolation',
  'contain',
  'content-visibility',
  'container',
  'container-name',
  'container-type',

  'float',
  'clear',

  'flex',
  'flex-direction',
  'flex-wrap',
  'flex-flow',
  'flex-grow',
  'flex-shrink',
  'flex-basis',

  'grid',
  'grid-template',
  'grid-template-columns',
  'grid-template-rows',
  'grid-template-areas',
  'grid-auto-columns',
  'grid-auto-rows',
  'grid-auto-flow',
  'grid-column',
  'grid-column-start',
  'grid-column-end',
  'grid-row',
  'grid-row-start',
  'grid-row-end',
  'grid-area',

  'place-content',
  'place-items',
  'place-self',
  'align-content',
  'align-items',
  'align-self',
  'justify-content',
  'justify-items',
  'justify-self',

  'gap',
  'row-gap',
  'column-gap',
];

const boxProperties = [
  'width',
  'min-width',
  'max-width',
  'height',
  'min-height',
  'max-height',
  'inline-size',
  'min-inline-size',
  'max-inline-size',
  'block-size',
  'min-block-size',
  'max-block-size',
  'aspect-ratio',

  'margin',
  'margin-block',
  'margin-block-start',
  'margin-block-end',
  'margin-inline',
  'margin-inline-start',
  'margin-inline-end',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',

  'padding',
  'padding-block',
  'padding-block-start',
  'padding-block-end',
  'padding-inline',
  'padding-inline-start',
  'padding-inline-end',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',

  'overflow',
  'overflow-x',
  'overflow-y',
  'overflow-block',
  'overflow-inline',
  'overscroll-behavior',
  'overscroll-behavior-x',
  'overscroll-behavior-y',
  'scroll-behavior',
  'scroll-margin',
  'scroll-padding',
];

const visualProperties = [
  'border',
  'border-width',
  'border-style',
  'border-color',
  'border-top',
  'border-top-width',
  'border-top-style',
  'border-top-color',
  'border-right',
  'border-right-width',
  'border-right-style',
  'border-right-color',
  'border-bottom',
  'border-bottom-width',
  'border-bottom-style',
  'border-bottom-color',
  'border-left',
  'border-left-width',
  'border-left-style',
  'border-left-color',
  'border-radius',
  'border-start-start-radius',
  'border-start-end-radius',
  'border-end-start-radius',
  'border-end-end-radius',
  'outline',
  'outline-width',
  'outline-style',
  'outline-color',
  'outline-offset',

  'background',
  'background-color',
  'background-image',
  'background-position',
  'background-position-x',
  'background-position-y',
  'background-size',
  'background-repeat',
  'background-origin',
  'background-clip',

  'box-shadow',
  'filter',
  'backdrop-filter',
  'opacity',
  'mix-blend-mode',

  'object-fit',
  'object-position',
];

const typographyProperties = [
  'color',
  'font',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'font-variant',
  'font-feature-settings',
  'font-variation-settings',
  'line-height',
  'letter-spacing',
  'text-align',
  'text-decoration',
  'text-decoration-line',
  'text-decoration-color',
  'text-decoration-thickness',
  'text-underline-offset',
  'text-transform',
  'text-overflow',
  'text-wrap',
  'white-space',
  'word-break',
  'overflow-wrap',
  'hyphens',
  'list-style',
  'list-style-type',
  'list-style-position',
  'list-style-image',
];

const interactionProperties = [
  'appearance',
  'visibility',
  'pointer-events',
  'cursor',
  'user-select',
  'touch-action',
  'resize',
  'accent-color',
  'caret-color',
];

const motionProperties = [
  'transition',
  'transition-property',
  'transition-duration',
  'transition-timing-function',
  'transition-delay',

  'transform',
  'transform-origin',
  'translate',
  'scale',
  'rotate',

  'animation',
  'animation-name',
  'animation-duration',
  'animation-timing-function',
  'animation-delay',
  'animation-iteration-count',
  'animation-direction',
  'animation-fill-mode',
  'animation-play-state',

  'will-change',
];

/** @type {import("stylelint").Config} */
export default {
  extends: ['stylelint-config-standard'],

  plugins: ['stylelint-order'],

  ignoreFiles: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/.nuxt/**',
    '**/coverage/**',
    '**/public/**',
    '**/*.min.css',
  ],

  reportDescriptionlessDisables: true,
  reportInvalidScopeDisables: true,
  reportNeedlessDisables: true,

  rules: {
    /**
     * Structure inside declaration blocks:
     * 1. CSS variables
     * 2. regular declarations
     * 3. nested selectors
     * 4. nested at-rules
     */
    'order/order': [
      ['custom-properties', 'declarations', 'rules', 'at-rules'],
      {
        unspecified: 'bottom',
      },
    ],

    'order/properties-order': [
      [
        {
          groupName: 'layout',
          properties: layoutProperties,
          noEmptyLineBetween: true,
        },
        {
          groupName: 'box',
          properties: boxProperties,
          noEmptyLineBetween: true,
        },
        {
          groupName: 'visual',
          properties: visualProperties,
          noEmptyLineBetween: true,
        },
        {
          groupName: 'typography',
          properties: typographyProperties,
          noEmptyLineBetween: true,
        },
        {
          groupName: 'interaction',
          properties: interactionProperties,
          noEmptyLineBetween: true,
        },
        {
          groupName: 'motion',
          properties: motionProperties,
          noEmptyLineBetween: true,
        },
      ],
      {
        unspecified: 'bottom',
        emptyLineBeforeUnspecified: 'never',
      },
    ],

    'alpha-value-notation': 'number',
    'color-function-notation': 'modern',
    'import-notation': 'string',
    'media-feature-range-notation': 'context',

    /**
     * Mantine/PostCSS preset:
     * - @mixin hover/light/dark/etc.
     * - rem(), em()
     * - light-dark()
     */
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['mixin', 'custom-media'],
      },
    ],

    'function-no-unknown': [
      true,
      {
        ignoreFunctions: ['rem', 'em', 'light-dark'],
      },
    ],

    /**
     * CSS Modules + Mantine:
     * - own classes: camelCase
     * - states/utilities: is-*, has-*, u-*
     * - Mantine static selectors: .mantine-Button-root
     */
    'selector-class-pattern': ownClassNamePattern,

    /**
     * Keep design tokens predictable:
     * --mantine-color-blue-6 ✅
     * --app-shell-height ✅
     * --appShellHeight ❌
     */
    'custom-property-pattern': customPropertyPattern,

    /**
     * CSS Modules/Mantine often produce intentional selector ordering
     * that triggers false positives, especially with nesting and :global().
     */
    'no-descending-specificity': null,

    /**
     * Property groups are already controlled by stylelint-order.
     */
    'declaration-empty-line-before': null,

    /**
     * Required for SVG values like viewBox-related keywords.
     */
    'value-keyword-case': [
      'lower',
      {
        camelCaseSvgKeywords: true,
      },
    ],
  },

  overrides: [
    {
      files: ['**/*.module.css'],
      rules: {
        /**
         * CSS Modules / ICSS syntax.
         */
        'selector-pseudo-class-no-unknown': [
          true,
          {
            ignorePseudoClasses: ['global', 'local', 'export', 'import'],
          },
        ],

        'property-no-unknown': [
          true,
          {
            ignoreProperties: ['composes'],
          },
        ],

        'at-rule-no-unknown': [
          true,
          {
            ignoreAtRules: ['mixin', 'custom-media', 'value'],
          },
        ],
      },
    },
  ],
};
