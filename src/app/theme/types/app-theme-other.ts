export interface AppThemeOther {
  surface: {
    background: string;
    paper: string;
    raised: string;
    subtleSurface: string;
    glass: string;
    glassStrong: string;
    glassBorder: string;
    shell: string;
    ambientA: string;
    ambientB: string;
    highlight: string;
    haze: string;
  };
  border: {
    default: string;
    strong: string;
  };
  text: {
    primary: string;
    secondary: string;
  };
  focus: {
    ring: string;
    offset: string;
    width: string;
  };
  intent: {
    primary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  shell: {
    headerHeight: string;
    bottomNavHeight: string;
  };
  scanner: {
    overlay: string;
  };
  sync: {
    offline: string;
    pending: string;
    synced: string;
    error: string;
  };
}
