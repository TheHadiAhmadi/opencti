import React, { FunctionComponent, useContext } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ThemeOptions } from '@mui/material/styles/createTheme';
import { UserContext, UserContextType } from '../utils/hooks/useAuth';
import themeDark from './ThemeDark';
import themeLight from './ThemeLight';
import { useDocumentFaviconModifier, useDocumentTitleModifier, useDocumentThemeModifier, useDocumentDirectionModifier } from '../utils/hooks/useDocumentModifier';
import { AppThemeProvider_settings$data } from './__generated__/AppThemeProvider_settings.graphql';
import rtlPlugin from 'stylis-plugin-rtl';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { prefixer } from 'stylis';
import { useIntl } from 'react-intl';

const cacheRTL = createCache({
  key: 'mui-style-rtl',
  prepend: true,
  stylisPlugins: [prefixer, rtlPlugin],
});

interface AppThemeProviderProps {
  children: React.ReactNode;
  settings: AppThemeProvider_settings$data;
}

const themeBuilder = (
  settings: AppThemeProvider_settings$data,
  themeColor: string,
  direction: "rtl" | 'ltr'
) => {
  if (themeColor === 'light') {
    const platformThemeLightLogo = settings?.platform_theme_light_logo ?? null;
    const platformThemeLightLogoCollapsed = settings?.platform_theme_light_logo_collapsed ?? null;
    const platformThemeLightBackground = settings?.platform_theme_light_background ?? null;
    const platformThemeLightPaper = settings?.platform_theme_light_paper ?? null;
    const platformThemeLightNav = settings?.platform_theme_light_nav ?? null;
    const platformThemeLightPrimary = settings?.platform_theme_light_primary ?? null;
    const platformThemeLightSecondary = settings?.platform_theme_light_secondary ?? null;
    const platformThemeLightAccent = settings?.platform_theme_light_accent ?? null;
    return themeLight(
      platformThemeLightLogo,
      platformThemeLightLogoCollapsed,
      platformThemeLightBackground,
      platformThemeLightPaper,
      platformThemeLightNav,
      platformThemeLightPrimary,
      platformThemeLightSecondary,
      platformThemeLightAccent,
      direction
    );
  }
  const platformThemeDarkLogo = settings?.platform_theme_dark_logo ?? null;
  const platformThemeDarkLogoCollapsed = settings?.platform_theme_dark_logo_collapsed ?? null;
  const platformThemeDarkBackground = settings?.platform_theme_dark_background ?? null;
  const platformThemeDarkPaper = settings?.platform_theme_dark_paper ?? null;
  const platformThemeDarkNav = settings?.platform_theme_dark_nav ?? null;
  const platformThemeDarkPrimary = settings?.platform_theme_dark_primary ?? null;
  const platformThemeDarkSecondary = settings?.platform_theme_dark_secondary ?? null;
  const platformThemeDarkAccent = settings?.platform_theme_dark_accent ?? null;
  return themeDark(
    platformThemeDarkLogo,
    platformThemeDarkLogoCollapsed,
    platformThemeDarkBackground,
    platformThemeDarkPaper,
    platformThemeDarkNav,
    platformThemeDarkPrimary,
    platformThemeDarkSecondary,
    platformThemeDarkAccent,
    direction
  );
};

const AppThemeProvider: FunctionComponent<AppThemeProviderProps> = ({
  children,
  settings,
}) => {
  const { me } = useContext<UserContextType>(UserContext);
  const platformTitle = settings?.platform_title ?? 'OpenCTI - Cyber Threat Intelligence Platform';
  useDocumentTitleModifier(platformTitle);
  useDocumentFaviconModifier(settings?.platform_favicon);
  const intl = useIntl()
  const direction = intl.locale === 'fa-ir' ? 'rtl' : 'ltr'
  // region theming
  const defaultTheme = settings?.platform_theme ?? null;
  const platformTheme = defaultTheme !== null && defaultTheme !== 'auto' ? defaultTheme : 'dark';
  const theme = me?.theme && me.theme !== 'default' ? me.theme : platformTheme;
  const themeComponent = themeBuilder(settings, theme, direction);
  const muiTheme = createTheme(themeComponent as ThemeOptions);
  useDocumentThemeModifier(theme);
  useDocumentDirectionModifier(direction);
  // endregion
  if (direction === "rtl") {
    return (
      <CacheProvider value={cacheRTL}>
          <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
      </CacheProvider>
    );
  }
  return (
    <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
  );
};

export const ConnectedThemeProvider = createFragmentContainer(
  AppThemeProvider,
  {
    settings: graphql`
      fragment AppThemeProvider_settings on Settings {
        platform_title
        platform_favicon
        platform_theme
        platform_theme_dark_background
        platform_theme_dark_paper
        platform_theme_dark_nav
        platform_theme_dark_primary
        platform_theme_dark_secondary
        platform_theme_dark_accent
        platform_theme_dark_logo
        platform_theme_dark_logo_collapsed
        platform_theme_light_background
        platform_theme_light_paper
        platform_theme_light_nav
        platform_theme_light_primary
        platform_theme_light_secondary
        platform_theme_light_accent
        platform_theme_light_logo
        platform_theme_light_logo_collapsed
      }
    `,
  },
);

export default AppThemeProvider;
