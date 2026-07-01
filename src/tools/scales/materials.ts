/*
 * Fretboard neck materials. Each swaps the board gradient plus the
 * fret-wire / nut / string / grain / inlay colors. Values from the README
 * "Materials (fretboard neck)" table.
 */

export interface Material {
  board: string
  fret: string
  nut: string
  str: string
  grain: string
  inlay: string
}

export const MATERIALS: Record<string, Material> = {
  Walnut: {
    board: 'linear-gradient(180deg,#3b2d21,#2d2118 52%,#221811)',
    fret: 'rgba(222,228,240,0.14)',
    nut: '#e4dabf',
    str: '#b3b9c6',
    grain: 'rgba(0,0,0,0.16)',
    inlay: 'rgba(232,237,247,0.20)',
  },
  Graphite: {
    board: 'linear-gradient(180deg,#2b313a,#1e242d 52%,#161b22)',
    fret: 'rgba(222,228,240,0.16)',
    nut: '#d2d8e2',
    str: '#c1c7d4',
    grain: 'rgba(0,0,0,0.20)',
    inlay: 'rgba(232,237,247,0.20)',
  },
  Maple: {
    board: 'linear-gradient(180deg,#d8c39c,#c7ac7c 52%,#b69a6c)',
    fret: 'rgba(60,45,22,0.30)',
    nut: '#7a6840',
    str: '#6c7280',
    grain: 'rgba(120,90,40,0.12)',
    inlay: 'rgba(70,55,25,0.45)',
  },
}

export const MATERIAL_NAMES = Object.keys(MATERIALS)
