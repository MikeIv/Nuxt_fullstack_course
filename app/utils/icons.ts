/** Иконки интерфейса: только контурные, 24×24, рисуются одним `path`. */
export type IconName =
  | 'arrow-right'
  | 'arrow-left'
  | 'arrow-up'
  | 'check'
  | 'copy'
  | 'external'
  | 'menu'
  | 'close'
  | 'book'
  | 'terminal'
  | 'link'
  | 'refresh'
  | 'print'
  | 'circle'

const ICON_PATHS: Record<IconName, string> = {
  'arrow-right': 'M4 12h15M13 5l7 7-7 7',
  'arrow-left': 'M20 12H5M11 5l-7 7 7 7',
  'arrow-up': 'M12 20V5M5 11l7-7 7 7',
  check: 'M4 12.5 9.5 18 20 6',
  copy: 'M9 9h9v11H9zM6 15H4V4h11v2',
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  book: 'M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 0-2 2z',
  terminal: 'M5 7l5 5-5 5M13 17h6',
  link: 'M10 14a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1',
  refresh: 'M20 11a8 8 0 1 0-2 6M20 4v7h-7',
  print:
    'M7 8V4h10v4M7 18H5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2M7 14h10v6H7z',
  circle: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
}

export function iconPath(name: IconName): string {
  return ICON_PATHS[name]
}
