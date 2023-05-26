import { AppProps } from 'next/app';
import Head from 'next/head';
import { AppShell, ActionIcon, Burger, MediaQuery, Header, MantineProvider, Navbar, Title, ColorScheme, ColorSchemeProvider, Text, useMantineTheme, Group, Space } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks'
import { Notifications } from '@mantine/notifications'
import { useState } from 'react';
import { PageLinks, AuthLinks, DeauthLinks } from '../components/PageLinks';
import { TruckDelivery, CreativeCommons } from 'tabler-icons-react'
import { SessionProvider } from 'next-auth/react'

export default function App(props) {
  const {Component, pageProps: {session, ...pageProps}} = props
  const [colorScheme, setColorScheme] = useLocalStorage({
    key: 'mantine-color-scheme',
    defaultValue: "dark"
  })
  const [opened, setOpened] = useState(false)
  const theme = useMantineTheme()

  return (
    <SessionProvider session={session}>
      <ColorSchemeProvider colorScheme={colorScheme}>
        <MantineProvider 
          withGlobalStyles
          withNormalizeCSS
          theme={{ colorScheme: "dark"}}
        >
          <Notifications/>
          <AppShell
            // navbarOffsetBreakpoint controls when navbar should no longer be offset with padding-left
            navbarOffsetBreakpoint="sm"
            // fixed prop on AppShell will be automatically added to Header and Navbar
            fixed
            navbar={
              <Navbar
                p="md"
                // Breakpoint at which navbar will be hidden if hidden prop is true
                hiddenBreakpoint="sm"
                // Hides navbar when viewport size is less than value specified in hiddenBreakpoint
                hidden={!opened}
                // when viewport size is less than theme.breakpoints.sm navbar width is 100%
                // viewport size > theme.breakpoints.sm – width is 300px
                // viewport size > theme.breakpoints.lg – width is 400px
                width={{ sm: 300, lg: 350 }}
              >
                <Navbar.Section grow>
                  <Title order={4}>Navigation</Title>
                  <PageLinks/>
                  <Space h="md"/>
                  <Title order={4}>Authentication</Title>
                  <AuthLinks/>
                </Navbar.Section>
                <Navbar.Section bottom={0}>
                  <Group position="apart">
                    <Text align="center">BNE To-Go</Text>
                    <Group>
                      <Text>Food Truck Data </Text>
                      <CreativeCommons size={18}/>
                      <Text>Brisbane City Council</Text>
                    </Group>
                  </Group>
                </Navbar.Section>
              </Navbar>
            }
            header={
              <Header height={60} p="md">
                {/* Handle other responsive styles with MediaQuery component or createStyles function */}
                <div style={{ display: 'flex', justifyContent: "space-between"}}>
                  <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                    <Burger
                      opened={opened}
                      onClick={() => setOpened((o) => !o)}
                      size="sm"
                      color={theme.colors.gray[6]}
                      mr="xl"
                    />
                  </MediaQuery>
                  <Group>
                    <ActionIcon color="orange" size="md" variant="filled">
                      <TruckDelivery/>
                    </ActionIcon>
                    <Title order={3}>BNE To-Go</Title>
                  </Group>
                </div>
              </Header>
            }
          >
            <Component {...pageProps}/>
          </AppShell>
        </MantineProvider>
      </ColorSchemeProvider>
    </SessionProvider>
  );
}