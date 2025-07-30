const tailwindColorHexMap: Record<string, string> = {
  // Primary
  "primary-50": "#f3f3ff",
  "primary-100": "#eaebfd",
  "primary-200": "#d7d7fd",
  "primary-300": "#b8b7fb",
  "primary-400": "#958ff6",
  "primary-500": "#7161f1",
  "primary-600": "#5030e5",
  "primary-700": "#4e2ed3",
  "primary-800": "#4126b1",
  "primary-900": "#382191",
  "primary-950": "#201362",

  // Secondary
  "secondary-50": "#f2f5fb",
  "secondary-100": "#e7edf8",
  "secondary-200": "#d3ddf2",
  "secondary-300": "#b9c7e8",
  "secondary-400": "#9cabdd",
  "secondary-500": "#838fd1",
  "secondary-600": "#6a71c1",
  "secondary-700": "#595ea9",
  "secondary-800": "#4a4e89",
  "secondary-900": "#41466e",
  "secondary-950": "#141522",

  // Gray
  "gray-50": "#f5f6f8",
  "gray-100": "#eeeef1",
  "gray-200": "#dfdfe6",
  "gray-300": "#cbcbd6",
  "gray-400": "#b6b5c4",
  "gray-500": "#a3a1b3",
  "gray-600": "#908c9f",
  "gray-700": "#787486",
  "gray-800": "#656271",
  "gray-900": "#55525d",
  "gray-950": "#313036",

  // Green
  "green-50": "#f4faf3",
  "green-100": "#e4f4e4",
  "green-200": "#cce7cb",
  "green-300": "#a2d4a1",
  "green-400": "#68b266",
  "green-500": "#4f9a4d",
  "green-600": "#3c7e3b",
  "green-700": "#326431",
  "green-800": "#2b502b",
  "green-900": "#244324",
  "green-950": "#102311",

  // Red
  "red-50": "#fcf5f4",
  "red-100": "#fae9e9",
  "red-200": "#f5d6d8",
  "red-300": "#edb4b7",
  "red-400": "#e28a91",
  "red-500": "#d8727d",
  "red-600": "#bd4154",
  "red-700": "#9f3145",
  "red-800": "#852c3e",
  "red-900": "#73283a",
  "red-950": "#3f121c",

  // Orange
  "orange-50": "#fbf6ef",
  "orange-100": "#f4e5d1",
  "orange-200": "#e9c89e",
  "orange-300": "#dda86c",
  "orange-400": "#d58d49",
  "orange-500": "#cc6f34",
  "orange-600": "#b4542b",
  "orange-700": "#963d27",
  "orange-800": "#7b3225",
  "orange-900": "#662a21",
  "orange-950": "#39140f",

  // Yellow
  "yellow-50": "#fffdf4",
  "yellow-100": "#fff7e0",
  "yellow-200": "#fff0c2",  
  "yellow-300": "#ffeb99",
  "yellow-400": "#ffdf71",  
  "yellow-500": "#ffda4d",
  "yellow-600": "#fcd034",
  "yellow-700": "#f9b32c",
  "yellow-800": "#f7a025",
}

export function getHexFromTailwindColor(twColor: string): string | undefined {
  return tailwindColorHexMap[twColor]
}
