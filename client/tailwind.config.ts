import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			white: '#ffffff',
  			primary: {
  				'50': '#f3f3ff',
  				'100': '#eaebfd',
  				'200': '#d7d7fd',
  				'300': '#b8b7fb',
  				'400': '#958ff6',
  				'500': '#7161f1',
  				'600': '#5030e5',
  				'700': '#4e2ed3',
  				'800': '#4126b1',
  				'900': '#382191',
  				'950': '#201362'
  			},
  			secondary: {
  				'50': '#f2f5fb',
  				'100': '#e7edf8',
  				'200': '#d3ddf2',
  				'300': '#b9c7e8',
  				'400': '#9cabdd',
  				'500': '#838fd1',
  				'600': '#6a71c1',
  				'700': '#595ea9',
  				'800': '#4a4e89',
  				'900': '#41466e',
  				'950': '#141522'
  			},
  			gray: {
  				'50': '#f5f6f8',
  				'100': '#eeeef1',
  				'200': '#dfdfe6',
  				'300': '#cbcbd6',
  				'400': '#b6b5c4',
  				'500': '#a3a1b3',
  				'600': '#908c9f',
  				'700': '#787486',
  				'800': '#656271',
  				'900': '#55525d',
  				'950': '#313036'
  			},
  			green: {
  				'50': '#f4faf3',
  				'100': '#e4f4e4',
  				'200': '#cce7cb',
  				'300': '#a2d4a1',
  				'400': '#68b266',
  				'500': '#4f9a4d',
  				'600': '#3c7e3b',
  				'700': '#326431',
  				'800': '#2b502b',
  				'900': '#244324',
  				'950': '#102311'
  			},
  			red: {
  				'50': '#fcf5f4',
  				'100': '#fae9e9',
  				'200': '#f5d6d8',
  				'300': '#edb4b7',
  				'400': '#e28a91',
  				'500': '#d8727d',
  				'600': '#bd4154',
  				'700': '#9f3145',
  				'800': '#852c3e',
  				'900': '#73283a',
  				'950': '#3f121c'
  			},
  			orange: {
  				'50': '#fbf6ef',
  				'100': '#f4e5d1',
  				'200': '#e9c89e',
  				'300': '#dda86c',
  				'400': '#d58d49',
  				'500': '#cc6f34',
  				'600': '#b4542b',
  				'700': '#963d27',
  				'800': '#7b3225',
  				'900': '#662a21',
  				'950': '#39140f'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
