import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'index',
    {
      type: 'category',
      label: 'ARCHITECTURE',
      items: [
        'architecture',
        'architecture-level-1-system-context',
        'architecture-level-2-containers',
        'architecture-modules-and-delivery',
        'architecture-environments-and-hosting',
      ],
    },
    {
      type: 'category',
      label: 'DATABASE',
      items: ['database'],
    },
    {
      type: 'category',
      label: 'INSTALLATION',
      items: ['installation'],
    },
    {
      type: 'category',
      label: 'MY GEOFARM',
      items: [
        'mygeofarm',
        'mygeofarm-dashboard',
        'mygeofarm-api',
      ],
    },
    {
      type: 'category',
      label: 'MY FARMTREES',
      items: [
        'myfarmtrees',
        'myfarmtrees-collector',
        'myfarmtrees-nursery',
        'myfarmtrees-planting',
        'myfarmtrees-audit',
        'myfarmtrees-api',
      ],
    },
  ],
};

export default sidebars;
