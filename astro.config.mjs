// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://github.com/gustavomota7',
	integrations: [
		starlight({
			title: 'hi',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/gustavomota7' }],
			sidebar: [
				{
					label: 'about',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'about', slug: 'about/me' },
					],
				},
				{
					label: 'mac0350',
					autogenerate: { directory: 'mac0350' },
				},
			],
		}),
	],
});
